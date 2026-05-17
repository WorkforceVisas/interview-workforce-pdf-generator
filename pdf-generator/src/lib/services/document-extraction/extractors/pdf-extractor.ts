import { BaseExtractor } from '../base-extractor';
import { ExtractionResult, ExtractionOptions } from '../types';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';

// Import pdf2json
let PDFParser: any;
try {
  PDFParser = require('pdf2json');
} catch (error) {
  console.warn('pdf2json not available, will try dynamic import when needed');
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

    console.log('PDFExtractor.extract called with:', filePath);
    console.log('File exists before extraction:', existsSync(filePath));

    try {
      // Ensure pdf2json is available
      if (!PDFParser) {
        try {
          PDFParser = require('pdf2json');
        } catch (e) {
          const module = await import('pdf2json');
          PDFParser = module.default || module;
        }
      }

      if (!PDFParser) {
        throw new Error(
          'Could not load pdf2json module. Please ensure it is installed: npm install pdf2json'
        );
      }

      // Extract text using pdf2json
      const text = await this.extractWithPdf2json(filePath, options);

      // Clean and process the text
      const cleanedText = this.cleanText(text);
      const words = cleanedText.split(/\s+/).filter((w) => w.length > 0);
      const languageHints = this.detectLanguage(cleanedText);

      // Get basic file metadata
      let basicMetadata = {};
      try {
        basicMetadata = await this.getBasicMetadata(filePath);
      } catch (metadataError) {
        console.warn('Failed to get basic metadata:', metadataError);
        this.warnings.push('Could not retrieve file metadata');
      }

      // Build successful result
      const result = this.buildResult(cleanedText, {
        ...(basicMetadata as any),
        fileType: 'pdf',
        mimeType: 'application/pdf',
        wordCount: words.length,
        characterCount: cleanedText.length,
        languageHints,
        isScanned: cleanedText.trim().length === 0,
        extractionMethod: cleanedText.trim().length > 0 ? 'pdf2json' : 'none',
      });

      console.log(
        'PDF extraction successful, text length:',
        cleanedText.length
      );
      return result;
    } catch (error) {
      console.error('PDF extraction error:', error);

      // Build error result
      let errorMessage = 'PDF extraction failed';
      let errorCode = 'EXTRACTION_FAILED';

      if (error.code === 'ENOENT' || error.message?.includes('ENOENT')) {
        errorMessage = `PDF file not found: ${filePath}`;
        errorCode = 'FILE_NOT_FOUND';
      } else if (error.message?.includes('Could not load pdf2json')) {
        errorMessage = error.message;
        errorCode = 'MODULE_NOT_FOUND';
      } else if (
        error.message?.includes('password') ||
        error.message?.includes('encrypted')
      ) {
        errorMessage = 'PDF is password protected or encrypted';
        errorCode = 'PASSWORD_PROTECTED';
      } else if (
        error.message?.includes('Invalid') ||
        error.message?.includes('corrupt')
      ) {
        errorMessage = 'PDF file appears to be corrupted';
        errorCode = 'CORRUPTED_FILE';
      } else {
        errorMessage = `PDF extraction failed: ${error.message}`;
      }

      this.errors.push(errorMessage);

      // Try to get basic metadata even on error
      let basicMetadata = {};
      try {
        basicMetadata = await this.getBasicMetadata(filePath);
      } catch (metadataError) {
        this.warnings.push('Could not retrieve file metadata');
      }

      return this.buildResult(
        '',
        {
          ...(basicMetadata as any),
          fileType: 'pdf',
          mimeType: 'application/pdf',
          wordCount: 0,
          characterCount: 0,
          isEncrypted:
            error.message?.includes('password') ||
            error.message?.includes('encrypted'),
          error: errorMessage,
          errorCode: errorCode,
        },
        false
      );
    }
  }

  private async extractWithPdf2json(
    filePath: string,
    options?: ExtractionOptions
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser(this, 1);

      // Set up event handlers
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        console.error('PDF parsing error:', errData.parserError);
        reject(new Error(errData.parserError || 'Failed to parse PDF'));
      });

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          console.log('PDF parsed successfully');

          // Extract text from the parsed data
          let extractedText = '';

          // Method 1: Use getRawTextContent() if available
          if (typeof pdfParser.getRawTextContent === 'function') {
            extractedText = pdfParser.getRawTextContent();
          } else {
            // Method 2: Extract text from pages manually
            if (pdfData.Pages) {
              const maxPages = options?.maxPages || pdfData.Pages.length;
              const pagesToProcess = Math.min(pdfData.Pages.length, maxPages);

              for (let i = 0; i < pagesToProcess; i++) {
                const page = pdfData.Pages[i];
                if (page.Texts) {
                  for (const textItem of page.Texts) {
                    if (textItem.R) {
                      for (const textRun of textItem.R) {
                        if (textRun.T) {
                          // Decode URI component to get actual text
                          const decodedText = decodeURIComponent(textRun.T);
                          extractedText += decodedText + ' ';
                        }
                      }
                    }
                  }
                  extractedText += '\n\n'; // Add paragraph break between pages
                }
              }

              if (pagesToProcess < pdfData.Pages.length) {
                this.warnings.push(
                  `Extracted ${pagesToProcess} of ${pdfData.Pages.length} pages (limit reached)`
                );
              }
            }
          }

          // Extract metadata if available
          if (pdfData.Meta) {
            console.log('PDF Metadata:', {
              title: pdfData.Meta.Title,
              author: pdfData.Meta.Author,
              subject: pdfData.Meta.Subject,
              creator: pdfData.Meta.Creator,
            });
          }

          if (!extractedText || extractedText.trim().length === 0) {
            this.warnings.push(
              'No text content found in PDF - might be scanned or image-based'
            );
          }

          resolve(extractedText);
        } catch (error) {
          reject(error);
        }
      });

      // Load the PDF file
      console.log('Loading PDF file:', filePath);
      pdfParser.loadPDF(filePath);
    });
  }
}

export default PDFExtractor;
