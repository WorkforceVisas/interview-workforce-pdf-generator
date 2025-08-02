import { readFile } from 'fs/promises';
import { extname } from 'path';
import { FileProcessingError } from '@/types';

// Import our production document extraction system
import {
  DocumentProcessor,
  ExtractionResult,
  ExtractionOptions,
  DocumentMetadata,
} from './document-extraction';

// Import specific extractors if we need to customize
import { PDFExtractor } from './document-extraction/extractors/pdf-extractor';
import { DocxExtractor } from './document-extraction/extractors/docx-extractor';
import { XlsxExtractor } from './document-extraction/extractors/xlsx-extractor';
import { PptxExtractor } from './document-extraction/extractors/pptx-extractor';
import { TextExtractor } from './document-extraction/extractors/text-extractor';

export class DocumentProcessingService {
  private documentProcessor: DocumentProcessor;

  constructor() {
    // Initialize the document processor with production configuration
    this.documentProcessor = new DocumentProcessor({
      enableCache: true,
      cacheSize: 100,
      cacheTTL: 3600000, // 1 hour
      extractors: [
        new TextExtractor(),
        new PDFExtractor(),
        new DocxExtractor(),
        new XlsxExtractor(),
        new PptxExtractor(),
      ],
    });
  }

  /**
   * Extract text content from uploaded documents
   * This method maintains backward compatibility with the existing interface
   */
  async extractText(filePath: string): Promise<string> {
    try {
      // Use our production document processor
      const result = await this.documentProcessor.process(filePath, {
        extractMetadata: true,
        preserveFormatting: false,
        timeout: 30000, // 30 seconds timeout
      });

      if (result.success) {
        // Return the extracted text with metadata formatted as before
        return this.formatExtractionResult(result);
      } else {
        // Return a user-friendly message for failed extractions
        return this.formatFailedExtraction(filePath, result);
      }
    } catch (error) {
      console.error('Text extraction error:', error);

      // Handle specific error types
      if (error.code === 'FILE_NOT_FOUND') {
        throw new FileProcessingError('File not found');
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
   * Extract text with advanced options
   */
  async extractTextAdvanced(
    filePath: string,
    options?: ExtractionOptions
  ): Promise<ExtractionResult> {
    return await this.documentProcessor.process(filePath, options);
  }

  /**
   * Process multiple documents in batch
   */
  async extractBatch(
    filePaths: string[],
    options?: ExtractionOptions
  ): Promise<Map<string, ExtractionResult>> {
    return await this.documentProcessor.processMultiple(filePaths, options);
  }

  /**
   * Format successful extraction result for backward compatibility
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

      if (metadata.confidence && metadata.confidence < 80) {
        formattedOutput += `\n- Quality: ${this.getQualityLabel(
          metadata.confidence
        )}`;
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
   * Format failed extraction for backward compatibility
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

    // Add helpful suggestions based on the file type
    output += '💡 **Suggestions:**\n';

    switch (result.metadata.fileType) {
      case 'pdf':
        if (!result.metadata.isScanned && !result.metadata.isEncrypted) {
          output +=
            '- Ensure pdf-parse or pdfjs-dist is installed: `npm install pdf-parse`\n';
        }
        if (result.metadata.isScanned) {
          output += '- Enable OCR support for scanned documents\n';
        }
        break;
      case 'docx':
        output += '- Ensure mammoth is installed: `npm install mammoth`\n';
        break;
      case 'xlsx':
      case 'xls':
        output += '- Ensure xlsx is installed: `npm install xlsx`\n';
        break;
      case 'doc':
        output += '- Convert to .docx format for better compatibility\n';
        break;
    }

    output +=
      '\nThe document has been securely stored and is included in your application package.';

    return output;
  }

  /**
   * Get quality label based on confidence score
   */
  private getQualityLabel(confidence: number): string {
    if (confidence >= 90) return 'Excellent';
    if (confidence >= 70) return 'Good';
    if (confidence >= 50) return 'Fair';
    return 'Poor';
  }

  /**
   * Get document metadata and basic info (backward compatibility)
   */
  async getDocumentInfo(filePath: string): Promise<{
    type: string;
    size: number;
    wordCount: number;
    charCount: number;
    hasText: boolean;
  }> {
    try {
      const result = await this.documentProcessor.process(filePath, {
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
   * Validate that extracted text makes sense (backward compatibility)
   */
  validateExtractedText(text: string): {
    isValid: boolean;
    issues: string[];
    confidence: number;
  } {
    const issues: string[] = [];
    let confidence = 100;

    if (!text || text.trim().length === 0) {
      issues.push('No text content found');
      confidence = 0;
    } else {
      // Check for minimum meaningful content
      if (text.length < 10) {
        issues.push('Text content too short');
        confidence -= 30;
      }

      // Check for excessive special characters
      const specialCharRatio =
        (text.match(/[^\w\s]/g) || []).length / text.length;
      if (specialCharRatio > 0.3) {
        issues.push('High ratio of special characters detected');
        confidence -= 20;
      }

      // Check for reasonable word structure
      const words = text.split(/\s+/).filter((word) => word.length > 0);
      if (words.length > 0) {
        const avgWordLength =
          words.reduce((sum, word) => sum + word.length, 0) / words.length;

        if (avgWordLength < 2 || avgWordLength > 15) {
          issues.push('Unusual word length distribution');
          confidence -= 15;
        }
      }

      // Check for readable English content
      const commonWords = [
        'the',
        'and',
        'or',
        'but',
        'in',
        'on',
        'at',
        'to',
        'for',
        'of',
        'with',
        'by',
      ];
      const foundCommonWords = commonWords.filter((word) =>
        text.toLowerCase().includes(word)
      ).length;

      if (foundCommonWords < 3 && words.length > 20) {
        issues.push('Content may not be in English or may be corrupted');
        confidence -= 25;
      }
    }

    confidence = Math.max(0, confidence);

    return {
      isValid: confidence > 50,
      issues,
      confidence,
    };
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

  /**
   * Register a custom extractor
   */
  registerCustomExtractor(extractor: any): void {
    this.documentProcessor.registerExtractor(extractor);
  }
}

// Export types for external use
export type {
  ExtractionResult,
  ExtractionOptions,
  DocumentMetadata,
} from './document-extraction';
