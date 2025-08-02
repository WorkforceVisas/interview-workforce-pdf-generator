import { extname, join, isAbsolute, resolve } from 'path';
import { existsSync } from 'fs';
import { FileProcessingError } from '@/types';

// Import our production document extraction system
import {
  DocumentProcessor,
  ExtractionResult,
  ExtractionOptions,
  DocumentMetadata,
} from './document-extraction';

// Import specific extractors
import { PDFExtractor } from './document-extraction/extractors/pdf-extractor';
import { DocxExtractor } from './document-extraction/extractors/docx-extractor';
import { TextExtractor } from './document-extraction/extractors/text-extractor';

export class DocumentProcessingService {
  private documentProcessor: DocumentProcessor;
  private uploadsDir: string;

  constructor() {
    // Set the uploads directory
    this.uploadsDir = join(process.cwd(), 'uploads', 'documents');

    // Initialize the document processor with production configuration
    this.documentProcessor = new DocumentProcessor({
      enableCache: true,
      cacheSize: 100,
      cacheTTL: 3600000, // 1 hour
      extractors: [
        new TextExtractor(),
        new PDFExtractor(),
        new DocxExtractor(),
      ],
    });
  }

  /**
   * Extract text content from uploaded documents
   */
  async extractText(filePath: string): Promise<string> {
    try {
      console.log(
        'DocumentProcessingService.extractText called with:',
        filePath
      );

      // Resolve the full file path
      const resolvedPath = await this.resolveFilePath(filePath);

      console.log('Resolved path:', resolvedPath);
      console.log('File exists:', existsSync(resolvedPath));

      // Use our production document processor
      const result = await this.documentProcessor.process(resolvedPath, {
        extractMetadata: true,
        preserveFormatting: false,
        timeout: 30000, // 30 seconds timeout
      });

      console.log('Extraction result:', {
        success: result.success,
        textLength: result.text?.length,
        errors: result.errors,
        warnings: result.warnings,
      });

      if (result.success) {
        // Return the extracted text with metadata formatted
        return this.formatExtractionResult(result);
      } else {
        // Return a user-friendly message for failed extractions
        return this.formatFailedExtraction(filePath, result);
      }
    } catch (error) {
      console.error('Text extraction error:', error);

      // Handle specific error types
      if (error.code === 'FILE_NOT_FOUND' || error.code === 'ENOENT') {
        throw new FileProcessingError(`File not found: ${filePath}`);
      } else if (error.code === 'UNSUPPORTED_TYPE') {
        throw new FileProcessingError(
          `Unsupported file type: ${extname(filePath)}`
        );
      } else {
        throw error instanceof FileProcessingError
          ? error
          : new FileProcessingError('Failed to extract text from document');
      }
    }
  }

  /**
   * Resolve the file path, trying multiple strategies
   */
  private async resolveFilePath(filePath: string): Promise<string> {
    // If it's already an absolute path and exists, return it
    if (isAbsolute(filePath) && existsSync(filePath)) {
      return filePath;
    }

    // Extract just the filename
    const filename = filePath.split(/[\\\/]/).pop() || filePath;

    // Try different path resolution strategies
    const pathsToTry = [
      // If it's just a filename, try in uploads directory
      join(this.uploadsDir, filename),
      // Original path
      filePath,
      // If it starts with uploads/, resolve from project root
      join(process.cwd(), filePath),
      // Try resolving as-is
      resolve(filePath),
    ];

    // Try each path
    for (const tryPath of pathsToTry) {
      if (existsSync(tryPath)) {
        console.log('Found file at:', tryPath);
        return tryPath;
      }
    }

    // If none exist, log what we tried and throw error
    console.error('File not found. Tried paths:', pathsToTry);
    throw new FileProcessingError(`File not found: ${filePath}`);
  }

  /**
   * Extract text with advanced options
   */
  async extractTextAdvanced(
    filePath: string,
    options?: ExtractionOptions
  ): Promise<ExtractionResult> {
    const resolvedPath = await this.resolveFilePath(filePath);
    return await this.documentProcessor.process(resolvedPath, options);
  }

