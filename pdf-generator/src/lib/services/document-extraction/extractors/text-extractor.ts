import { BaseExtractor } from '../base-extractor';
import { ExtractionResult, ExtractionOptions } from '../types';
import { readFile } from 'fs/promises';
import { detect } from 'chardet';
import iconv from 'iconv-lite';

export class TextExtractor extends BaseExtractor {
  private supportedExtensions = [
    '.txt',
    '.log',
    '.md',
    '.csv',
    '.json',
    '.xml',
    '.html',
  ];

  canHandle(filePath: string): boolean {
    const ext = filePath.toLowerCase().split('.').pop();
    return this.supportedExtensions.includes(`.${ext}`);
  }

  async extract(
    filePath: string,
    options?: ExtractionOptions
  ): Promise<ExtractionResult> {
    this.startTime = Date.now();
    this.warnings = [];
    this.errors = [];

    try {
      const metadata = await this.getBasicMetadata(filePath);
      const buffer = await readFile(filePath);

      // Detect encoding
      let encoding = options?.encoding;
      if (!encoding) {
        const detected = detect(buffer);
        encoding = detected || 'utf-8';
        if (detected && detected !== 'utf-8') {
          this.warnings.push(`Detected non-UTF8 encoding: ${detected}`);
        }
      }

      // Convert to UTF-8
      let text = '';
      try {
        text = iconv.decode(buffer, encoding);
      } catch (error) {
        this.warnings.push(
          `Failed to decode with ${encoding}, falling back to UTF-8`
        );
        text = buffer.toString('utf-8');
      }

      text = this.cleanText(text);

      const words = text.split(/\s+/).filter((w) => w.length > 0);
      const languageHints = this.detectLanguage(text);

      return this.buildResult(text, {
        ...(metadata as any),
        fileType: filePath.split('.').pop() || 'txt',
        mimeType: 'text/plain',
        encoding,
        wordCount: words.length,
        characterCount: text.length,
        languageHints,
        extractionMethod: 'direct-read',
      });
    } catch (error) {
      this.errors.push(`Text extraction failed: ${error.message}`);
      return this.buildResult(
        '',
        {
          fileName: filePath.split(/[\\\/]/).pop() || '',
          fileSize: 0,
          fileType: 'txt',
          mimeType: 'text/plain',
          wordCount: 0,
          characterCount: 0,
        },
        false
      );
    }
  }
}
