export interface ExtractionResult {
  success: boolean;
  text: string;
  metadata: DocumentMetadata;
  warnings: string[];
  errors: string[];
  confidence: number;
  processingTime: number;
}

export interface DocumentMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  encoding?: string;
  pageCount?: number;
  wordCount: number;
  characterCount: number;
  languageHints?: string[];
  author?: string;
  title?: string;
  subject?: string;
  createdDate?: Date;
  modifiedDate?: Date;
  producer?: string;
  hasImages?: boolean;
  hasTables?: boolean;
  hasFormFields?: boolean;
  isEncrypted?: boolean;
  isScanned?: boolean;
  extractionMethod?: string;
}

export interface ExtractionOptions {
  ocrEnabled?: boolean;
  ocrLanguages?: string[];
  preserveFormatting?: boolean;
  extractTables?: boolean;
  extractImages?: boolean;
  extractMetadata?: boolean;
  maxPages?: number;
  timeout?: number;
  encoding?: string;
  password?: string;
}

export class DocumentExtractionError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'DocumentExtractionError';
  }
}
