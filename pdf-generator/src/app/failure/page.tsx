'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FileText, XCircle, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { Suspense } from 'react';

function FailureContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'An unexpected error occurred';
  const submissionId = searchParams.get('id');

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

      {/* Failure Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-8 md:p-12 text-center">
              {/* Error Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
              </div>

              {/* Error Message */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Submission Failed
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-4">
                  We encountered an issue while processing your application. Please try again.
                </p>
                
                {/* Error Details */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-2xl mx-auto">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <h3 className="font-semibold text-red-800 mb-1">Error Details:</h3>
                      <p className="text-red-700 text-sm">{error}</p>
                      {submissionId && (
                        <p className="text-red-600 text-xs mt-2">
                          Reference ID: <span className="font-mono">{submissionId}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href="/apply"
                  className="inline-flex items-center px-8 py-4 bg-slate-900 text-white text-lg font-semibold rounded-xl hover:bg-slate-800 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 group"
                >
                  <RefreshCw className="w-5 h-5 mr-2 group-hover:animate-spin" />
                  Try Again
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center px-8 py-4 border-2 border-slate-300 text-slate-700 text-lg font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 group"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Home
                </Link>
              </div>

              {/* Troubleshooting Tips */}
              <div className="bg-slate-50 rounded-xl p-6 text-left">
                <h3 className="font-semibold text-slate-900 mb-3">Troubleshooting Tips:</h3>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Check that all required fields are filled out correctly</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Ensure your uploaded file is in a supported format (PDF, DOC, DOCX)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Verify your internet connection is stable</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>If the problem persists, please contact support with the reference ID above</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Failure() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <FailureContent />
    </Suspense>
  );
}