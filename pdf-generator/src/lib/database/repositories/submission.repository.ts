import { prisma } from '../client';
import type { Submission, SubmissionStatus } from '../../../types';

interface DbSubmission {
  id: string;
  userId: string;
  jobDescription: string;
  status: string;
  generatedPdfPath: string | null;
  uploadedFileName?: string | null;
  uploadedFilePath?: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export class SubmissionRepository {
  async create(submissionData: {
    userId: string;
    jobDescription: string;
    status?: SubmissionStatus;
    uploadedFileName?: string;
    uploadedFilePath?: string;
  }): Promise<Submission> {
    try {
      const createData: {
        userId: string;
        jobDescription: string;
        status: string;
        uploadedFileName?: string;
        uploadedFilePath?: string;
      } = {
        userId: submissionData.userId,
        jobDescription: submissionData.jobDescription,
        status: submissionData.status || 'pending',
      };

      if (submissionData.uploadedFileName) {
        createData.uploadedFileName = submissionData.uploadedFileName;
      }

      if (submissionData.uploadedFilePath) {
        createData.uploadedFilePath = submissionData.uploadedFilePath;
      }

      const dbSubmission = await prisma.submission.create({
         data: createData,
         include: {
           user: true,
         },
       });
       
       return this.mapToSubmission(dbSubmission);
    } catch (_error) {
      throw new Error(`Failed to create submission: ${_error instanceof Error ? _error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string): Promise<Submission | null> {
    try {
      const submission = await prisma.submission.findUnique({
        where: { id },
        include: {
          user: true,
        },
      });
      
      return submission ? this.mapToSubmission(submission) : null;
    } catch (_error) {
      throw new Error(`Failed to find submission: ${_error instanceof Error ? _error.message : 'Unknown error'}`);
    }
  }

  async findByUserId(userId: string, options?: {
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'updatedAt' | 'status';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ submissions: Submission[]; total: number }> {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options || {};
      const skip = (page - 1) * limit;

      const [submissions, total] = await Promise.all([
        prisma.submission.findMany({
          where: { userId },
          include: {
            user: true,
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.submission.count({ where: { userId } }),
      ]);
      
      return {
        submissions: submissions.map(this.mapToSubmission),
        total,
      };
    } catch (_error) {
      throw new Error(`Failed to find submissions by user: ${_error instanceof Error ? _error.message : 'Unknown error'}`);
    }
  }

  async updateStatus(id: string, status: SubmissionStatus, generatedPdfPath?: string): Promise<Submission> {
    try {
      const submission = await prisma.submission.update({
        where: { id },
        data: {
          status,
          generatedPdfPath,
          updatedAt: new Date(),
        },
        include: {
          user: true,
        },
      });
      
      return this.mapToSubmission(submission);
    } catch (_error) {
      if (_error instanceof Error && 'code' in _error && _error.code === 'P2025') {
        throw new Error('Submission not found');
      }
      throw new Error(`Failed to update submission status: ${_error instanceof Error ? _error.message : 'Unknown error'}`);
    }
  }

  async update(id: string, data: Partial<{
    jobDescription: string;
    status: SubmissionStatus;
    generatedPdfPath: string;
  }>): Promise<Submission> {
    try {
      const submission = await prisma.submission.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          user: true,
        },
      });
      
      return this.mapToSubmission(submission);
    } catch (_error) {
      if (_error instanceof Error && 'code' in _error && _error.code === 'P2025') {
        throw new Error('Submission not found');
      }
      throw new Error('Failed to update submission');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.submission.delete({
        where: { id },
      });
    } catch (_error) {
      if (_error instanceof Error && 'code' in _error && _error.code === 'P2025') {
        throw new Error('Submission not found');
      }
      throw new Error('Failed to delete submission');
    }
  }

  async findByStatus(status: SubmissionStatus, options?: {
    page?: number;
    limit?: number;
  }): Promise<{ submissions: Submission[]; total: number }> {
    try {
      const { page = 1, limit = 10 } = options || {};
      const skip = (page - 1) * limit;

      const [submissions, total] = await Promise.all([
        prisma.submission.findMany({
          where: { status },
          include: {
            user: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.submission.count({ where: { status } }),
      ]);
      
      return {
        submissions: submissions.map(this.mapToSubmission),
        total,
      };
    } catch (_error) {
      throw new Error(`Failed to find submissions by status: ${_error instanceof Error ? _error.message : 'Unknown error'}`);
    }
  }

  private mapToSubmission(dbSubmission: DbSubmission): Submission {
    return {
      id: dbSubmission.id,
      userId: dbSubmission.userId,
      jobDescription: dbSubmission.jobDescription,
      status: dbSubmission.status as SubmissionStatus,
      generatedPdfPath: dbSubmission.generatedPdfPath || undefined,
      uploadedFileName: dbSubmission.uploadedFileName || undefined,
      uploadedFilePath: dbSubmission.uploadedFilePath || undefined,
      createdAt: dbSubmission.createdAt,
      updatedAt: dbSubmission.updatedAt,
      submittedAt: dbSubmission.createdAt, // Use createdAt as submission date
      user: dbSubmission.user ? {
        id: dbSubmission.user.id,
        firstName: dbSubmission.user.firstName,
        lastName: dbSubmission.user.lastName,
        email: dbSubmission.user.email,
        phone: dbSubmission.user.phone || undefined,
        createdAt: dbSubmission.user.createdAt,
        updatedAt: dbSubmission.user.updatedAt,
      } : undefined,
    };
  }
}

// Singleton instance
export const submissionRepository = new SubmissionRepository();