import { NextRequest, NextResponse } from 'next/server';
import { applicationService } from '../../../../../services/application.service';
import { ValidationUtils, ErrorUtils, ValidationError, NotFoundError, DatabaseError, PdfGenerationError } from '../../../../../utils';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * POST /api/submissions/[id]/reprocess
 * Reprocess a failed submission
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    
    if (!ValidationUtils.isValidUUID(id)) {
      return NextResponse.json(
        ErrorUtils.createValidationError('Invalid submission ID format', []),
        { status: 400 }
      );
    }

    const result = await applicationService.reprocessSubmission(id);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(`Error in POST /api/submissions/${params.id}/reprocess:`, error);
    
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
    
    if (error instanceof PdfGenerationError) {
      return NextResponse.json(
        ErrorUtils.createPdfGenerationError(error.message),
        { status: 500 }
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