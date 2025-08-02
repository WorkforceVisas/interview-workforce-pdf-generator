import { BaseExtractor } from '../base-extractor';
import { ExtractionResult, ExtractionOptions } from '../types';
import { readFile } from 'fs/promises';
import * as mammoth from 'mammoth';
import * as unzipper from 'unzipper';
import { parseStringPromise } from 'xml2js';

export class DocxExtractor extends BaseExtractor {
  canHandle(filePath: string, mimeType?: string): boolean {
    return (
      filePath.toLowerCase().endsWith('.docx') ||
      mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
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
      // Extract text using mammoth
      const result = await mammoth.extractRawText({ path: filePath });

      if (result.messages && result.messages.length > 0) {
        this.warnings.push(...result.messages.map((m) => m.message));
      }

      const text = this.cleanText(result.value);

      // Extract additional metadata from the docx archive
      const metadata = await this.extractDocxMetadata(filePath);
      const words = text.split(/\s+/).filter((w) => w.length > 0);
      const languageHints = this.detectLanguage(text);

      const basicMetadata = await this.getBasicMetadata(filePath);

      return this.buildResult(text, {
        ...(basicMetadata as any),
        ...metadata,
        fileType: 'docx',
        mimeType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        wordCount: words.length,
        characterCount: text.length,
        languageHints,
        extractionMethod: 'mammoth',
      });
    } catch (error) {
      this.errors.push(`DOCX extraction failed: ${error.message}`);

      // Try alternative extraction method
      try {
        const altText = await this.alternativeDocxExtraction(filePath);
        if (altText) {
          this.warnings.push('Used fallback extraction method');
          const words = altText.split(/\s+/).filter((w) => w.length > 0);
          const basicMetadata = await this.getBasicMetadata(filePath);

          return this.buildResult(altText, {
            ...(basicMetadata as any),
            fileType: 'docx',
            mimeType:
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            wordCount: words.length,
            characterCount: altText.length,
            extractionMethod: 'xml-parsing',
          });
        }
      } catch (altError) {
        this.errors.push(
          `Alternative extraction also failed: ${altError.message}`
        );
      }

      const basicMetadata = await this.getBasicMetadata(filePath);
      return this.buildResult(
        '',
        {
          ...(basicMetadata as any),
          fileType: 'docx',
          mimeType:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          wordCount: 0,
          characterCount: 0,
        },
        false
      );
    }
  }

  private async extractDocxMetadata(
    filePath: string
  ): Promise<Partial<DocumentMetadata>> {
    try {
      const buffer = await readFile(filePath);
      const directory = await unzipper.Open.buffer(buffer);

      // Look for docProps/core.xml
      const coreProps = directory.files.find(
        (f) => f.path === 'docProps/core.xml'
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
      this.warnings.push('Failed to extract DOCX metadata');
      return {};
    }
  }

  private async alternativeDocxExtraction(filePath: string): Promise<string> {
    const buffer = await readFile(filePath);
    const directory = await unzipper.Open.buffer(buffer);

    // Extract text from document.xml
    const docFile = directory.files.find((f) => f.path === 'word/document.xml');
    if (!docFile) throw new Error('No document.xml found');

    const docXml = await docFile.buffer();
    const docData = await parseStringPromise(docXml.toString());

    // Extract text from all w:t elements
    const textParts: string[] = [];
    this.extractTextFromXml(docData, textParts);

    return this.cleanText(textParts.join(' '));
  }

  private extractTextFromXml(obj: any, textParts: string[]): void {
    if (typeof obj === 'string') {
      textParts.push(obj);
    } else if (Array.isArray(obj)) {
      obj.forEach((item) => this.extractTextFromXml(item, textParts));
    } else if (typeof obj === 'object' && obj !== null) {
      if (obj['w:t']) {
        this.extractTextFromXml(obj['w:t'], textParts);
      } else {
        Object.values(obj).forEach((value) =>
          this.extractTextFromXml(value, textParts)
        );
      }
    }
  }
}
