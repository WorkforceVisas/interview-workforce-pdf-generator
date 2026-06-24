import type { ErrorResponse } from '../types';

/**
 * Error handling utilities for consistent error management
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: Record<string, unknown>
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export const ErrorUtils = {
  /**
   * Create a standardized error response
   */
  createErrorResponse(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, unknown>
  ): ErrorResponse {
    return {
      success: false,
      error: message,
      code,
      statusCode,
      timestamp: new Date().toISOString(),
      details,
    };
  },

  /**
   * Create validation error response
   */
  createValidationError(
    message: string = 'Validation failed',
    validationErrors: Record<string, string> | string[]
  ): ErrorResponse {
    return this.createErrorResponse(
      message,
      400,
      'VALIDATION_ERROR',
      { validationErrors }
    );
  },

  /**
   * Create not found error response
   */
  createNotFoundError(resource: string = 'Resource'): ErrorResponse {
    return this.createErrorResponse(
      `${resource} not found`,
      404,
      'NOT_FOUND'
    );
  },

  /**
   * Create unauthorized error response
   */
  createUnauthorizedError(message: string = 'Unauthorized'): ErrorResponse {
    return this.createErrorResponse(
      message,
      401,
      'UNAUTHORIZED'
    );
  },

  /**
   * Create forbidden error response
   */
  createForbiddenError(message: string = 'Forbidden'): ErrorResponse {
    return this.createErrorResponse(
      message,
      403,
      'FORBIDDEN'
    );
  },

  /**
   * Create conflict error response
   */
  createConflictError(message: string = 'Resource already exists'): ErrorResponse {
    return this.createErrorResponse(
      message,
      409,
      'CONFLICT'
    );
  },

  /**
   * Create rate limit error response
   */
  createRateLimitError(message: string = 'Too many requests'): ErrorResponse {
    return this.createErrorResponse(
      message,
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  },

  /**
   * Create file upload error response
   */
  createFileUploadError(message: string = 'File upload failed'): ErrorResponse {
    return this.createErrorResponse(
      message,
      400,
      'FILE_UPLOAD_ERROR'
    );
  },

  /**
   * Create database error response
   */
  createDatabaseError(message: string = 'Database operation failed'): ErrorResponse {
    return this.createErrorResponse(
      message,
      500,
      'DATABASE_ERROR'
    );
  },

  /**
   * Create PDF generation error response
   */
  createPdfGenerationError(message: string = 'PDF generation failed'): ErrorResponse {
    return this.createErrorResponse(
      message,
      500,
      'PDF_GENERATION_ERROR'
    );
  },

  /**
   * Create file processing error response
   */
  createFileProcessingError(message: string = 'File processing failed'): ErrorResponse {
    return this.createErrorResponse(
      message,
      500,
      'FILE_PROCESSING_ERROR'
    );
  },

  /**
   * Handle and format Prisma errors
   */
  handlePrismaError(error: unknown): ErrorResponse {
    const prismaError = error as { 
      code?: string; 
      message?: string; 
      meta?: { target?: string[] | string; [key: string]: unknown } 
    };
    if (prismaError.code === 'P2002') {
      // Unique constraint violation
      const target = prismaError.meta?.target;
      const field = Array.isArray(target) ? target[0] : target || 'field';
      return this.createConflictError(`A record with this ${field} already exists`);
    }

    if (prismaError.code === 'P2025') {
      // Record not found
      return this.createNotFoundError('Record');
    }

    if (prismaError.code === 'P2003') {
      // Foreign key constraint violation
      return this.createErrorResponse(
        'Cannot perform operation due to related records',
        400,
        'FOREIGN_KEY_CONSTRAINT'
      );
    }

    if (prismaError.code === 'P2014') {
      // Required relation violation
      return this.createErrorResponse(
        'Required relation is missing',
        400,
        'REQUIRED_RELATION_MISSING'
      );
    }

    // Generic database error
    return this.createDatabaseError(
      process.env.NODE_ENV === 'development' 
        ? (prismaError as Error).message 
        : 'Database operation failed'
    );
  },

  /**
   * Handle file system errors
   */
  handleFileSystemError(error: unknown): ErrorResponse {
    const fsError = error as { code?: string; message?: string; path?: string };
    if (fsError.code === 'ENOENT') {
      return this.createNotFoundError('File');
    }

    if (fsError.code === 'EACCES' || fsError.code === 'EPERM') {
      return this.createErrorResponse(
        'Permission denied',
        403,
        'FILE_PERMISSION_DENIED'
      );
    }

    if (fsError.code === 'ENOSPC') {
      return this.createErrorResponse(
        'Insufficient storage space',
        507,
        'INSUFFICIENT_STORAGE'
      );
    }

    if (fsError.code === 'EMFILE' || fsError.code === 'ENFILE') {
      return this.createErrorResponse(
        'Too many open files',
        503,
        'TOO_MANY_FILES'
      );
    }

    return this.createErrorResponse(
      'File system operation failed',
      500,
      'FILE_SYSTEM_ERROR'
    );
  },

  /**
   * Handle network/HTTP errors
   */
  handleNetworkError(error: unknown): ErrorResponse {
    const networkError = error as { code?: string; message?: string; hostname?: string };
    if (networkError.code === 'ECONNREFUSED') {
      return this.createErrorResponse(
        'Connection refused',
        503,
        'CONNECTION_REFUSED'
      );
    }

    if (networkError.code === 'ETIMEDOUT') {
      return this.createErrorResponse(
        'Request timeout',
        408,
        'REQUEST_TIMEOUT'
      );
    }

    if (networkError.code === 'ENOTFOUND') {
      return this.createErrorResponse(
        'Host not found',
        503,
        'HOST_NOT_FOUND'
      );
    }

    return this.createErrorResponse(
      'Network error occurred',
      503,
      'NETWORK_ERROR'
    );
  },

  /**
   * Generic error handler that determines error type and creates appropriate response
   */
  handleError(error: unknown): ErrorResponse {
    // Handle AppError instances
    if (error instanceof AppError) {
      return this.createErrorResponse(
        error.message,
        error.statusCode,
        error.code,
        error.details
      );
    }

    // Handle standard Error instances
    if (error instanceof Error) {
      // Check for specific error types
      if ('code' in error) {
        const errorCode = (error as { code: string }).code;
        
        // Prisma errors
        if (typeof errorCode === 'string' && errorCode.startsWith('P')) {
          return this.handlePrismaError(error);
        }
        
        // File system errors
        if (['ENOENT', 'EACCES', 'EPERM', 'ENOSPC', 'EMFILE', 'ENFILE'].includes(errorCode)) {
          return this.handleFileSystemError(error);
        }
        
        // Network errors
        if (['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'].includes(errorCode)) {
          return this.handleNetworkError(error);
        }
      }

      // Generic error
      return this.createErrorResponse(
        process.env.NODE_ENV === 'development' 
          ? error.message 
          : 'An unexpected error occurred',
        500,
        'INTERNAL_ERROR'
      );
    }

    // Handle non-Error objects
    return this.createErrorResponse(
      'An unknown error occurred',
      500,
      'UNKNOWN_ERROR'
    );
  },

  /**
   * Log error with appropriate level
   */
  logError(error: unknown, context?: string): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${context}]` : '';

    if (error instanceof AppError) {
      if (error.isOperational) {
        console.warn(`${timestamp}${contextStr} Operational Error:`, {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode,
          details: error.details,
        });
      } else {
        console.error(`${timestamp}${contextStr} Programming Error:`, {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode,
          stack: error.stack,
          details: error.details,
        });
      }
    } else if (error instanceof Error) {
      console.error(`${timestamp}${contextStr} Error:`, {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    } else {
      console.error(`${timestamp}${contextStr} Unknown Error:`, error);
    }
  },

  /**
   * Check if error is operational (expected) or programming error
   */
  isOperationalError(error: unknown): boolean {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    return false;
  },

  /**
   * Extract error message safely
   */
  getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unknown error occurred';
  },

  /**
   * Create error for async route handlers
   */
  asyncHandler<T extends unknown[], R>(
    fn: (...args: T) => Promise<R>
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        this.logError(error, 'AsyncHandler');
        throw error;
      }
    };
  },

  /**
   * Retry operation with exponential backoff
   */
  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }

        // Don't retry operational errors
        if (this.isOperationalError(error)) {
          break;
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        this.logError(error, `RetryOperation (attempt ${attempt}/${maxRetries})`);
      }
    }

    throw lastError;
  },
};

// Predefined error classes for common scenarios
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND', true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT', true);
  }
}

export class FileUploadError extends AppError {
  constructor(message: string = 'File upload failed', details?: Record<string, unknown>) {
    super(message, 400, 'FILE_UPLOAD_ERROR', true, details);
  }
}

export class PdfGenerationError extends AppError {
  constructor(message: string = 'PDF generation failed', details?: Record<string, unknown>) {
    super(message, 500, 'PDF_GENERATION_ERROR', true, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details?: Record<string, unknown>) {
    super(message, 500, 'DATABASE_ERROR', true, details);
  }
}

export default ErrorUtils;