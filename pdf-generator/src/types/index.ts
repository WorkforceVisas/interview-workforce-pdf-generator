// Form submission types
export interface PersonalDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface ApplicationFormData {
  personalDetails: PersonalDetails;
  jobDescription: string;
  supportingDocument: File | null;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SubmissionResponse {
  applicationId: string;
  status: string;
  message: string;
}

export interface PdfGenerationResult {
  success: boolean;
  pdfPath?: string;
  downloadUrl?: string;
  error?: string;
}

// Database entity types (mirrors Prisma models)
export interface UserEntity {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationEntity {
  id: string;
  userId: string;
  jobDescription: string;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
  user?: UserEntity;
  documents?: DocumentEntity[];
  generatedPdf?: GeneratedPdfEntity;
}

export interface DocumentEntity {
  id: string;
  applicationId: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  path: string;
  extractedText?: string | null;
  processingStatus: DocumentProcessingStatus;
  uploadedAt: Date;
}

export interface GeneratedPdfEntity {
  id: string;
  applicationId: string;
  filename: string;
  path: string;
  size: number;
  generatedAt: Date;
  downloadCount: number;
  lastDownloadAt?: Date | null;
}

// Enums
export enum ApplicationStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

export enum DocumentProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

// Validation schemas
export interface FormValidationErrors {
  personalDetails?: Partial<Record<keyof PersonalDetails, string>>;
  jobDescription?: string;
  supportingDocument?: string;
}

// PDF Generation types
export interface PdfTemplateData {
  user: UserEntity;
  application: ApplicationEntity;
  extractedContent?: string;
  generatedDate?: string;
}

// File upload types
export interface FileUploadResult {
  success: boolean;
  filename?: string;
  path?: string;
  size?: number;
  error?: string;
}

// Error types
export class ValidationError extends Error {
  constructor(public errors: FormValidationErrors) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

export class FileProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileProcessingError';
  }
}

export class PdfGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PdfGenerationError';
  }
}
