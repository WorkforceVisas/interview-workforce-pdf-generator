import { BaseExtractor } from '../base-extractor';
import { ExtractionResult, ExtractionOptions } from '../types';
import { readFile } from 'fs/promises';
import * as pdfjsLib from 'pdfjs-dist';
import { createCanvas } from 'canvas';
import DOMMatrix from 'dommatrix';

if (typeof window !== 'undefined') {
  // Only initialize the worker path on the client-side
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.js';
}
export class PDFExtractor extends BaseExtractor {
  canHandle(filePath: string, mimeType?: string): boolean {
    return (
      filePath.toLowerCase().endsWith('.pdf') || mimeType === 'application/pdf'
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
      const uint8Array = new Uint8Array(buffer);

      // Load PDF document
      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        password: options?.password,
        useSystemFonts: true,
      });

      const matrix = new DOMMatrix();
      const pdf = await loadingTask.promise;
      const metadata = await this.extractMetadata(pdf);

      // Extract text from pages
      const maxPages = options?.maxPages || pdf.numPages;
      const pagesToExtract = Math.min(pdf.numPages, maxPages);
      const textParts: string[] = [];
      let hasScannedPages = false;

      for (let i = 1; i <= pagesToExtract; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();

          if (textContent.items.length === 0) {
            hasScannedPages = true;
            if (options?.ocrEnabled) {
              // OCR would go here - for now we'll flag it
              this.warnings.push(
                `Page ${i} appears to be scanned - OCR required`
              );
            }
          }

          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');

          if (pageText) {
            textParts.push(pageText);
          }
        } catch (pageError) {
          this.warnings.push(
            `Failed to extract page ${i}: ${pageError.message}`
          );
        }
      }

      if (pagesToExtract < pdf.numPages) {
        this.warnings.push(
          `Extracted ${pagesToExtract} of ${pdf.numPages} pages (limit reached)`
        );
      }

      const text = this.cleanText(textParts.join('\n\n'));
      const words = text.split(/\s+/).filter((w) => w.length > 0);
      const languageHints = this.detectLanguage(text);

      const basicMetadata = await this.getBasicMetadata(filePath);

      return this.buildResult(text, {
        ...(basicMetadata as any),
        ...metadata,
        fileType: 'pdf',
        mimeType: 'application/pdf',
        pageCount: pdf.numPages,
        wordCount: words.length,
        characterCount: text.length,
        languageHints,
        isScanned: hasScannedPages,
        extractionMethod: hasScannedPages ? 'mixed' : 'text-layer',
      });
    } catch (error) {
      if (error.message?.includes('password')) {
        this.errors.push('PDF is password protected');
      } else {
        this.errors.push(`PDF extraction failed: ${error.message}`);
      }

      const basicMetadata = await this.getBasicMetadata(filePath);
      return this.buildResult(
        '',
        {
          ...(basicMetadata as any),
          fileType: 'pdf',
          mimeType: 'application/pdf',
          wordCount: 0,
          characterCount: 0,
          isEncrypted: error.message?.includes('password'),
        },
        false
      );
    }
  }

  private async extractMetadata(pdf: any): Promise<Partial<DocumentMetadata>> {
    try {
      const metadata = await pdf.getMetadata();
      const info = metadata.info || {};

      return {
        title: info.Title,
        author: info.Author,
        subject: info.Subject,
        producer: info.Producer,
        createdDate: info.CreationDate
          ? new Date(info.CreationDate)
          : undefined,
        modifiedDate: info.ModDate ? new Date(info.ModDate) : undefined,
      };
    } catch (error) {
      this.warnings.push('Failed to extract PDF metadata');
      return {};
    }
  }
}
