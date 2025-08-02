import { ExtractionResult, ExtractionOptions, DocumentMetadata } from './types';
import { createHash } from 'crypto';
import { stat } from 'fs/promises';

export abstract class BaseExtractor {
  protected startTime: number = 0;
  protected warnings: string[] = [];
  protected errors: string[] = [];

  abstract canHandle(filePath: string, mimeType?: string): boolean;
  abstract extract(
    filePath: string,
    options?: ExtractionOptions
  ): Promise<ExtractionResult>;

  protected async getBasicMetadata(
    filePath: string
  ): Promise<Partial<DocumentMetadata>> {
    const stats = await stat(filePath);
    const fileName = filePath.split(/[\\\/]/).pop() || '';

    return {
      fileName,
      fileSize: stats.size,
      modifiedDate: stats.mtime,
      createdDate: stats.birthtime,
    };
  }

  protected cleanText(text: string): string {
    if (!text) return '';

    return (
      text
        // Remove null bytes and control characters
        .replace(/\0/g, '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        // Normalize line endings
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Remove excessive newlines
        .replace(/\n{3,}/g, '\n\n')
        // Remove leading/trailing whitespace
        .trim()
    );
  }

  protected calculateConfidence(
    text: string,
    metadata: Partial<DocumentMetadata>
  ): number {
    let confidence = 100;

    // Check text quality
    if (!text || text.length < 10) {
      confidence -= 50;
    }

    // Check for gibberish (high ratio of special characters)
    const specialCharRatio =
      (text.match(/[^\w\s]/g) || []).length / text.length;
    if (specialCharRatio > 0.4) {
      confidence -= 30;
    }

    // Check word distribution
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    if (words.length > 0) {
      const avgWordLength =
        words.reduce((sum, word) => sum + word.length, 0) / words.length;
      if (avgWordLength < 2 || avgWordLength > 20) {
        confidence -= 20;
      }
    }

    // Bonus for metadata
    if (metadata.author || metadata.title) {
      confidence += 10;
    }

    return Math.max(0, Math.min(100, confidence));
  }

  protected detectLanguage(text: string): string[] {
    const hints: string[] = [];

    // Simple language detection based on character sets
    if (/[\u4e00-\u9fff]/.test(text)) hints.push('zh'); // Chinese
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) hints.push('ja'); // Japanese
    if (/[\uac00-\ud7af]/.test(text)) hints.push('ko'); // Korean
    if (/[\u0600-\u06ff]/.test(text)) hints.push('ar'); // Arabic
    if (/[\u0400-\u04ff]/.test(text)) hints.push('ru'); // Cyrillic

    // Default to English if no other scripts detected
    if (hints.length === 0) hints.push('en');

    return hints;
  }

  protected buildResult(
    text: string,
    metadata: DocumentMetadata,
    success: boolean = true
  ): ExtractionResult {
    const processingTime = Date.now() - this.startTime;
    const confidence = this.calculateConfidence(text, metadata);

    return {
      success,
      text,
      metadata,
      warnings: this.warnings,
      errors: this.errors,
      confidence,
      processingTime,
    };
  }
}
