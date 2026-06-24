import { NextRequest, NextResponse } from 'next/server';
import { applicationService } from '../../../../../services/application.service';
import { ValidationUtils, ErrorUtils, ValidationError, NotFoundError, DatabaseError } from '../../../../../utils';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/submissions/[id]/download
 * Download the generated PDF for a submission
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    if (!ValidationUtils.isValidUUID(id)) {
      return NextResponse.json(
        ErrorUtils.createValidationError('Invalid submission ID format', []),
        { status: 400 }
      );
    }

    const downloadData = await applicationService.downloadSubmissionPdf(id);

    // Create response with PDF buffer
    const response = new NextResponse(downloadData.buffer, {
      status: 200,
      headers: {
        'Content-Type': downloadData.mimeType,
        'Content-Disposition': `attachment; filename="${downloadData.fileName}"`,
        'Content-Length': downloadData.buffer.length.toString(),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

    return response;
  } catch (error) {
    const { id } = await params;
    console.error(`Error in GET /api/submissions/${id}/download:`, error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        ErrorUtils.createValidationError(error.message, []),
        { status: 400 }
      );
    }
    
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        ErrorUtils.createNotFoundError('Submission'),
        { status: 404 }
      );
    }
    
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        ErrorUtils.createDatabaseError('Database operation failed'),
        { status: 500 }
      );
    }

    return NextResponse.json(
      ErrorUtils.createErrorResponse('Internal server error', 500, 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}