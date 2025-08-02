import { NextRequest, NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { join } from 'path';

// Wrap imports in try-catch to catch import errors
let ApplicationService: any;
let FileService: any;
let PdfGenerationService: any;
let DocumentProcessingService: any;
let validateApplicationForm: any;
let types: any;

try {
  ({ ApplicationService } = await import('@/lib/services/ApplicationService'));
  ({ FileService } = await import('@/lib/services/FileService'));
  ({ PdfGenerationService } = await import(
    '@/lib/services/PdfGenerationService'
  ));
  ({ DocumentProcessingService } = await import(
    '@/lib/services/DocumentProcessingService'
  ));
  ({ validateApplicationForm } = await import('@/lib/validation'));
  types = await import('@/types');
} catch (importError) {
  console.error('Import error:', importError);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('POST /api/applications - Starting request processing');

    // Check if imports were successful
    if (
      !ApplicationService ||
      !FileService ||
      !PdfGenerationService ||
      !DocumentProcessingService ||
      !validateApplicationForm
    ) {
      console.error('Missing required imports');
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error - missing required services',
        },
        { status: 500 }
      );
    }

    // Parse multipart form data
    console.log('Parsing form data...');
    const formData = await request.formData();

    const personalDetailsJson = formData.get('personalDetails') as string;
    const jobDescription = formData.get('jobDescription') as string;
    const supportingDocument = formData.get(
      'supportingDocument'
    ) as File | null;

    console.log('Form data received:', {
      hasPersonalDetails: !!personalDetailsJson,
      hasJobDescription: !!jobDescription,
      hasDocument: !!supportingDocument,
      documentSize: supportingDocument?.size || 0,
    });

    if (!personalDetailsJson || !jobDescription) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Parse and validate data
    let personalDetails: any;
    try {
      personalDetails = JSON.parse(personalDetailsJson);
      console.log('Personal details parsed successfully');
    } catch (error) {
      console.error('Failed to parse personal details:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid personal details format',
        },
        { status: 400 }
      );
    }

    const applicationData = {
      personalDetails,
      jobDescription,
      supportingDocument,
    };

    // Validate form data
    console.log('Validating form data...');
    try {
      const validationErrors = validateApplicationForm(applicationData);
      if (Object.keys(validationErrors).length > 0) {
        console.log('Validation errors:', validationErrors);
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            data: validationErrors,
          },
          { status: 400 }
        );
      }
      console.log('Validation passed');
    } catch (validationError) {
      console.error('Validation function error:', validationError);
      return NextResponse.json(
        {
          success: false,
          error: 'Validation service error',
        },
        { status: 500 }
      );
    }

    // Initialize services
    console.log('Initializing services...');
    try {
      const applicationService = new ApplicationService();
      const fileService = new FileService();
      const documentProcessingService = new DocumentProcessingService();
      const pdfGenerationService = new PdfGenerationService();
      console.log('Services initialized successfully');

      // Create user and application
      console.log('Creating user...');
      const user = await applicationService.createUser(personalDetails);
      console.log('User created:', user.id);

      console.log('Creating application...');
      const application = await applicationService.createApplication(
        user.id,
        jobDescription
      );
      console.log('Application created:', application.id);

      let extractedText = '';

      // Process supporting document if provided
      if (supportingDocument && supportingDocument.size > 0) {
        console.log('Processing supporting document...');
        try {
          // Save uploaded file
          const uploadResult = await fileService.saveUploadedFile(
            supportingDocument
          );

          if (
            !uploadResult.success ||
            !uploadResult.filename ||
            !uploadResult.path
          ) {
            throw new Error(uploadResult.error || 'File upload failed');
          }

          // Debug logging
          console.log('File upload result:', {
            filename: uploadResult.filename,
            path: uploadResult.path,
            exists: existsSync(uploadResult.path),
            cwd: process.cwd(),
            uploadsDir: join(process.cwd(), 'uploads', 'documents'),
          });

          // Create document record
          const document = await applicationService.createDocument(
            application.id,
            {
              originalName: supportingDocument.name,
              filename: uploadResult.filename,
              mimeType: supportingDocument.type,
              size: supportingDocument.size,
              path: uploadResult.path,
            }
          );

          console.log('Document record created:', document.id);

          // Extract text from document (async)
          try {
            // IMPORTANT: Pass just the filename, not the full path
            console.log(
              'Calling extractText with filename:',
              uploadResult.filename
            );

            extractedText = await documentProcessingService.extractText(
              uploadResult.filename // Pass just the filename
            );

            // If the above doesn't work, try with the full path
            if (!extractedText || extractedText.includes('File not found')) {
              console.log('Retrying with full path:', uploadResult.path);
              extractedText = await documentProcessingService.extractText(
                uploadResult.path
              );
            }

            await applicationService.updateDocumentText(
              document.id,
              extractedText
            );
            console.log(
              'Text extracted successfully, length:',
              extractedText.length
            );
          } catch (textExtractionError) {
            console.warn('Text extraction failed:', textExtractionError);

            // Log more details about the error
            console.error('Extraction error details:', {
              message: textExtractionError.message,
              code: textExtractionError.code,
              stack: textExtractionError.stack,
              filename: uploadResult.filename,
              fullPath: uploadResult.path,
              fileExists: existsSync(uploadResult.path),
              alternativePath: join(
                process.cwd(),
                'uploads',
                'documents',
                uploadResult.filename
              ),
              alternativeExists: existsSync(
                join(
                  process.cwd(),
                  'uploads',
                  'documents',
                  uploadResult.filename
                )
              ),
            });

            // Provide a fallback message
            extractedText = `Document uploaded: ${supportingDocument.name}`;
          }
        } catch (fileError) {
          console.error('File processing failed:', fileError);
          await applicationService.updateApplicationStatus(
            application.id,
            'FAILED'
          );

          return NextResponse.json(
            {
              success: false,
              error:
                fileError instanceof Error
                  ? fileError.message
                  : 'Failed to process uploaded document',
            },
            { status: 500 }
          );
        }
      }

      // Generate PDF
      console.log('Generating PDF...');
      try {
        const pdfResult = await pdfGenerationService.generateApplicationPdf({
          user,
          application: { ...application, jobDescription },
          extractedContent: extractedText,
        });

        if (pdfResult.success && pdfResult.pdfPath) {
          console.log('PDF generated successfully:', pdfResult.pdfPath);

          // Save generated PDF record
          const generatedPdf = await applicationService.createGeneratedPdf(
            application.id,
            pdfResult.pdfPath
          );

          console.log('PDF record created:', generatedPdf.id);

          // Update application status
          await applicationService.updateApplicationStatus(
            application.id,
            'COMPLETED'
          );

          const response = {
            applicationId: application.id,
            status: 'COMPLETED',
            message:
              'Application submitted successfully! Your PDF is ready for download.',
          };

          console.log('Request completed successfully');

          return NextResponse.json({
            success: true,
            data: response,
            message: 'Application processed successfully',
          });
        } else {
          throw new Error(pdfResult.error || 'PDF generation failed');
        }
      } catch (pdfError) {
        console.error('PDF generation failed:', pdfError);
        await applicationService.updateApplicationStatus(
          application.id,
          'FAILED'
        );

        return NextResponse.json(
          {
            success: false,
            error:
              pdfError instanceof Error
                ? pdfError.message
                : 'Failed to generate PDF',
          },
          { status: 500 }
        );
      }
    } catch (serviceError) {
      console.error('Service error:', serviceError);
      return NextResponse.json(
        {
          success: false,
          error: `Service error: ${
            serviceError instanceof Error
              ? serviceError.message
              : 'Unknown service error'
          }`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Application submission error:', error);

    return NextResponse.json(
      {
        success: false,
        error: `Internal server error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('id');

    if (!applicationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application ID is required',
        },
        { status: 400 }
      );
    }

    if (!ApplicationService) {
      return NextResponse.json(
        {
          success: false,
          error: 'Service not available',
        },
        { status: 500 }
      );
    }

    const applicationService = new ApplicationService();
    const application = await applicationService.getApplicationWithDetails(
      applicationId
    );

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error('Get application error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
