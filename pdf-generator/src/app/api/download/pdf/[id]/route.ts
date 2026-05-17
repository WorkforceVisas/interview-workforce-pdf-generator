import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const params = await context.params;
    const applicationId = params.id;

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // Get application with PDF details
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        generatedPdf: true,
        user: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    if (!application.generatedPdf) {
      return NextResponse.json(
        { success: false, error: 'PDF not available for this application' },
        { status: 404 }
      );
    }

    // Check if application is expired
    if (application.status === 'EXPIRED') {
      return NextResponse.json(
        {
          success: false,
          error: 'Application has expired and PDF is no longer available',
        },
        { status: 410 }
      );
    }

    try {
      // Read PDF file
      const pdfBuffer = await readFile(application.generatedPdf.path);

      // Update download count
      await prisma.generatedPdf.update({
        where: { id: application.generatedPdf.id },
        data: {
          downloadCount: { increment: 1 },
          lastDownloadAt: new Date(),
        },
      });

      // Set appropriate headers for PDF download
      const headers = new Headers();
      headers.set('Content-Type', 'application/pdf');
      headers.set(
        'Content-Disposition',
        `attachment; filename="${application.generatedPdf.filename}"`
      );
      headers.set('Content-Length', pdfBuffer.length.toString());
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      headers.set('Pragma', 'no-cache');
      headers.set('Expires', '0');

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers,
      });
    } catch (fileError) {
      console.error('Error reading PDF file:', fileError);
      return NextResponse.json(
        { success: false, error: 'PDF file not found or corrupted' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('PDF download error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
