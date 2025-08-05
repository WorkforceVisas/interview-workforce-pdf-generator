'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FileText, CheckCircle, Download, ArrowLeft, FileDown } from 'lucide-react';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('id');
  const pdfUrl = searchParams.get('pdf');

  const downloadPdf = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
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

      {/* Success Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-8 md:p-12 text-center">
              {/* Success Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>

              {/* Success Message */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Application Submitted Successfully!
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Your application has been processed and your professional PDF is ready for download.
                </p>
                {submissionId && (
                  <p className="text-sm text-slate-500 mt-4">
                    Submission ID: <span className="font-mono bg-slate-100 px-2 py-1 rounded">{submissionId}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                {pdfUrl && (
                  <button
                    onClick={downloadPdf}
                    className="inline-flex items-center px-8 py-4 bg-slate-900 text-white text-lg font-semibold rounded-xl hover:bg-slate-800 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 group"
                  >
                    <FileDown className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                    Download Your PDF
                  </button>
                )}
                <Link
                  href="/apply"
                  className="inline-flex items-center px-8 py-4 border-2 border-slate-300 text-slate-700 text-lg font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 group"
                >
                  <Download className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  Submit Another Application
                </Link>
              </div>

              {/* Additional Info */}
              <div className="bg-slate-50 rounded-xl p-6 text-left">
                <h3 className="font-semibold text-slate-900 mb-3">What happens next?</h3>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Your PDF has been generated with professional formatting</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>You can download it anytime using the link above</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Keep your submission ID for future reference</span>
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

export default function Success() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}