  /**
   * Process multiple documents in batch
   */
  async extractBatch(
    filePaths: string[],
    options?: ExtractionOptions
  ): Promise<Map<string, ExtractionResult>> {
    const resolvedPaths = await Promise.all(
      filePaths.map((path) => this.resolveFilePath(path).catch(() => path))
    );
    return await this.documentProcessor.processMultiple(resolvedPaths, options);
  }

  /**
   * Format successful extraction result
   */
  private formatExtractionResult(result: ExtractionResult): string {
    const { text, metadata } = result;
    const fileName = metadata.fileName;

    // For simple text files, just return the text
    if (['txt', 'md', 'log', 'csv'].includes(metadata.fileType)) {
      return text;
    }

    // For documents with metadata, include analysis
    let formattedOutput = text;

    if (metadata.pageCount || metadata.wordCount > 0) {
      formattedOutput += '\n\n📊 **Document Analysis:**';
      formattedOutput += `\n- File: ${fileName}`;

      if (metadata.pageCount) {
        formattedOutput += `\n- Pages: ${metadata.pageCount}`;
      }

      formattedOutput += `\n- Characters: ${metadata.characterCount}`;
      formattedOutput += `\n- Words: ${metadata.wordCount}`;

      if (metadata.author) {
        formattedOutput += `\n- Author: ${metadata.author}`;
      }

      if (metadata.title && metadata.title !== fileName) {
        formattedOutput += `\n- Title: ${metadata.title}`;
      }

      if (result.warnings && result.warnings.length > 0) {
        formattedOutput += '\n\n⚠️ **Warnings:**';
        result.warnings.forEach((warning) => {
          formattedOutput += `\n- ${warning}`;
        });
      }
    }

    return formattedOutput;
  }

  /**
   * Format failed extraction
   */
  private formatFailedExtraction(
    filePath: string,
    result: ExtractionResult
  ): string {
    const fileName = filePath.split(/[\\\/]/).pop() || 'document';
    const fileType = result.metadata.fileType.toUpperCase();

    let output = `${fileType} document uploaded successfully: ${fileName}\n\n`;
    output += '📄 **Document Information:**\n';
    output += `- File: ${fileName}\n`;
    output += `- Type: ${fileType} Document\n`;
    output += '- Status: Successfully stored\n';
    output += '- Location: Application file system\n\n';

    if (result.errors && result.errors.length > 0) {
      output += '❌ **Extraction Issues:**\n';
      result.errors.forEach((error) => {
        output += `- ${error}\n`;
      });
      output += '\n';
    }

    if (result.metadata.isEncrypted) {
      output += '🔒 **Security Notice:**\n';
      output +=
        'This document is password protected. Please provide the password to extract text.\n\n';
    }

    if (result.metadata.isScanned) {
      output += '📸 **OCR Notice:**\n';
      output +=
        'This appears to be a scanned document. OCR processing would be required to extract text.\n\n';
    }

    output +=
      'The document has been securely stored and is included in your application package.';

    return output;
  }

  /**
   * Get document metadata and basic info
   */
  async getDocumentInfo(filePath: string): Promise<{
    type: string;
    size: number;
    wordCount: number;
    charCount: number;
    hasText: boolean;
  }> {
    try {
      const resolvedPath = await this.resolveFilePath(filePath);
      const result = await this.documentProcessor.process(resolvedPath, {
        extractMetadata: true,
        maxPages: 1, // Just check first page for performance
      });

      return {
        type: extname(filePath).toLowerCase(),
        size: result.metadata.fileSize,
        wordCount: result.metadata.wordCount,
        charCount: result.metadata.characterCount,
        hasText: result.success && result.text.length > 0,
      };
    } catch (error) {
      console.error('Error getting document info:', error);
      throw new FileProcessingError('Failed to analyze document');
    }
  }

  /**
   * Clear the document cache
   */
  clearCache(): void {
    this.documentProcessor.clearCache();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hits: number; misses: number } {
    return this.documentProcessor.getCacheStats();
  }
}

// Export types for external use
export type {
  ExtractionResult,
  ExtractionOptions,
  DocumentMetadata,
} from './document-extraction';
