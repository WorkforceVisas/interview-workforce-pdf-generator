// Core domain types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Submission {
  id: string;
  userId: string;
  jobDescription: string;
  status: SubmissionStatus;
  generatedPdfPath?: string;
  uploadedFileName?: string;
  uploadedFilePath?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

// Enums
export enum SubmissionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  FAILED = 'failed',
}

// Form types
export interface ApplicationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobDescription: string;
  supportingDocument?: File;
}

export interface CreateSubmissionRequest {
  formData: ApplicationFormData;
  uploadedFile?: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    size: number;
  };
}



// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  statusCode?: number;
  timestamp?: string;
  details?: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

export interface SubmissionResponse {
  success: boolean;
  submissionId: string;
  pdfDownloadUrl: string;
  status: SubmissionStatus;
}

// PDF Generation types
export interface PdfGenerationOptions {
  includeDocumentContent?: boolean;
  includeMetadata?: boolean;
  documentContentLimit?: number;
  template?: 'standard' | 'professional' | 'minimal';
  orientation?: 'portrait' | 'landscape';
  fontSize?: number;
  pageSize?: 'A4' | 'Letter' | 'Legal';
  title?: string;
}

export interface PdfContent {
  userInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  jobDescription: string;
  documentInfo: {
    fileName: string;
    extractedText?: string;
    isIncluded: boolean;
  };
  metadata: {
    generatedAt: Date;
    submissionId: string;
  };
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FileUploadError {
  code: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'UPLOAD_FAILED';
  message: string;
  maxSize?: number;
  allowedTypes?: string[];
}

// PDF Processing types
export interface PdfProcessingResult {
  success: boolean;
  extractedText?: string;
  text?: string;
  extractedInfo?: Record<string, unknown>;
  wordCount?: number;
  characterCount?: number;
  metadata?: PdfMetadata;
  error?: string;
}

export interface PdfMetadata {
  pageCount?: number;
  pages?: number;
  info?: Record<string, unknown>;
  version?: string;
  text?: string;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  fileSize?: number;
}

// Configuration types
export interface AppConfig {
  maxFileSize: number;
  allowedFileTypes: string[];
  uploadsDirectory: string;
  pdfOutputDirectory: string;
}

export interface FileStorageConfig {
  uploadsDirectory?: string;
  uploadDir: string;
  maxFileSize: number;
  allowedFileTypes?: string[];
  allowedMimeTypes: string[];
  cleanupInterval?: number;
}

export interface StorageResult {
  success: boolean;
  filePath: string;
  fileName: string;
  fileSize?: number;
  error?: string;
}

export interface FileMetadata {
  fileName: string;
  filePath: string;
  fileSize: number;
  size: number;
  mimeType: string;
  createdAt: Date;
  lastModified: Date;
  modifiedAt: Date;
  isFile: boolean;
  isDirectory: boolean;
}

// Database types
export interface DatabaseUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseSubmission {
  id: string;
  userId: string;
  jobDescription: string;
  status: string;
  generatedPdfPath: string | null;
  createdAt: Date;
  updatedAt: Date;
}