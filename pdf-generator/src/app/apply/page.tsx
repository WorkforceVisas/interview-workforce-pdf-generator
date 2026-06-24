'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, ArrowLeft, Download } from 'lucide-react';
import { ApplicationForm } from '@/components/forms/ApplicationForm';
import type { SubmissionResponse } from '@/types';

export default function Apply() {
  const router = useRouter();

  const handleSubmissionComplete = (response: SubmissionResponse) => {
    if (response.success) {
      // Redirect to success page with submission details
      const params = new URLSearchParams({
        id: response.submissionId,
        pdf: response.pdfDownloadUrl
      });
      router.push(`/success?${params.toString()}`);
    } else {
      // Redirect to failure page with error details
      const params = new URLSearchParams({
        error: 'Submission failed. Please try again.'
      });
      router.push(`/failure?${params.toString()}`);
    }
  };

  const handleSubmissionError = (error: string) => {
    // Redirect to failure page with error details
    const params = new URLSearchParams({
      error: error
    });
    router.push(`/failure?${params.toString()}`);
  };
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <Link href="/" className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                Workforce PDF
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors font-medium flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full text-sm font-medium text-slate-300 mb-6">
            <Download className="w-4 h-4 mr-2" />
            Professional PDF Generation
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Create Your Application
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Fill out your details below and we&apos;ll generate a beautifully formatted PDF ready for submission.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-8 md:p-12">
              <ApplicationForm 
                onSubmissionComplete={handleSubmissionComplete}
                onSubmissionError={handleSubmissionError}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}