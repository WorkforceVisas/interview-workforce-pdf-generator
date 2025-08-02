import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';
import { FileUploadResult, FileProcessingError } from '@/types';

export class FileService {
  private uploadsDir: string;
  private maxFileSize: number;
  private allowedMimeTypes: string[];
  private allowedExtensions: string[];

  constructor() {
    this.uploadsDir = join(process.cwd(), 'uploads', 'documents');
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedMimeTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    this.allowedExtensions = ['.pdf', '.txt', '.doc', '.docx'];
  }

  /**
   * Save an uploaded file to the filesystem
   */
  async saveUploadedFile(file: File): Promise<FileUploadResult> {
    try {
      // Validate file
      this.validateFile(file);

      // Ensure upload directory exists
      await this.ensureUploadDirectory();

      // Generate unique filename
      const filename = this.generateUniqueFilename(file.name);
      const filePath = join(this.uploadsDir, filename);

      // Convert file to buffer and save
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await writeFile(filePath, buffer);

      return {
        success: true,
        filename,
        path: filePath,
        size: file.size,
      };
    } catch (error) {
      console.error('File upload error:', error);

      return {
        success: false,
        error:
          error instanceof FileProcessingError
            ? error.message
            : 'Failed to save uploaded file',
      };
    }
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: File): void {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new FileProcessingError(
        `File size exceeds maximum allowed size of ${
          this.maxFileSize / (1024 * 1024)
        }MB`
      );
    }

    // Check if file is empty
    if (file.size === 0) {
      throw new FileProcessingError('File is empty');
    }

    // Check MIME type
    if (!this.allowedMimeTypes.includes(file.type)) {
      throw new FileProcessingError(
        `File type ${
          file.type
        } is not supported. Allowed types: ${this.allowedMimeTypes.join(', ')}`
      );
    }

    // Check file extension
    const extension = extname(file.name).toLowerCase();
    if (!this.allowedExtensions.includes(extension)) {
      throw new FileProcessingError(
        `File extension ${extension} is not supported. Allowed extensions: ${this.allowedExtensions.join(
          ', '
        )}`
      );
    }

    // Additional security check - verify file name
    if (this.containsSuspiciousContent(file.name)) {
      throw new FileProcessingError('File name contains invalid characters');
    }
  }

  /**
   * Generate a unique filename
   */
  private generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = extname(originalName);
    const baseName = originalName.replace(extension, '').substring(0, 50);

    // Sanitize base name
    const sanitizedBaseName = baseName
      .replace(/[^a-zA-Z0-9\-_]/g, '_')
      .replace(/_{2,}/g, '_');

    return `${sanitizedBaseName}_${timestamp}_${randomString}${extension}`;
  }

  /**
   * Ensure upload directory exists
   */
  private async ensureUploadDirectory(): Promise<void> {
    if (!existsSync(this.uploadsDir)) {
      await mkdir(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Check for suspicious content in filename
   */
  private containsSuspiciousContent(filename: string): boolean {
    const suspiciousPatterns = [
      /\.\./, // Directory traversal
      /[<>:"|?*]/, // Invalid Windows characters
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows reserved names
      /^\./, // Hidden files starting with dot
      /\x00/, // Null bytes
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(filename));
  }

  /**
   * Get file mime type by reading file signature (magic numbers)
   */
  async getActualMimeType(filePath: string): Promise<string> {
    try {
      const fs = await import('fs/promises');
      const buffer = await fs.readFile(filePath);

      // Check file signatures
      if (buffer.length >= 4) {
        // PDF signature
        if (buffer.subarray(0, 4).toString() === '%PDF') {
          return 'application/pdf';
        }

        // DOC signature
        if (buffer.subarray(0, 8).toString('hex') === 'd0cf11e0a1b11ae1') {
          return 'application/msword';
        }

        // DOCX signature (ZIP-based)
        if (buffer.subarray(0, 4).toString('hex') === '504b0304') {
          return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }
      }

      // Default to text/plain for other files
      return 'text/plain';
    } catch (error) {
      console.error('Error detecting file type:', error);
      return 'application/octet-stream';
    }
  }

  /**
   * Validate file integrity after upload
   */
  async validateUploadedFile(filePath: string): Promise<boolean> {
    try {
      const fs = await import('fs/promises');
      const stats = await fs.stat(filePath);

      // Basic checks
      if (stats.size === 0) {
        throw new FileProcessingError('Uploaded file is empty');
      }

      if (stats.size > this.maxFileSize) {
        throw new FileProcessingError('Uploaded file exceeds size limit');
      }

      // Verify file can be read
      const buffer = await fs.readFile(filePath);
      if (buffer.length !== stats.size) {
        throw new FileProcessingError('File corruption detected');
      }

      return true;
    } catch (error) {
      console.error('File validation error:', error);
      return false;
    }
  }

  /**
   * Delete a file from the filesystem
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fs = await import('fs/promises');
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Get file size and basic metadata
   */
  async getFileMetadata(filePath: string): Promise<{
    size: number;
    exists: boolean;
    lastModified: Date | null;
    mimeType: string;
  }> {
    try {
      const fs = await import('fs/promises');
      const stats = await fs.stat(filePath);
      const mimeType = await this.getActualMimeType(filePath);

      return {
        size: stats.size,
        exists: true,
        lastModified: stats.mtime,
        mimeType,
      };
    } catch (error) {
      return {
        size: 0,
        exists: false,
        lastModified: null,
        mimeType: 'unknown',
      };
    }
  }

  /**
   * Scan for potentially malicious files (basic implementation)
   */
  async scanForMalware(
    filePath: string
  ): Promise<{ safe: boolean; details?: string }> {
    try {
      const fs = await import('fs/promises');
      const buffer = await fs.readFile(filePath);

      // Basic malware signatures (this is a simplified check)
      const maliciousSignatures = [
        Buffer.from('MZ'), // Executable files
        Buffer.from('<?php'), // PHP scripts
        Buffer.from('<script'), // JavaScript
      ];

      for (const signature of maliciousSignatures) {
        if (buffer.includes(signature)) {
          return {
            safe: false,
            details: 'Potentially malicious content detected',
          };
        }
      }

      return { safe: true };
    } catch (error) {
      console.error('Malware scan error:', error);
      return {
        safe: false,
        details: 'Unable to scan file for malware',
      };
    }
  }
}
