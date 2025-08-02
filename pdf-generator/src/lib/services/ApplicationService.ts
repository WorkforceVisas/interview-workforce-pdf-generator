import { prisma } from '@/lib/prisma';
import {
  UserEntity,
  ApplicationEntity,
  DocumentEntity,
  GeneratedPdfEntity,
  PersonalDetails,
  ApplicationStatus,
  DocumentProcessingStatus,
} from '@/types';
import { basename } from 'path';

export class ApplicationService {
  /**
   * Create a new user
   */
  async createUser(personalDetails: PersonalDetails): Promise<UserEntity> {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: personalDetails.email.toLowerCase().trim() },
      });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      const user = await prisma.user.create({
        data: {
          firstName: personalDetails.firstName.trim(),
          lastName: personalDetails.lastName.trim(),
          email: personalDetails.email.toLowerCase().trim(),
          phone: personalDetails.phone?.trim() || null,
          address: personalDetails.address?.trim() || null,
          city: personalDetails.city?.trim() || null,
          state: personalDetails.state?.trim() || null,
          zipCode: personalDetails.zipCode?.trim() || null,
          country: personalDetails.country?.trim() || 'United States',
        },
      });

      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user record');
    }
  }

  /**
   * Create a new application
   */
  async createApplication(
    userId: string,
    jobDescription: string
  ): Promise<ApplicationEntity> {
    try {
      const application = await prisma.application.create({
        data: {
          userId,
          jobDescription: jobDescription.trim(),
          status: ApplicationStatus.PROCESSING,
        },
      });

      return application;
    } catch (error) {
      console.error('Error creating application:', error);
      throw new Error('Failed to create application record');
    }
  }

  /**
   * Create a document record
   */
  async createDocument(
    applicationId: string,
    documentData: {
      originalName: string;
      filename: string;
      mimeType: string;
      size: number;
      path: string;
    }
  ): Promise<DocumentEntity> {
    try {
      const document = await prisma.document.create({
        data: {
          applicationId,
          originalName: documentData.originalName,
          filename: documentData.filename,
          mimeType: documentData.mimeType,
          size: documentData.size,
          path: documentData.path,
          processingStatus: DocumentProcessingStatus.PENDING,
        },
      });

      return document;
    } catch (error) {
      console.error('Error creating document:', error);
      throw new Error('Failed to create document record');
    }
  }

  /**
   * Update document with extracted text
   */
  async updateDocumentText(
    documentId: string,
    extractedText: string
  ): Promise<void> {
    try {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          extractedText: extractedText.trim(),
          processingStatus: DocumentProcessingStatus.COMPLETED,
        },
      });
    } catch (error) {
      console.error('Error updating document text:', error);
      throw new Error('Failed to update document text');
    }
  }

  /**
   * Update document processing status
   */
  async updateDocumentStatus(
    documentId: string,
    status: DocumentProcessingStatus
  ): Promise<void> {
    try {
      await prisma.document.update({
        where: { id: documentId },
        data: { processingStatus: status },
      });
    } catch (error) {
      console.error('Error updating document status:', error);
      throw new Error('Failed to update document status');
    }
  }

  /**
   * Create a generated PDF record
   */
  async createGeneratedPdf(
    applicationId: string,
    pdfPath: string
  ): Promise<GeneratedPdfEntity> {
    try {
      const filename = basename(pdfPath);
      const fs = await import('fs/promises');
      const stats = await fs.stat(pdfPath);

      const generatedPdf = await prisma.generatedPdf.create({
        data: {
          applicationId,
          filename,
          path: pdfPath,
          size: stats.size,
        },
      });

      return generatedPdf;
    } catch (error) {
      console.error('Error creating generated PDF record:', error);
      throw new Error('Failed to create generated PDF record');
    }
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus
  ): Promise<void> {
    try {
      await prisma.application.update({
        where: { id: applicationId },
        data: { status },
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      throw new Error('Failed to update application status');
    }
  }

  /**
   * Get application with all related data
   */
  async getApplicationWithDetails(
    applicationId: string
  ): Promise<ApplicationEntity | null> {
    try {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          user: true,
          documents: true,
          generatedPdf: true,
        },
      });

      return application;
    } catch (error) {
      console.error('Error fetching application:', error);
      throw new Error('Failed to fetch application details');
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserEntity | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      return user;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw new Error('Failed to fetch user');
    }
  }

  /**
   * Get applications by user ID
   */
  async getApplicationsByUserId(userId: string): Promise<ApplicationEntity[]> {
    try {
      const applications = await prisma.application.findMany({
        where: { userId },
        include: {
          documents: true,
          generatedPdf: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return applications;
    } catch (error) {
      console.error('Error fetching user applications:', error);
      throw new Error('Failed to fetch user applications');
    }
  }

  /**
   * Update PDF download count
   */
  async incrementPdfDownloadCount(applicationId: string): Promise<void> {
    try {
      await prisma.generatedPdf.update({
        where: { applicationId },
        data: {
          downloadCount: { increment: 1 },
          lastDownloadAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error updating download count:', error);
      // Don't throw error for analytics failure
    }
  }

  /**
   * Clean up expired applications (older than 30 days)
   */
  async cleanupExpiredApplications(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get expired applications with their file paths
      const result = await prisma.application.updateMany({
        where: {
          createdAt: { lt: thirtyDaysAgo },
          status: { not: ApplicationStatus.EXPIRED },
        },
        data: { status: ApplicationStatus.EXPIRED },
      });
      const expiredApplications = await prisma.application.findMany({
        where: {
          createdAt: { lt: thirtyDaysAgo },
          status: ApplicationStatus.EXPIRED,
        },
        include: {
          documents: true,
          generatedPdf: true,
        },
      });
      // Delete files from filesystem
      const fs = await import('fs/promises');
      for (const app of expiredApplications) {
        // Delete uploaded documents
        for (const doc of app.documents) {
          try {
            await fs.unlink(doc.path);
          } catch (error) {
            console.warn(`Failed to delete file: ${doc.path}`, error);
          }
        }

        // Delete generated PDF
        if (app.generatedPdf) {
          try {
            await fs.unlink(app.generatedPdf.path);
          } catch (error) {
            console.warn(
              `Failed to delete PDF: ${app.generatedPdf.path}`,
              error
            );
          }
        }
      }
      return result.count;
    } catch (error) {
      console.error('Error cleaning up expired applications:', error);
      throw new Error('Failed to cleanup expired applications');
    }
  }

  /**
   * Get application statistics
   */
  async getApplicationStats(): Promise<{
    total: number;
    completed: number;
    processing: number;
    failed: number;
    expired: number;
  }> {
    try {
      const [total, completed, processing, failed, expired] = await Promise.all(
        [
          prisma.application.count(),
          prisma.application.count({
            where: { status: ApplicationStatus.COMPLETED },
          }),
          prisma.application.count({
            where: { status: ApplicationStatus.PROCESSING },
          }),
          prisma.application.count({
            where: { status: ApplicationStatus.FAILED },
          }),
          prisma.application.count({
            where: { status: ApplicationStatus.EXPIRED },
          }),
        ]
      );

      return { total, completed, processing, failed, expired };
    } catch (error) {
      console.error('Error fetching application stats:', error);
      throw new Error('Failed to fetch application statistics');
    }
  }
}
