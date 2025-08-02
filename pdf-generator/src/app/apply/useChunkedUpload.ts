import { useState, useCallback } from "react";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface ChunkedUploadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks (well under any serverless limit)

export function useChunkedUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0,
  });
  const [error, setError] = useState<string>("");

  const uploadFile = useCallback(
    async (file: File): Promise<ChunkedUploadResult> => {
      if (!file) {
        return { success: false, error: "No file provided" };
      }

      setIsUploading(true);
      setError("");
      setProgress({ loaded: 0, total: file.size, percentage: 0 });

      try {
        // Generate unique upload ID
        const uploadId = `${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Calculate chunks
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        let uploadedChunks = 0;

        // Upload chunks sequentially
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
          const start = chunkIndex * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const chunk = file.slice(start, end);

          const formData = new FormData();
          formData.append("chunk", chunk);
          formData.append("uploadId", uploadId);
          formData.append("chunkIndex", chunkIndex.toString());
          formData.append("totalChunks", totalChunks.toString());
          formData.append("originalFileName", file.name);

          const response = await fetch("/api/upload-chunk", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Failed to upload chunk ${chunkIndex + 1}`);
          }

          const result = await response.json();

          if (result.error) {
            throw new Error(result.error);
          }

          uploadedChunks++;
          const newProgress = {
            loaded: uploadedChunks * CHUNK_SIZE,
            total: file.size,
            percentage: Math.round((uploadedChunks / totalChunks) * 100),
          };
          setProgress(newProgress);

          // If upload is complete, return the file path
          if (result.complete) {
            setIsUploading(false);
            return { success: true, filePath: result.filePath };
          }
        }

        throw new Error("Upload incomplete - unexpected server response");
      } catch (err) {
        setIsUploading(false);
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress({ loaded: 0, total: 0, percentage: 0 });
    setError("");
  }, []);

  return {
    uploadFile,
    isUploading,
    progress,
    error,
    reset,
  };
}
