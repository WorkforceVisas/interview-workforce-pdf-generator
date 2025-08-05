import { z } from 'zod';

// Application form validation schema
export const applicationFormSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\+]?[1-9][\d]{0,15}$/.test(val),
      'Please enter a valid phone number'
    ),
  
  jobDescription: z
    .string()
    .min(50, 'Job description must be at least 50 characters')
    .max(2000, 'Job description must be less than 2000 characters')
    .refine(
      (val) => val.trim().length > 0,
      'Job description cannot be empty'
    ),
});

// File validation schema
export const fileValidationSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 10 * 1024 * 1024, // 10MB
      'File size must be less than 10MB'
    )
    .refine(
      (file) => file.type === 'application/pdf',
      'Only PDF files are allowed'
    )
    .refine(
      (file) => file.name.length <= 255,
      'File name must be less than 255 characters'
    ),
});

// Combined form schema for complete validation
export const completeApplicationSchema = applicationFormSchema.extend({
  supportingDocument: fileValidationSchema.shape.file,
});

// API request schemas
export const createSubmissionSchema = z.object({
  firstName: applicationFormSchema.shape.firstName,
  lastName: applicationFormSchema.shape.lastName,
  email: applicationFormSchema.shape.email,
  phone: applicationFormSchema.shape.phone,
  jobDescription: applicationFormSchema.shape.jobDescription,
});

// Query parameter schemas
export const submissionQuerySchema = z.object({
  id: z.string().cuid('Invalid submission ID'),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'updatedAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Environment validation schema
export const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  UPLOADS_DIR: z.string().default('./uploads'),
  PDF_OUTPUT_DIR: z.string().default('./generated-pdfs'),
  MAX_FILE_SIZE: z.coerce.number().default(10 * 1024 * 1024), // 10MB
});

// Type exports for use in components
export type ApplicationFormData = z.infer<typeof applicationFormSchema>;
export type CompleteApplicationData = z.infer<typeof completeApplicationSchema>;
export type CreateSubmissionData = z.infer<typeof createSubmissionSchema>;
export type SubmissionQuery = z.infer<typeof submissionQuerySchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
export type EnvConfig = z.infer<typeof envSchema>;

// Validation helper functions
export const validateApplicationForm = (data: unknown) => {
  return applicationFormSchema.safeParse(data);
};

export const validateFile = (file: unknown) => {
  return fileValidationSchema.safeParse({ file });
};

export const validateCompleteApplication = (data: unknown) => {
  return completeApplicationSchema.safeParse(data);
};

// Custom validation utilities
export const isValidPdfFile = (file: File): boolean => {
  return file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024;
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
};

export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const sanitized = sanitizeFileName(originalName);
  const nameWithoutExt = sanitized.replace(/\.[^/.]+$/, '');
  const ext = sanitized.split('.').pop();
  
  return `${nameWithoutExt}_${timestamp}_${randomSuffix}.${ext}`;
};