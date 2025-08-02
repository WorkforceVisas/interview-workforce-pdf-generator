import { BaseExtractor } from '../base-extractor';
import { ExtractionResult, ExtractionOptions } from '../types';
import { readFile } from 'fs/promises';

export class PDFExtractor extends BaseExtractor {
  private pdfjs: any = null;

  private async initializePdfJs() {
    if (!this.pdfjs) {
      this.pdfjs = await import('pdfjs-dist');

      // Configure worker based on environment
      if (typeof window !== 'undefined') {
        // Client-side: use your local worker via rewrite rule
        this.pdfjs.GlobalWorkerOptions.workerSrc =
          '/pdf-worker/pdf.worker.min.js';
      } else {
        // Server-side: disable worker completely
        this.pdfjs.GlobalWorkerOptions.workerSrc = false;
      }
    }
    return this.pdfjs;
  }

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
      const pdfjs = await this.initializePdfJs();
      const buffer = await readFile(filePath);
      const uint8Array = new Uint8Array(buffer);

      // Configure PDF loading for server environment
      const loadingTask = pdfjs.getDocument({
        data: uint8Array,
        password: options?.password,
        // Always disable worker and problematic features for stability
        useWorker: false,
        useSystemFonts: false,
        disableFontFace: true,
        standardFontDataUrl: null,
        cMapUrl: null,
        cMapPacked: false,
      });

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
          const textContent = await page.getTextContent({
            normalizeWhitespace: true,
            disableCombineTextItems: false,
          });

          if (textContent.items.length === 0) {
            hasScannedPages = true;
            if (options?.ocrEnabled) {
              this.warnings.push(
                `Page ${i} appears to be scanned - OCR required`
              );
            }
          }

          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');

          if (pageText.trim()) {
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
