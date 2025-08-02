import { BaseExtractor } from '../base-extractor';
import { ExtractionResult, ExtractionOptions } from '../types';
import { readFile } from 'fs/promises';
import * as XLSX from 'xlsx';

export class XlsxExtractor extends BaseExtractor {
  canHandle(filePath: string, mimeType?: string): boolean {
    const ext = filePath.toLowerCase().split('.').pop();
    return (
      ['xlsx', 'xls', 'xlsm', 'xlsb'].includes(ext || '') ||
      mimeType?.includes('spreadsheet')
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
      const workbook = XLSX.read(buffer, {
        type: 'buffer',
        cellStyles: true,
        cellFormulas: true,
        cellDates: true,
        sheetStubs: true,
      });

      const textParts: string[] = [];
      const sheetNames = workbook.SheetNames;

      for (const sheetName of sheetNames) {
        const worksheet = workbook.Sheets[sheetName];

        // Convert to CSV for text extraction
        const csv = XLSX.utils.sheet_to_csv(worksheet, {
          blankrows: false,
          skipHidden: true,
        });

        if (csv.trim()) {
          textParts.push(`=== Sheet: ${sheetName} ===\n${csv}`);
        }

        // Check for tables
        if (worksheet['!tables'] && worksheet['!tables'].length > 0) {
          this.warnings.push(
            `Sheet "${sheetName}" contains ${worksheet['!tables'].length} table(s)`
          );
        }
      }

      const text = this.cleanText(textParts.join('\n\n'));
      const words = text.split(/\s+/).filter((w) => w.length > 0);
      const languageHints = this.detectLanguage(text);

      const basicMetadata = await this.getBasicMetadata(filePath);
      const metadata = this.extractXlsxMetadata(workbook);

      return this.buildResult(text, {
        ...(basicMetadata as any),
        ...metadata,
        fileType: filePath.split('.').pop() || 'xlsx',
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        wordCount: words.length,
        characterCount: text.length,
        languageHints,
        hasTables: true,
        extractionMethod: 'xlsx',
      });
    } catch (error) {
      this.errors.push(`XLSX extraction failed: ${error.message}`);

      const basicMetadata = await this.getBasicMetadata(filePath);
      return this.buildResult(
        '',
        {
          ...(basicMetadata as any),
          fileType: 'xlsx',
          mimeType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          wordCount: 0,
          characterCount: 0,
        },
        false
      );
    }
  }

  private extractXlsxMetadata(
    workbook: XLSX.WorkBook
  ): Partial<DocumentMetadata> {
    const props = workbook.Props || {};

    return {
      title: props.Title,
      author: props.Author,
      subject: props.Subject,
      createdDate: props.CreatedDate,
      modifiedDate: props.ModifiedDate,
      pageCount: workbook.SheetNames.length, // Using sheet count as "pages"
    };
  }
}
