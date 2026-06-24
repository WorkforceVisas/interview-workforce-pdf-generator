import { z } from 'zod';
import type { ApplicationFormData } from '../types';

/**
 * Validation utility functions
 */

export const ValidationUtils = {
  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  },

  /**
   * Validate phone number (supports various formats)
   */
  isValidPhoneNumber(phone: string): boolean {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Check if it's a valid length (10-15 digits)
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return false;
    }
    
    // More comprehensive phone validation
    const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{8,20}$/;
    return phoneRegex.test(phone.trim());
  },

  /**
   * Validate name (first name, last name)
   */
  isValidName(name: string): boolean {
    if (!name || name.trim().length < 2) return false;
    
    // Allow letters, spaces, hyphens, apostrophes
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    return nameRegex.test(name.trim()) && name.trim().length <= 50;
  },

  /**
   * Validate job description
   */
  isValidJobDescription(description: string): boolean {
    if (!description || description.trim().length < 10) return false;
    if (description.trim().length > 5000) return false;
    
    // Check for minimum word count
    const wordCount = description.trim().split(/\s+/).length;
    return wordCount >= 5;
  },

  /**
   * Validate file size
   */
  isValidFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
    return size > 0 && size <= maxSize;
  },

  /**
   * Validate file type
   */
  isValidFileType(mimeType: string, allowedTypes: string[] = ['application/pdf']): boolean {
    return allowedTypes.includes(mimeType);
  },

  /**
   * Validate CUID format (used by Prisma)
   */
  isValidUUID(uuid: string): boolean {
    // CUID format: starts with 'c' followed by 24 alphanumeric characters
    const cuidRegex = /^c[a-z0-9]{24}$/;
    return cuidRegex.test(uuid);
  },

  /**
   * Sanitize string input
   */
  sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>"'&]/g, '') // Remove potentially dangerous characters
      .replace(/\s+/g, ' '); // Normalize whitespace
  },

  /**
   * Validate and sanitize form data
   */
  validateAndSanitizeFormData(data: Partial<ApplicationFormData>): {
    isValid: boolean;
    errors: Record<string, string>;
    sanitizedData: Partial<ApplicationFormData>;
  } {
    const errors: Record<string, string> = {};
    const sanitizedData: Partial<ApplicationFormData> = {};

    // Validate and sanitize first name
    if (data.firstName !== undefined) {
      const sanitizedFirstName = this.sanitizeString(data.firstName);
      if (!this.isValidName(sanitizedFirstName)) {
        errors.firstName = 'First name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes';
      } else {
        sanitizedData.firstName = sanitizedFirstName;
      }
    }

    // Validate and sanitize last name
    if (data.lastName !== undefined) {
      const sanitizedLastName = this.sanitizeString(data.lastName);
      if (!this.isValidName(sanitizedLastName)) {
        errors.lastName = 'Last name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes';
      } else {
        sanitizedData.lastName = sanitizedLastName;
      }
    }

    // Validate email
    if (data.email !== undefined) {
      const sanitizedEmail = data.email.trim().toLowerCase();
      if (!this.isValidEmail(sanitizedEmail)) {
        errors.email = 'Please enter a valid email address';
      } else {
        sanitizedData.email = sanitizedEmail;
      }
    }

    // Validate phone (optional)
    if (data.phone !== undefined && data.phone.trim() !== '') {
      const sanitizedPhone = data.phone.trim();
      if (!this.isValidPhoneNumber(sanitizedPhone)) {
        errors.phone = 'Please enter a valid phone number';
      } else {
        sanitizedData.phone = sanitizedPhone;
      }
    }

    // Validate job description
    if (data.jobDescription !== undefined) {
      const sanitizedJobDescription = this.sanitizeString(data.jobDescription);
      if (!this.isValidJobDescription(sanitizedJobDescription)) {
        errors.jobDescription = 'Job description must be 10-5000 characters and contain at least 5 words';
      } else {
        sanitizedData.jobDescription = sanitizedJobDescription;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData,
    };
  },

  /**
   * Validate file upload
   */
  validateFileUpload(file: {
    name: string;
    size: number;
    type: string;
  }, options: {
    maxSize?: number;
    allowedTypes?: string[];
    maxNameLength?: number;
  } = {}): {
    isValid: boolean;
    errors: string[];
  } {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB
      allowedTypes = ['application/pdf'],
      maxNameLength = 255,
    } = options;

    const errors: string[] = [];

    // Validate file name
    if (!file.name || file.name.trim().length === 0) {
      errors.push('File name is required');
    } else if (file.name.length > maxNameLength) {
      errors.push(`File name must be less than ${maxNameLength} characters`);
    }

    // Validate file size
    if (!this.isValidFileSize(file.size, maxSize)) {
      errors.push(`File size must be less than ${this.formatFileSize(maxSize)}`);
    }

    // Validate file type
    if (!this.isValidFileType(file.type, allowedTypes)) {
      errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
    }

    // Check for potentially dangerous file names
    if (this.isDangerousFileName(file.name)) {
      errors.push('File name contains potentially dangerous characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Check if filename is potentially dangerous
   */
  isDangerousFileName(fileName: string): boolean {
    // Check for path traversal attempts
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return true;
    }

    // Check for executable extensions
    const dangerousExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js',
      '.jar', '.app', '.deb', '.pkg', '.dmg', '.sh', '.ps1'
    ];
    
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return dangerousExtensions.includes(extension);
  },

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Validate pagination parameters
   */
  validatePagination(page?: string | number, limit?: string | number): {
    page: number;
    limit: number;
    errors: string[];
  } {
    const errors: string[] = [];
    let validatedPage = 1;
    let validatedLimit = 10;

    // Validate page
    if (page !== undefined) {
      const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
      if (isNaN(pageNum) || pageNum < 1) {
        errors.push('Page must be a positive integer');
      } else if (pageNum > 1000) {
        errors.push('Page number is too large');
      } else {
        validatedPage = pageNum;
      }
    }

    // Validate limit
    if (limit !== undefined) {
      const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
      if (isNaN(limitNum) || limitNum < 1) {
        errors.push('Limit must be a positive integer');
      } else if (limitNum > 100) {
        errors.push('Limit cannot exceed 100');
      } else {
        validatedLimit = limitNum;
      }
    }

    return {
      page: validatedPage,
      limit: validatedLimit,
      errors,
    };
  },

  /**
   * Validate sort parameters
   */
  validateSort(sortBy?: string, sortOrder?: string): {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    errors: string[];
  } {
    const errors: string[] = [];
    const allowedSortFields = ['createdAt', 'updatedAt', 'firstName', 'lastName', 'email', 'status'];
    const allowedSortOrders = ['asc', 'desc'];

    let validatedSortBy = 'createdAt';
    let validatedSortOrder: 'asc' | 'desc' = 'desc';

    if (sortBy && !allowedSortFields.includes(sortBy)) {
      errors.push(`Sort field must be one of: ${allowedSortFields.join(', ')}`);
    } else if (sortBy) {
      validatedSortBy = sortBy;
    }

    if (sortOrder && !allowedSortOrders.includes(sortOrder)) {
      errors.push('Sort order must be either "asc" or "desc"');
    } else if (sortOrder) {
      validatedSortOrder = sortOrder as 'asc' | 'desc';
    }

    return {
      sortBy: validatedSortBy,
      sortOrder: validatedSortOrder,
      errors,
    };
  },

  /**
   * Validate environment variables
   */
  validateEnvironment(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required environment variables
    if (!process.env.DATABASE_URL) {
      errors.push('DATABASE_URL environment variable is required');
    }

    // Check optional but recommended variables
    if (!process.env.NODE_ENV) {
      warnings.push('NODE_ENV environment variable is not set');
    }

    // Validate DATABASE_URL format
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')) {
      warnings.push('DATABASE_URL should start with "file:" for SQLite');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  },

  /**
   * Create a validation error response
   */
  createValidationErrorResponse(errors: Record<string, string> | string[]): {
    success: false;
    error: string;
    details: Record<string, string> | string[];
  } {
    const errorMessage = Array.isArray(errors)
      ? 'Validation failed'
      : 'Form validation failed';

    return {
      success: false,
      error: errorMessage,
      details: errors,
    };
  },

  /**
   * Validate API request body against schema
   */
  validateRequestBody<T>(body: unknown, schema: z.ZodSchema<T>): {
    success: boolean;
    data?: T;
    errors?: string[];
  } {
    try {
      const validatedData = schema.parse(body);
      return {
        success: true,
        data: validatedData,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err: z.ZodIssue) => 
          `${err.path.join('.')}: ${err.message}`
        );
        return {
          success: false,
          errors,
        };
      }
      return {
        success: false,
        errors: ['Invalid request body'],
      };
    }
  },
};

export default ValidationUtils;