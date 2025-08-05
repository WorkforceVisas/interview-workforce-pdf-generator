import path from 'path';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

/**
 * File utility functions for handling file operations
 */

export const FileUtils = {
  /**
   * Generate a unique filename while preserving the original extension
   */
  generateUniqueFileName(originalName: string, prefix?: string): string {
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    const timestamp = Date.now();
    const uuid = uuidv4().split('-')[0]; // Use first part of UUID for brevity
    
    const parts = [prefix, baseName, timestamp, uuid].filter(Boolean);
    return `${parts.join('-')}${extension}`;
  },

  /**
   * Sanitize filename to remove potentially dangerous characters
   */
  sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace non-alphanumeric chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .toLowerCase();
  },

  /**
   * Get file extension from filename or path
   */
  getFileExtension(fileName: string): string {
    return path.extname(fileName).toLowerCase();
  },

  /**
   * Get filename without extension
   */
  getFileNameWithoutExtension(fileName: string): string {
    return path.basename(fileName, path.extname(fileName));
  },

  /**
   * Validate file extension against allowed types
   */
  isValidFileExtension(fileName: string, allowedExtensions: string[]): boolean {
    const extension = this.getFileExtension(fileName);
    return allowedExtensions.map(ext => ext.toLowerCase()).includes(extension);
  },

  /**
   * Format file size in human-readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Convert file size string to bytes
   */
  parseFileSize(sizeString: string): number {
    const units: Record<string, number> = {
      'b': 1,
      'bytes': 1,
      'kb': 1024,
      'mb': 1024 * 1024,
      'gb': 1024 * 1024 * 1024,
      'tb': 1024 * 1024 * 1024 * 1024,
    };

    const match = sizeString.toLowerCase().match(/^([0-9.]+)\s*([a-z]+)$/);
    if (!match) return 0;

    const [, size, unit] = match;
    const multiplier = units[unit] || 1;
    
    return parseFloat(size) * multiplier;
  },

  /**
   * Get MIME type from file extension
   */
  getMimeTypeFromExtension(fileName: string): string {
    const extension = this.getFileExtension(fileName);
    
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.rtf': 'application/rtf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.svg': 'image/svg+xml',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
      '.7z': 'application/x-7z-compressed',
    };

    return mimeTypes[extension] || 'application/octet-stream';
  },

  /**
   * Check if file is an image based on MIME type
   */
  isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  },

  /**
   * Check if file is a PDF
   */
  isPdfFile(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  },

  /**
   * Check if file is a document (PDF, DOC, DOCX, TXT, RTF)
   */
  isDocumentFile(mimeType: string): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf',
    ];
    
    return documentTypes.includes(mimeType);
  },

  /**
   * Generate a safe file path by joining path segments
   */
  safePath(...segments: string[]): string {
    // Remove any path traversal attempts
    const cleanSegments = segments.map(segment => 
      segment.replace(/\.\./g, '').replace(/[\/\\]/g, '_')
    );
    
    return path.join(...cleanSegments);
  },

  /**
   * Validate that a path is within a base directory (prevent path traversal)
   */
  isPathSafe(filePath: string, baseDir: string): boolean {
    const resolvedPath = path.resolve(baseDir, filePath);
    const resolvedBaseDir = path.resolve(baseDir);
    
    return resolvedPath.startsWith(resolvedBaseDir);
  },

  /**
   * Extract metadata from filename
   */
  extractFileMetadata(fileName: string): {
    name: string;
    extension: string;
    baseName: string;
    isHidden: boolean;
  } {
    const extension = this.getFileExtension(fileName);
    const baseName = this.getFileNameWithoutExtension(fileName);
    const isHidden = fileName.startsWith('.');
    
    return {
      name: fileName,
      extension,
      baseName,
      isHidden,
    };
  },

  /**
   * Generate a download filename for generated PDFs
   */
  generateDownloadFileName(
    userFirstName: string,
    userLastName: string,
    submissionId: string,
    timestamp?: Date
  ): string {
    const date = timestamp || new Date();
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const sanitizedFirstName = this.sanitizeFileName(userFirstName);
    const sanitizedLastName = this.sanitizeFileName(userLastName);
    const shortId = submissionId.split('-')[0]; // Use first part of UUID
    
    return `application_${sanitizedFirstName}_${sanitizedLastName}_${dateString}_${shortId}.pdf`;
  },

  /**
   * Validate file buffer content matches expected type
   */
  validateFileBuffer(buffer: Buffer, expectedMimeType: string): boolean {
    if (expectedMimeType === 'application/pdf') {
      // Check PDF magic number
      return buffer.length >= 4 && buffer.subarray(0, 4).toString() === '%PDF';
    }
    
    if (expectedMimeType === 'image/jpeg') {
      // Check JPEG magic number
      return buffer.length >= 2 && 
             buffer[0] === 0xFF && buffer[1] === 0xD8;
    }
    
    if (expectedMimeType === 'image/png') {
      // Check PNG magic number
      return buffer.length >= 8 && 
             buffer[0] === 0x89 && buffer[1] === 0x50 && 
             buffer[2] === 0x4E && buffer[3] === 0x47;
    }
    
    // For other types, assume valid if buffer has content
    return buffer.length > 0;
  },

  /**
   * Calculate file hash for duplicate detection
   */
  calculateFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  },

  /**
   * Get file type category
   */
  getFileCategory(mimeType: string): 'document' | 'image' | 'archive' | 'other' {
    if (this.isDocumentFile(mimeType)) return 'document';
    if (this.isImageFile(mimeType)) return 'image';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) {
      return 'archive';
    }
    return 'other';
  },

  /**
   * Create a temporary filename
   */
  createTempFileName(extension?: string): string {
    const uuid = uuidv4();
    const timestamp = Date.now();
    const ext = extension || '.tmp';
    
    return `temp_${timestamp}_${uuid}${ext}`;
  },

  /**
   * Parse content disposition header for filename
   */
  parseContentDisposition(header: string): string | null {
    const match = header.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
    if (match && match[1]) {
      return match[1].replace(/["']/g, '');
    }
    return null;
  },

  /**
   * Generate content disposition header
   */
  generateContentDisposition(fileName: string, inline: boolean = false): string {
    const disposition = inline ? 'inline' : 'attachment';
    const sanitizedName = fileName.replace(/["\\]/g, '');
    
    return `${disposition}; filename="${sanitizedName}"`;
  },
};

export default FileUtils;