import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { FileStorageConfig, StorageResult, FileMetadata } from '../types';

export class FileStorageService {
  private readonly baseUploadDir: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(config: FileStorageConfig) {
    this.baseUploadDir = config.uploadDir;
    this.maxFileSize = config.maxFileSize;
    this.allowedMimeTypes = config.allowedMimeTypes;
  }

  async initialize(): Promise<void> {
    try {
      await this.ensureDirectoryExists(this.baseUploadDir);
      await this.ensureDirectoryExists(path.join(this.baseUploadDir, 'uploads'));
      await this.ensureDirectoryExists(path.join(this.baseUploadDir, 'generated'));
      await this.ensureDirectoryExists(path.join(this.baseUploadDir, 'temp'));
    } catch (error) {
      throw new Error(`Failed to initialize file storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async saveFile(
    file: Buffer,
    originalName: string,
    mimeType: string,
    submissionId: string
  ): Promise<StorageResult> {
    try {
      // Validate file
      this.validateFile(file, mimeType, originalName);

      // Generate unique filename
      const fileExtension = path.extname(originalName);
      const fileName = `${uuidv4()}${fileExtension}`;
      const relativePath = path.join('uploads', submissionId, fileName);
      const fullPath = path.join(this.baseUploadDir, relativePath);

      // Ensure submission directory exists
      await this.ensureDirectoryExists(path.dirname(fullPath));

      // Save file
      await fs.writeFile(fullPath, file);

      // Verify file was saved correctly
      const stats = await fs.stat(fullPath);
      if (stats.size !== file.length) {
        throw new Error('File size mismatch after saving');
      }

      return {
        fileName,
        filePath: relativePath,
        fileSize: file.length,
        success: true,
      };
    } catch (error) {
      throw new Error(`Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getFile(filePath: string): Promise<Buffer> {
    try {
      const fullPath = path.join(this.baseUploadDir, filePath);
      
      // Security check: ensure the path is within our upload directory
      const resolvedPath = path.resolve(fullPath);
      const resolvedBaseDir = path.resolve(this.baseUploadDir);
      
      if (!resolvedPath.startsWith(resolvedBaseDir)) {
        throw new Error('Invalid file path: Path traversal detected');
      }

      const fileBuffer = await fs.readFile(fullPath);
      return fileBuffer;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        throw new Error('File not found');
      }
      throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.baseUploadDir, filePath);
      
      // Security check
      const resolvedPath = path.resolve(fullPath);
      const resolvedBaseDir = path.resolve(this.baseUploadDir);
      
      if (!resolvedPath.startsWith(resolvedBaseDir)) {
        throw new Error('Invalid file path: Path traversal detected');
      }

      await fs.unlink(fullPath);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        // File doesn't exist, consider it already deleted
        return;
      }
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getFileMetadata(filePath: string): Promise<FileMetadata> {
    try {
      const fullPath = path.join(this.baseUploadDir, filePath);
      
      // Security check
      const resolvedPath = path.resolve(fullPath);
      const resolvedBaseDir = path.resolve(this.baseUploadDir);
      
      if (!resolvedPath.startsWith(resolvedBaseDir)) {
        throw new Error('Invalid file path: Path traversal detected');
      }

      const stats = await fs.stat(fullPath);
      
      return {
        fileName: path.basename(filePath),
        filePath: fullPath,
        fileSize: stats.size,
        size: stats.size,
        mimeType: 'application/octet-stream', // Default mime type
        createdAt: stats.birthtime,
        lastModified: stats.mtime,
        modifiedAt: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
      };
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        throw new Error('File not found');
      }
      throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async saveGeneratedPdf(
    pdfBuffer: Buffer,
    submissionId: string,
    fileName?: string
  ): Promise<StorageResult> {
    try {
      const pdfFileName = fileName || `generated-${submissionId}-${Date.now()}.pdf`;
      const relativePath = path.join('generated', pdfFileName);
      const fullPath = path.join(this.baseUploadDir, relativePath);

      // Ensure generated directory exists
      await this.ensureDirectoryExists(path.dirname(fullPath));

      // Save PDF
      await fs.writeFile(fullPath, pdfBuffer);

      // Verify file was saved correctly
      const stats = await fs.stat(fullPath);
      if (stats.size !== pdfBuffer.length) {
        throw new Error('PDF size mismatch after saving');
      }

      return {
        fileName: pdfFileName,
        filePath: relativePath,
        fileSize: pdfBuffer.length,
        success: true,
      };
    } catch (error) {
      throw new Error(`Failed to save generated PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async cleanupTempFiles(olderThanHours: number = 24): Promise<number> {
    try {
      const tempDir = path.join(this.baseUploadDir, 'temp');
      const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
      
      const files = await fs.readdir(tempDir);
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffTime) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      throw new Error(`Failed to cleanup temp files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateFile(file: Buffer, mimeType: string, originalName: string): void {
    // Check file size
    if (file.length > this.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize} bytes`);
    }

    // Check MIME type
    if (!this.allowedMimeTypes.includes(mimeType)) {
      throw new Error(`File type '${mimeType}' is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
    }

    // Check file extension matches MIME type
    const extension = path.extname(originalName).toLowerCase();
    const expectedExtensions: Record<string, string[]> = {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'text/plain': ['.txt'],
    };

    const allowedExtensions = expectedExtensions[mimeType];
    if (allowedExtensions && !allowedExtensions.includes(extension)) {
      throw new Error(`File extension '${extension}' does not match MIME type '${mimeType}'`);
    }

    // Basic file content validation for PDFs
    if (mimeType === 'application/pdf') {
      const pdfHeader = file.subarray(0, 4).toString();
      if (pdfHeader !== '%PDF') {
        throw new Error('Invalid PDF file: Missing PDF header');
      }
    }
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        await fs.mkdir(dirPath, { recursive: true });
      } else {
        throw error;
      }
    }
  }

  // Utility method to get file URL for serving
  getFileUrl(filePath: string): string {
    return `/api/files/${encodeURIComponent(filePath)}`;
  }

  // Get storage statistics
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    uploadedFiles: number;
    generatedFiles: number;
  }> {
    try {
      const uploadsDir = path.join(this.baseUploadDir, 'uploads');
      const generatedDir = path.join(this.baseUploadDir, 'generated');

      const [uploadStats, generatedStats] = await Promise.all([
        this.getDirectoryStats(uploadsDir),
        this.getDirectoryStats(generatedDir),
      ]);

      return {
        totalFiles: uploadStats.fileCount + generatedStats.fileCount,
        totalSize: uploadStats.totalSize + generatedStats.totalSize,
        uploadedFiles: uploadStats.fileCount,
        generatedFiles: generatedStats.fileCount,
      };
    } catch (error) {
      throw new Error(`Failed to get storage statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getDirectoryStats(dirPath: string): Promise<{ fileCount: number; totalSize: number }> {
    try {
      let fileCount = 0;
      let totalSize = 0;

      const items = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item.name);
        
        if (item.isFile()) {
          const stats = await fs.stat(itemPath);
          fileCount++;
          totalSize += stats.size;
        } else if (item.isDirectory()) {
          const subStats = await this.getDirectoryStats(itemPath);
          fileCount += subStats.fileCount;
          totalSize += subStats.totalSize;
        }
      }

      return { fileCount, totalSize };
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return { fileCount: 0, totalSize: 0 };
      }
      throw error;
    }
  }
}

// Default configuration
const defaultConfig: FileStorageConfig = {
  uploadDir: path.join(process.cwd(), 'storage'),
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['application/pdf'],
};

// Singleton instance
export const fileStorageService = new FileStorageService(defaultConfig);