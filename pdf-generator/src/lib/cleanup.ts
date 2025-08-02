import { readdir, stat, unlink } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";

interface CleanupResult {
  success: boolean;
  cleanedCount: number;
  errors: string[];
}

export async function cleanupOrphanedFiles(): Promise<CleanupResult> {
  const result: CleanupResult = {
    success: true,
    cleanedCount: 0,
    errors: [],
  };

  try {
    // Get all files in uploads directory
    const uploadsDir = join(process.cwd(), "uploads");
    const files = await readdir(uploadsDir);

    // Filter for uploaded files (not generated PDFs)
    // Pattern: timestamp-randomId-originalFileName.pdf
    const uploadedFiles = files.filter(
      (file) =>
        file.includes("-") &&
        file.endsWith(".pdf") &&
        file.split("-")[0].match(/^\d+/) // starts with timestamp
    );

    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago

    for (const file of uploadedFiles) {
      const filePath = join(uploadsDir, file);

      try {
        // Check if file is older than 24 hours
        const fileStats = await stat(filePath);
        if (fileStats.mtime.getTime() > cutoffTime) {
          continue; // Skip files newer than 24 hours
        }

        // Check if file is referenced in any submission
        const isReferenced = await prisma.submission.findFirst({
          where: {
            OR: [
              { filePath: { endsWith: file } },
              { filePath: { contains: file } },
            ],
          },
        });

        // If not referenced and older than 24 hours, delete it
        if (!isReferenced) {
          await unlink(filePath);
          result.cleanedCount++;
          console.log(`Cleaned up orphaned file: ${file}`);
        }
      } catch (error) {
        const errorMsg = `Error processing file ${file}: ${error}`;
        result.errors.push(errorMsg);
        console.warn(errorMsg);
      }
    }

    // Also clean up temporary chunk files older than 1 hour
    try {
      const tempDir = join(uploadsDir, "temp");
      const tempFiles = await readdir(tempDir).catch(() => []);
      const oneHourAgo = Date.now() - 60 * 60 * 1000;

      for (const tempFile of tempFiles) {
        const tempFilePath = join(tempDir, tempFile);
        try {
          const tempStats = await stat(tempFilePath);
          if (tempStats.mtime.getTime() < oneHourAgo) {
            await unlink(tempFilePath);
            console.log(`Cleaned up old temp file: ${tempFile}`);
          }
        } catch {
          // Ignore temp file cleanup errors
        }
      }
    } catch {
      // Ignore if temp directory doesn't exist
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Global cleanup error: ${error}`);
    console.error("Cleanup error:", error);
  }

  return result;
}

// Helper function to check if a file is likely orphaned
export async function isFileOrphaned(filename: string): Promise<boolean> {
  try {
    const submission = await prisma.submission.findFirst({
      where: {
        OR: [
          { filePath: { endsWith: filename } },
          { filePath: { contains: filename } },
        ],
      },
    });
    return !submission;
  } catch (error) {
    console.error("Error checking if file is orphaned:", error);
    return false; // Err on the side of caution
  }
}
