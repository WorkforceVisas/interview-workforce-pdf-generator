import { BaseExtractor } from '../base-extractor';
import { ExtractionResult, ExtractionOptions } from '../types';
import { readFile } from 'fs/promises';
import * as unzipper from 'unzipper';
import { parseStringPromise } from 'xml2js';

export class PptxExtractor extends BaseExtractor {
  canHandle(filePath: string, mimeType?: string): boolean {
    return (
      filePath.toLowerCase().endsWith('.pptx') ||
      mimeType ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    );
  }

  async extract(
    filePath: string,
    options?: ExtractionOptions
  ): Promise<ExtractionResult> {
    this.startTime = Date.now();
    this.warnings = [];
    this.errors = [];

    try {
      const buffer = await readFile(filePath);
      const directory = await unzipper.Open.buffer(buffer);

      // Extract slide content
      const slideFiles = directory.files.filter((f) =>
        f.path.match(/^ppt\/slides\/slide\d+\.xml$/)
      );
      const textParts: string[] = [];

      for (const slideFile of slideFiles) {
        const slideNumber = parseInt(
          slideFile.path.match(/slide(\d+)\.xml$/)?.[1] || '0'
        );
        const slideXml = await slideFile.buffer();
        const slideData = await parseStringPromise(slideXml.toString());

        const slideText: string[] = [];
        this.extractTextFromSlide(slideData, slideText);

        if (slideText.length > 0) {
          textParts.push(
            `=== Slide ${slideNumber} ===\n${slideText.join('\n')}`
          );
        }
      }

      const text = this.cleanText(textParts.join('\n\n'));
      const metadata = await this.extractPptxMetadata(directory);
      const words = text.split(/\s+/).filter((w) => w.length > 0);
      const languageHints = this.detectLanguage(text);

      const basicMetadata = await this.getBasicMetadata(filePath);

      return this.buildResult(text, {
        ...(basicMetadata as any),
        ...metadata,
        fileType: 'pptx',
        mimeType:
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        pageCount: slideFiles.length,
        wordCount: words.length,
        characterCount: text.length,
        languageHints,
        extractionMethod: 'xml-parsing',
      });
    } catch (error) {
      this.errors.push(`PPTX extraction failed: ${error.message}`);

      const basicMetadata = await this.getBasicMetadata(filePath);
      return this.buildResult(
        '',
        {
          ...(basicMetadata as any),
          fileType: 'pptx',
          mimeType:
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          wordCount: 0,
          characterCount: 0,
        },
        false
      );
    }
  }

  private extractTextFromSlide(obj: any, textParts: string[]): void {
    if (typeof obj === 'string') {
      textParts.push(obj);
    } else if (Array.isArray(obj)) {
      obj.forEach((item) => this.extractTextFromSlide(item, textParts));
    } else if (typeof obj === 'object' && obj !== null) {
      if (obj['a:t']) {
        this.extractTextFromSlide(obj['a:t'], textParts);
      } else {
        Object.values(obj).forEach((value) =>
          this.extractTextFromSlide(value, textParts)
        );
      }
    }
  }

  private async extractPptxMetadata(
    directory: any
  ): Promise<Partial<DocumentMetadata>> {
    try {
      const coreProps = directory.files.find(
        (f: any) => f.path === 'docProps/core.xml'
      );
      if (!coreProps) return {};

      const coreXml = await coreProps.buffer();
      const coreData = await parseStringPromise(coreXml.toString());

      const props = coreData['cp:coreProperties'] || {};

      return {
        title: props['dc:title']?.[0],
        author: props['dc:creator']?.[0],
        subject: props['dc:subject']?.[0],
        createdDate: props['dcterms:created']?.[0]
          ? new Date(props['dcterms:created'][0])
          : undefined,
        modifiedDate: props['dcterms:modified']?.[0]
          ? new Date(props['dcterms:modified'][0])
          : undefined,
      };
    } catch (error) {
      this.warnings.push('Failed to extract PPTX metadata');
      return {};
    }
  }
}
