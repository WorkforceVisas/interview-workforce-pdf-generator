import { BaseExtractor } from './base-extractor';
import { TextExtractor } from './extractors/text-extractor';
import { PDFExtractor } from './extractors/pdf-extractor';
import { DocxExtractor } from './extractors/docx-extractor';
import {
  ExtractionResult,
  ExtractionOptions,
  DocumentExtractionError,
} from './types';
import { createHash } from 'crypto';
import { readFile, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join, resolve, isAbsolute } from 'path';
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
    console.log('DocumentProcessor.process called with:', filePath);

    // Resolve the file path first
    const resolvedPath = await this.resolveFilePath(filePath);
    console.log('Resolved path:', resolvedPath);

    // Validate file exists
    try {
      await stat(resolvedPath);
    } catch (error) {
      console.error('File not found at resolved path:', resolvedPath);
      throw new DocumentExtractionError('File not found', 'FILE_NOT_FOUND', {
        filePath: resolvedPath,
        originalPath: filePath,
      });
    }

    // Check cache
    if (this.config.enableCache) {
      const cacheKey = await this.getCacheKey(resolvedPath, options);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return { ...cached, metadata: { ...cached.metadata, cached: true } };
      }
    }

    // Detect MIME type
    const mimeType = mime.lookup(resolvedPath) || 'application/octet-stream';

    // Find appropriate extractor
    const extractor = this.extractors.find((e) =>
      e.canHandle(resolvedPath, mimeType)
    );

    if (!extractor) {
      throw new DocumentExtractionError(
        'Unsupported file type',
        'UNSUPPORTED_TYPE',
        { filePath: resolvedPath, mimeType }
      );
    }

    // Apply timeout if specified
    let result: ExtractionResult;
    if (options?.timeout) {
      result = await this.withTimeout(
        extractor.extract(resolvedPath, options),
        options.timeout
      );
    } else {
      result = await extractor.extract(resolvedPath, options);
    }

    // Cache result
    if (this.config.enableCache && result.success) {
      const cacheKey = await this.getCacheKey(resolvedPath, options);
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  private async resolveFilePath(filePath: string): Promise<string> {
    // If it's already an absolute path and exists, return it
    if (isAbsolute(filePath) && existsSync(filePath)) {
      return filePath;
    }

    // Define the uploads directory
    const uploadsDir = join(process.cwd(), 'uploads', 'documents');

    // Extract just the filename from the path
    const filename = filePath.split(/[\\\/]/).pop() || filePath;

    // Try different path resolution strategies
    const pathsToTry = [
      // If it's just a filename, try in uploads directory
      join(uploadsDir, filename),
      // Original path
      filePath,
      // If it starts with uploads/, resolve from project root
      join(process.cwd(), filePath),
      // Try resolving as-is
      resolve(filePath),
      // Try with normalized separators
      join(process.cwd(), filePath.replace(/\\/g, '/')),
    ].filter(Boolean) as string[];

    // Try each path
    for (const tryPath of pathsToTry) {
      if (existsSync(tryPath)) {
        console.log('Found file at:', tryPath);
        return tryPath;
      }
    }

    // If none exist, log what we tried and throw error
    console.error('File not found. Tried paths:', pathsToTry);
    throw new DocumentExtractionError('File not found', 'FILE_NOT_FOUND', {
      filePath,
      triedPaths: pathsToTry,
    });
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
