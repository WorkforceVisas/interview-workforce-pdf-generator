declare module 'pdf2json' {
  export default class PDFParser {
    constructor(context?: object | null, needRawText?: boolean | number);

    on(event: 'pdfParser_dataError', callback: (errData: Error) => void): void;
    on(
      event: 'pdfParser_dataReady',
      callback: (pdfData: PDFData) => void
    ): void;

    loadPDF(pdfFilePath: string): void;
    parseBuffer(buffer: Buffer): void;
    getRawTextContent(): string;
    getAllFieldsTypes(): string[];

    // PDF data structure
    PDFJS: object;
    data: PDFData | null;
  }
  interface PDFData {
    Pages: Array<{
      PageNumber: number;
      Texts: Array<{
        R: Array<{ T: string }>;
      }>;
    }>;
    Metadata?: {
      fileSize?: number;
      wordCount?: number;
      characterCount?: number;
    };
  }
}
