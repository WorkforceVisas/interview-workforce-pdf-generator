import { userRepository, submissionRepository } from '../lib/database/repositories';
import { fileStorageService } from './file-storage.service';
import { pdfGeneratorService } from '../lib/pdf/pdf-generator.service';
import { ValidationUtils } from '../utils';
import type { ApplicationFormData, User, Submission, SubmissionResponse } from '../types';
import { SubmissionStatus } from '../types';

export class ApplicationService {
  async processApplication(
    formData: ApplicationFormData,
    uploadedFile?: { buffer: Buffer; originalName: string; mimeType: string; size: number }
  ): Promise<SubmissionResponse> {
    // Validate form data
    const validation = ValidationUtils.validateAndSanitizeFormData(formData);
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).join(', ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    // Validate file if provided
    if (uploadedFile) {
      const fileValidation = ValidationUtils.validateFileUpload({
        name: uploadedFile.originalName,
        size: uploadedFile.size,
        type: uploadedFile.mimeType,
      });
      if (!fileValidation.isValid) {
        throw new Error(`File validation failed: ${fileValidation.errors.join(', ')}`);
      }
    }

    // Create user and submission
    const user = await this.findOrCreateUser(validation.sanitizedData as ApplicationFormData);
    const filePath = uploadedFile ? await this.saveFile(uploadedFile) : undefined;
    
    const submission = await submissionRepository.create({
      userId: user.id,
      jobDescription: formData.jobDescription,
      status: SubmissionStatus.PENDING,
      uploadedFileName: uploadedFile?.originalName,
      uploadedFilePath: filePath,
    });

    // Generate PDF and update submission
    const pdfPath = await this.generatePdf(user, submission, filePath);
    await submissionRepository.updateStatus(submission.id, SubmissionStatus.COMPLETED, pdfPath);

    return {
      success: true,
      submissionId: submission.id,
      pdfDownloadUrl: `/api/submissions/${submission.id}/download`,
      status: SubmissionStatus.COMPLETED,
    };
  }

  async getSubmission(submissionId: string): Promise<Submission | null> {
    return submissionRepository.findById(submissionId);
  }

  async downloadSubmissionPdf(submissionId: string) {
    const submission = await submissionRepository.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    // If PDF doesn't exist or submission doesn't have user data, regenerate it
    if (!submission.generatedPdfPath || !submission.user) {
      console.log('Regenerating PDF due to missing PDF path or user data');
      const result = await this.reprocessSubmission(submissionId);
      // Fetch the updated submission with the new PDF path
      const updatedSubmission = await submissionRepository.findById(submissionId);
      if (!updatedSubmission?.generatedPdfPath) {
        throw new Error('Failed to generate PDF');
      }
      const buffer = await fileStorageService.getFile(updatedSubmission.generatedPdfPath);
      return {
        buffer,
        fileName: `application-${submission.id}.pdf`,
        mimeType: 'application/pdf',
      };
    }

    const buffer = await fileStorageService.getFile(submission.generatedPdfPath);
    return {
      buffer,
      fileName: `application-${submission.id}.pdf`,
      mimeType: 'application/pdf',
    };
  }

  async reprocessSubmission(submissionId: string): Promise<SubmissionResponse> {
    const submission = await submissionRepository.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    const user = await userRepository.findById(submission.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update status to processing
    await submissionRepository.update(submissionId, { status: SubmissionStatus.PROCESSING });

    try {
      // Regenerate PDF
      const pdfPath = await this.generatePdf(user, submission, submission.uploadedFilePath || undefined);
      
      // Update submission with new PDF path and completed status
      await submissionRepository.updateStatus(submissionId, SubmissionStatus.COMPLETED, pdfPath);

      return {
        success: true,
        submissionId: submissionId,
        pdfDownloadUrl: `/api/submissions/${submissionId}/download`,
        status: SubmissionStatus.COMPLETED,
      };
    } catch (error) {
      // Update status to failed
      await submissionRepository.updateStatus(submissionId, SubmissionStatus.FAILED);
      throw error;
    }
  }

  async deleteSubmission(submissionId: string): Promise<void> {
    const submission = await submissionRepository.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    // Delete associated files
    if (submission.uploadedFilePath) {
      try {
        await fileStorageService.deleteFile(submission.uploadedFilePath);
      } catch (error) {
        console.warn('Failed to delete submission file:', error);
      }
    }

    if (submission.generatedPdfPath) {
      try {
        await fileStorageService.deleteFile(submission.generatedPdfPath);
      } catch (error) {
        console.warn('Failed to delete PDF file:', error);
      }
    }

    // Delete submission from database
    await submissionRepository.delete(submissionId);
  }

  private async findOrCreateUser(formData: ApplicationFormData): Promise<User> {
    const existingUser = await userRepository.findByEmail(formData.email);
    if (existingUser) return existingUser;

    return userRepository.create({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || null,
    });
  }

  private async saveFile(file: { buffer: Buffer; originalName: string; mimeType: string }) {
    const result = await fileStorageService.saveFile(
      file.buffer,
      file.originalName,
      file.mimeType,
      'temp'
    );
    return result.filePath;
  }

  private async generatePdf(user: User, submission: Submission, filePath?: string) {
    // Prepare uploaded files array for PDF generation
    let uploadedFiles: Array<{ originalName: string; filePath?: string; fileSize?: number }> = [];
    
    if (filePath && submission.uploadedFileName) {
      try {
        // Get file metadata if available
        const fileMetadata = await fileStorageService.getFileMetadata(filePath);
        uploadedFiles = [{
          originalName: submission.uploadedFileName,
          filePath: filePath,
          fileSize: fileMetadata?.fileSize
        }];
      } catch (error) {
        // Fallback to basic info if metadata retrieval fails
        uploadedFiles = [{
          originalName: submission.uploadedFileName,
          filePath: filePath
        }];
      }
    }

    // Attach user to submission for PDF generation
    const submissionWithUser = {
      ...submission,
      user: user
    };

    const pdfBuffer = await pdfGeneratorService.generateApplicationPdf({
      submission: submissionWithUser,
      uploadedFiles,
    });

    // Store the generated PDF
    const pdfFileName = `application_${submission.id}_${Date.now()}.pdf`;
    const storedPdf = await fileStorageService.saveFile(
      pdfBuffer,
      pdfFileName,
      'application/pdf',
      submission.id
    );

    return storedPdf.filePath;
  }
}

export const applicationService = new ApplicationService();