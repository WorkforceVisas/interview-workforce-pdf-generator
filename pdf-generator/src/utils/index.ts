// Utility exports for clean imports
export { FileUtils, default as fileUtils } from './file.utils';
export { ValidationUtils, default as validationUtils } from './validation.utils';
export {
  ErrorUtils,
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  FileUploadError,
  PdfGenerationError,
  DatabaseError,
  default as errorUtils,
} from './error.utils';

// Re-export types for convenience
export type {
  ApiError,
  ErrorResponse,
  ApplicationFormData,
} from '../types';

// Utility function for combining class names
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}