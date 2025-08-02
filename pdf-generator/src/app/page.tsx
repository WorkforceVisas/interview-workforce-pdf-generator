import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(147,51,234,0.1),transparent_50%)]"></div>
      </div>

      {/* Floating orbs for visual appeal */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>

      <div className="relative z-10 grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <main className="flex flex-col gap-12 row-start-2 items-center sm:items-start max-w-6xl mx-auto">
          {/* Hero section */}
          <div className="text-center sm:text-left max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Trusted by 10,000+ applicants
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold mb-6 text-slate-900 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                PDF Generator
              </span>
              <br />
              <span className="text-slate-700">Job Application Portal</span>
            </h1>

            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl">
              Transform your application process with our intelligent PDF
              generator. Submit your details, upload documents, and create
              professional application summaries in seconds.
            </p>
          </div>

          {/* CTA section */}
          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <Link
              href="/apply"
              className="group relative rounded-2xl border border-transparent transition-all duration-300 flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white gap-3 hover:from-blue-700 hover:to-indigo-700 font-semibold text-base h-14 px-8 w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105"
            >
              <svg
                className="w-5 h-5 transition-transform group-hover:rotate-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Start Your Application
              <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </Link>

            <button className="group flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-white/50 backdrop-blur-sm">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-8V8a3 3 0 00-3-3H7a3 3 0 00-3 3v8a3 3 0 003 3h10a3 3 0 003-3v-1"
                />
              </svg>
              Watch Demo
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Features section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full">
            <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:-translate-y-2 hover:bg-white/80">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-3">
                Intuitive Form
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Streamlined application process with smart field validation and
                auto-save functionality.
              </p>
            </div>

            <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:-translate-y-2 hover:bg-white/80">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-3">
                Universal Upload
              </h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Drag & drop support for all major file formats including PDF,
                DOCX, PPTX, XLSX, CSV, and more.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg">
                  PDF
                </span>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg">
                  DOCX
                </span>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg">
                  XLSX
                </span>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg">
                  CSV
                </span>
              </div>
            </div>

            <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:-translate-y-2 hover:bg-white/80">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-3">
                Instant Generation
              </h3>
              <p className="text-slate-600 leading-relaxed">
                AI-powered PDF creation with professional formatting and
                intelligent content organization.
              </p>
            </div>
          </div>

          {/* Stats section */}
          <div className="flex flex-wrap justify-center gap-8 mt-16 w-full">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">
                10,000+
              </div>
              <div className="text-slate-600 text-sm font-medium">
                Applications Generated
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">
                99.9%
              </div>
              <div className="text-slate-600 text-sm font-medium">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">
                &lt;30s
              </div>
              <div className="text-slate-600 text-sm font-medium">
                Average Generation Time
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">
                4.9/5
              </div>
              <div className="text-slate-600 text-sm font-medium">
                User Satisfaction
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
