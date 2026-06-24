'use client';

import { useState, useCallback } from 'react';
import type { ApplicationFormData, SubmissionResponse, Submission } from '../types';

export interface UseApplicationSubmissionOptions {
  onSuccess?: (response: SubmissionResponse) => void;
  onError?: (error: Error) => void;
}

export interface UseApplicationSubmissionReturn {
  submitApplication: (data: ApplicationFormData, file?: File) => Promise<SubmissionResponse>;
  getSubmission: (id: string) => Promise<Submission | null>;
  downloadPdf: (id: string) => Promise<void>;
  reprocessSubmission: (id: string) => Promise<SubmissionResponse>;
  deleteSubmission: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useApplicationSubmission = (
  options: UseApplicationSubmissionOptions = {}
): UseApplicationSubmissionReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((err: unknown) => {
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    setError(errorMessage);
    if (options.onError) {
      options.onError(new Error(errorMessage));
    }
  }, [options]);

  const submitApplication = useCallback(async (
    data: ApplicationFormData,
    file?: File
  ): Promise<SubmissionResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      // Append form fields
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Append file if provided
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch('/api/submissions', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit application');
      }

      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [options, handleError]);

  const getSubmission = useCallback(async (id: string): Promise<Submission | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/submissions/${id}`);
      
      if (response.status === 404) {
        return null;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch submission');
      }

      return result.data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const downloadPdf = useCallback(async (id: string): Promise<void> => {
    setError(null);

    try {
      const response = await fetch(`/api/submissions/${id}/download`);

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to download PDF');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `application_${id}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [handleError]);

  const reprocessSubmission = useCallback(async (id: string): Promise<SubmissionResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/submissions/${id}/reprocess`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to reprocess submission');
      }

      return result;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const deleteSubmission = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete submission');
      }
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  return {
    submitApplication,
    getSubmission,
    downloadPdf,
    reprocessSubmission,
    deleteSubmission,
    isLoading,
    error,
    clearError,
  };
};