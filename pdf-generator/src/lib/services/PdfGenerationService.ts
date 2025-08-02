import jsPDF from 'jspdf';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import {
  PdfTemplateData,
  PdfGenerationResult,
  PdfGenerationError,
} from '@/types';

export class PdfGenerationService {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = join(process.cwd(), 'uploads', 'pdfs');
  }

  /**
   * Ensure directory exists
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Generate a PDF for an application
   */
  async generateApplicationPdf(
    data: PdfTemplateData
  ): Promise<PdfGenerationResult> {
    try {
      // Validate data first
      this.validatePdfData(data);

      // Ensure uploads directory exists
      await this.ensureDirectoryExists(this.uploadsDir);

      // Generate unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `application-${data.application.id}-${timestamp}.pdf`;
      const filePath = join(this.uploadsDir, filename);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Add content to PDF
      this.addPdfContent(pdf, data);

      // Save PDF to file system
      const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
      await writeFile(filePath, pdfBuffer);

      return {
        success: true,
        pdfPath: filePath,
        downloadUrl: `/api/download/pdf/${data.application.id}`,
      };
    } catch (error) {
      console.error('PDF generation error:', error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown PDF generation error',
      };
    }
  }

  /**
   * Add content to PDF using jsPDF
   */
  private addPdfContent(pdf: jsPDF, data: PdfTemplateData): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 30;

    // Header
    pdf.setFontSize(24);
    pdf.setTextColor(30, 64, 175); // Blue color
    pdf.text(`${data.user.firstName} ${data.user.lastName}`, margin, yPosition);

    yPosition += 10;
    pdf.setFontSize(14);
    pdf.setTextColor(107, 114, 128); // Gray color
    pdf.text('Job Application Summary', margin, yPosition);

    yPosition += 5;
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(59, 130, 246); // Blue line
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);

    yPosition += 15;

    // Personal Information Section
    pdf.setFontSize(16);
    pdf.setTextColor(31, 41, 55); // Dark gray
    pdf.text('Personal Information', margin, yPosition);

    yPosition += 10;
    pdf.setFontSize(11);
    pdf.setTextColor(75, 85, 99); // Medium gray

    const personalInfo = [
      `Name: ${data.user.firstName} ${data.user.lastName}`,
      `Email: ${data.user.email}`,
      ...(data.user.phone ? [`Phone: ${data.user.phone}`] : []),
      ...(data.user.address ? [`Address: ${data.user.address}`] : []),
      ...(data.user.city ? [`City: ${data.user.city}`] : []),
      ...(data.user.state ? [`State: ${data.user.state}`] : []),
      ...(data.user.zipCode ? [`ZIP: ${data.user.zipCode}`] : []),
      `Country: ${data.user.country}`,
    ];

    personalInfo.forEach((info) => {
      if (yPosition > 250) {
        // Check if we need a new page
        pdf.addPage();
        yPosition = 30;
      }
      pdf.text(info, margin, yPosition);
      yPosition += 6;
    });

    yPosition += 10;

    // Job Description Section
    if (yPosition > 220) {
      pdf.addPage();
      yPosition = 30;
    }

    pdf.setFontSize(16);
    pdf.setTextColor(31, 41, 55);
    pdf.text('Current Job Description', margin, yPosition);

    yPosition += 10;
    pdf.setFontSize(11);
    pdf.setTextColor(75, 85, 99);

    // Wrap job description text
    const jobDescLines = pdf.splitTextToSize(
      data.application.jobDescription,
      pageWidth - 2 * margin
    );

    jobDescLines.forEach((line: string) => {
      if (yPosition > 280) {
        pdf.addPage();
        yPosition = 30;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 5;
    });

    // Supporting Document Section
    if (data.extractedContent) {
      yPosition += 15;

      if (yPosition > 220) {
        pdf.addPage();
        yPosition = 30;
      }

      pdf.setFontSize(16);
      pdf.setTextColor(31, 41, 55);
      pdf.text('Supporting Document Content', margin, yPosition);

      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99);

      // Truncate content if too long
      const contentToShow =
        data.extractedContent.length > 1500
          ? data.extractedContent.substring(0, 1500) + '...'
          : data.extractedContent;

      const contentLines = pdf.splitTextToSize(
        contentToShow,
        pageWidth - 2 * margin
      );

      contentLines.forEach((line: string) => {
        if (yPosition > 280) {
          pdf.addPage();
          yPosition = 30;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 4;
      });

      if (data.extractedContent.length > 1500) {
        yPosition += 5;
        pdf.setFontSize(9);
        pdf.setTextColor(156, 163, 175);
        pdf.text(
          'Note: Content truncated for display. Full document processed and stored.',
          margin,
          yPosition
        );
      }
    }

    

    // Footer
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175);

      const footerY = pdf.internal.pageSize.getHeight() - 15;
      pdf.text(
        'This document was automatically generated by the Job Application Portal.',
        pageWidth / 2,
        footerY,
        { align: 'center' }
      );

      pdf.text(
        `Confidential and proprietary • Page ${i} of ${pageCount}`,
        pageWidth / 2,
        footerY + 5,
        { align: 'center' }
      );
    }
  }

  /**
   * Generate PDF with custom template (for future expansion)
   */
  async generateCustomPdf(
    data: PdfTemplateData,
    templateName: string = 'default'
  ): Promise<PdfGenerationResult> {
    // For now, just use the default template
    // This method can be expanded to support multiple templates
    return this.generateApplicationPdf(data);
  }

  /**
   * Validate PDF generation prerequisites
   */
  validatePdfData(data: PdfTemplateData): boolean {
    try {
      // Check required fields
      if (!data.user?.firstName || !data.user?.lastName || !data.user?.email) {
        throw new PdfGenerationError('Missing required user information');
      }

      if (!data.application?.jobDescription?.trim()) {
        throw new PdfGenerationError('Missing job description');
      }

      if (!data.application?.id) {
        throw new PdfGenerationError('Missing application ID');
      }

      return true;
    } catch (error) {
      if (error instanceof PdfGenerationError) {
        throw error;
      }
      throw new PdfGenerationError('PDF data validation failed');
    }
  }

  /**
   * Get PDF file size and metadata
   */
  async getPdfMetadata(
    filePath: string
  ): Promise<{ size: number; exists: boolean }> {
    try {
      const fs = await import('fs/promises');
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        exists: true,
      };
    } catch (error) {
      return {
        size: 0,
        exists: false,
      };
    }
  }
}
