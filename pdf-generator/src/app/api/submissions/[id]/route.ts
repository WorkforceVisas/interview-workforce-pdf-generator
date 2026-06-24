import { NextRequest, NextResponse } from 'next/server';
import { applicationService } from '../../../../services/application.service';
import { ValidationUtils, ErrorUtils, ValidationError, NotFoundError, DatabaseError } from '../../../../utils';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/submissions/[id]
 * Get a specific submission by ID
 */
export async function GET(
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

    const submission = await applicationService.getSubmission(id);
    
    if (!submission) {
      return NextResponse.json(
        ErrorUtils.createNotFoundError('Submission'),
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error(`Error in GET /api/submissions/${params.id}:`, error);
    
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

/**
 * DELETE /api/submissions/[id]
 * Delete a specific submission
 */
export async function DELETE(
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

    await applicationService.deleteSubmission(id);

    return NextResponse.json({
      success: true,
      message: 'Submission deleted successfully',
    });
  } catch (error) {
    console.error(`Error in DELETE /api/submissions/${params.id}:`, error);
    
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