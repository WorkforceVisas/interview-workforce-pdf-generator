'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applicationFormSchema } from '../../lib/validations/schemas';
import { Input, Textarea, FileUpload, CheckCircle, XCircle } from '../ui';
import type { ApplicationFormData, SubmissionResponse } from '../../types';

export interface ApplicationFormProps {
  onSubmissionComplete?: (response: SubmissionResponse) => void;
  onSubmissionError?: (error: string) => void;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ onSubmissionComplete, onSubmissionError }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<SubmissionResponse | null>(null);

  const { register, handleSubmit, formState: { errors, isValid }, reset, watch } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    mode: 'onChange',
  });

  const jobDescription = watch('jobDescription', '');

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(null);

    try {
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Add file if selected
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await fetch('/api/submissions', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application');
      }

      setSubmitSuccess(result);
      reset();
      setSelectedFile(null);
      
      if (onSubmissionComplete) {
        onSubmissionComplete(result);
      }
    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      if (onSubmissionError) {
        onSubmissionError(errorMessage);
      } else {
        setSubmitError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadPdf = () => {
    if (submitSuccess?.pdfDownloadUrl) {
      window.open(submitSuccess.pdfDownloadUrl, '_blank');
    }
  };

  const resetForm = () => {
    setSubmitSuccess(null);
    setSubmitError('');
    reset();
    setSelectedFile(null);
  };

  if (submitSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted Successfully!</h3>
          <p className="text-slate-600">Your application has been processed and your PDF is ready for download.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={downloadPdf}
            className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            Download PDF
          </button>
          <button
            onClick={resetForm}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name"
          {...register('firstName')}
          error={errors.firstName?.message}
          placeholder="Enter your first name"
        />
        <Input
          label="Last Name"
          {...register('lastName')}
          error={errors.lastName?.message}
          placeholder="Enter your last name"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Email Address"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          placeholder="Enter your email address"
        />
        <Input
          label="Phone Number"
          type="tel"
          {...register('phone')}
          error={errors.phone?.message}
          placeholder="Enter your phone number"
        />
      </div>

      <div>
        <Textarea
          label="Job Description"
          {...register('jobDescription')}
          error={errors.jobDescription?.message}
          placeholder="Describe your current job role, responsibilities, and experience..."
          rows={6}
        />
        <div className="mt-2 text-sm text-slate-500">
          {jobDescription.length}/500 characters
        </div>
      </div>

      <div>
        <FileUpload
           label="Supporting Document (Optional)"
           accept=".pdf"
           onFileSelect={setSelectedFile}
           maxSize={10 * 1024 * 1024} // 10MB
         />
      </div>

      {submitError && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700">{submitError}</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="px-8 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <span>Submit Application</span>
          )}
        </button>
      </div>
    </form>
  );
};

export { ApplicationForm };