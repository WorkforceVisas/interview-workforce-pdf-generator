import { BaseExtractor } from './base-extractor';
import { TextExtractor } from './extractors/text-extractor';
import { PDFExtractor } from './extractors/pdf-extractor';
import { DocxExtractor } from './extractors/docx-extractor';
import { XlsxExtractor } from './extractors/xlsx-extractor';
import { PptxExtractor } from './extractors/pptx-extractor';
import {
  ExtractionResult,
  ExtractionOptions,
  DocumentExtractionError,
} from './types';
import { createHash } from 'crypto';
import { readFile, stat } from 'fs/promises';
import * as mime from 'mime-types';
import { LRUCache } from 'lru-cache';

export class DocumentProcessor {
  private extractors: BaseExtractor[] = [];
  private cache: LRUCache<string, ExtractionResult>;

  constructor(
    private config: {
      enableCache?: boolean;
      cacheSize?: number;
      cacheTTL?: number;
      extractors?: BaseExtractor[];
    } = {}
  ) {
    // Initialize extractors
    this.extractors = config.extractors || [
      new TextExtractor(),
      new PDFExtractor(),
      new DocxExtractor(),
      new XlsxExtractor(),
      new PptxExtractor(),
    ];

    // Initialize cache
    this.cache = new LRUCache<string, ExtractionResult>({
      max: config.cacheSize || 100,
      ttl: config.cacheTTL || 1000 * 60 * 60, // 1 hour default
    });
  }

  async process(
    filePath: string,
    options?: ExtractionOptions
  ): Promise<ExtractionResult> {
    // Validate file exists
    try {
      await stat(filePath);
    } catch (error) {
      throw new DocumentExtractionError('File not found', 'FILE_NOT_FOUND', {
        filePath,
      });
    }

    // Check cache
    if (this.config.enableCache) {
      const cacheKey = await this.getCacheKey(filePath, options);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return { ...cached, metadata: { ...cached.metadata, cached: true } };
      }
    }

    // Detect MIME type
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';

    // Find appropriate extractor
    const extractor = this.extractors.find((e) =>
      e.canHandle(filePath, mimeType)
    );

    if (!extractor) {
      throw new DocumentExtractionError(
        'Unsupported file type',
        'UNSUPPORTED_TYPE',
        { filePath, mimeType }
      );
    }

    // Apply timeout if specified
    let result: ExtractionResult;
    if (options?.timeout) {
      result = await this.withTimeout(
        extractor.extract(filePath, options),
        options.timeout
      );
    } else {
      result = await extractor.extract(filePath, options);
    }

    // Cache result
    if (this.config.enableCache && result.success) {
      const cacheKey = await this.getCacheKey(filePath, options);
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  async processMultiple(
    filePaths: string[],
    options?: ExtractionOptions
  ): Promise<Map<string, ExtractionResult>> {
    const results = new Map<string, ExtractionResult>();

    // Process in parallel with concurrency limit
    const concurrency = 5;
    for (let i = 0; i < filePaths.length; i += concurrency) {
      const batch = filePaths.slice(i, i + concurrency);
      const batchResults = await Promise.allSettled(
        batch.map((path) => this.process(path, options))
      );

      batchResults.forEach((result, index) => {
        const filePath = batch[index];
        if (result.status === 'fulfilled') {
          results.set(filePath, result.value);
        } else {
          results.set(filePath, {
            success: false,
            text: '',
            metadata: {
              fileName: filePath.split(/[\\\/]/).pop() || '',
              fileSize: 0,
              fileType: '',
              mimeType: '',
              wordCount: 0,
              characterCount: 0,
            },
            warnings: [],
            errors: [`Processing failed: ${result.reason.message}`],
            confidence: 0,
            processingTime: 0,
          });
        }
      });
    }

    return results;
  }

  private async getCacheKey(
    filePath: string,
    options?: ExtractionOptions
  ): Promise<string> {
    const stats = await stat(filePath);
    const optionsStr = JSON.stringify(options || {});
    const data = `${filePath}:${stats.mtime.getTime()}:${optionsStr}`;
    return createHash('sha256').update(data).digest('hex');
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeout: number
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), timeout);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; hits: number; misses: number } {
    return {
      size: this.cache.size,
      hits: 0, // Would need to track this
      misses: 0, // Would need to track this
    };
  }

  registerExtractor(extractor: BaseExtractor): void {
    this.extractors.push(extractor);
  }

  unregisterExtractor(extractorType: string): void {
    this.extractors = this.extractors.filter(
      (e) => e.constructor.name !== extractorType
    );
  }
}

// src/serv
