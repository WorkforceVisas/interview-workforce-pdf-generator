'use client';

import { useState } from 'react';
import { ApplicationForm } from '@/components/ApplicationForm';
import { SuccessModal } from '@/components/SuccessModal';
import { ErrorAlert } from '@/components/ErrorAlert';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ApplicationFormData, SubmissionResponse, ApiResponse } from '@/types';

export default function ApplyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmissionResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (formData: ApplicationFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Create FormData for multipart upload
      const submitData = new FormData();

      // Add personal details as JSON string
      submitData.append(
        'personalDetails',
        JSON.stringify(formData.personalDetails)
      );
      submitData.append('jobDescription', formData.jobDescription);

      // Add file if present
      if (formData.supportingDocument) {
        submitData.append('supportingDocument', formData.supportingDocument);
      }

      const response = await fetch('/api/applications', {
        method: 'POST',
        body: submitData,
      });

      const result: ApiResponse<SubmissionResponse> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit application');
      }

      if (result.data) {
        setSubmitResult(result.data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewApplication = () => {
    setSubmitResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Job Application Portal
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Submit your personal details, job description, and supporting
            documents. We'll generate a professional PDF summary for you to
            download.
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorAlert message={error} onClose={() => setError(null)} />
          </div>
        )}

        {isSubmitting && (
          <div className="mb-6">
            <LoadingSpinner message="Processing your application..." />
          </div>
        )}

        {!submitResult && !isSubmitting && (
          <div className="bg-white shadow-xl rounded-lg p-8">
            <ApplicationForm
              onSubmit={handleFormSubmit}
              disabled={isSubmitting}
            />
          </div>
        )}

        {submitResult && (
          <SuccessModal
            result={submitResult}
            onNewApplication={handleNewApplication}
          />
        )}
      </div>
    </div>
  );
}
