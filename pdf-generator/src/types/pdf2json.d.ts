declare module 'pdf2json' {
  export default class PDFParser {
    constructor(context?: any, needRawText?: number);

    on(event: 'pdfParser_dataError', callback: (errData: any) => void): void;
    on(event: 'pdfParser_dataReady', callback: (pdfData: any) => void): void;

    loadPDF(pdfFilePath: string): void;
    parseBuffer(buffer: Buffer): void;
    getRawTextContent(): string;
    getAllFieldsTypes(): any;

    // PDF data structure
    PDFJS: any;
    data: any;
  }
}
