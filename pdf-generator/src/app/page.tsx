'use client';

import Link from 'next/link';
import { FileText, Zap, Download, ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
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
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Workforce PDF
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                href="/apply" 
                className="bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-slate-100 rounded-full text-sm font-medium text-slate-700 mb-8">
              <Zap className="w-4 h-4 mr-2 text-slate-600" />
              Professional Document Generation
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                Transform Applications
              </span>
              <br />
              <span className="text-slate-600">Into Perfect PDFs</span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Create stunning, professional job application documents in seconds. 
              Our advanced PDF generation technology ensures your applications 
              stand out with perfect formatting and presentation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                href="/apply"
                className="inline-flex items-center px-8 py-4 bg-slate-900 text-white text-lg font-semibold rounded-xl hover:bg-slate-800 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 group"
              >
                <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                Generate PDF Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why Choose Workforce PDF?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built with enterprise-grade technology for professional results
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Lightning Fast</h3>
              <p className="text-slate-600 leading-relaxed">
                Generate professional PDFs in seconds with our optimized processing engine
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Secure & Private</h3>
              <p className="text-slate-600 leading-relaxed">
                Your data is protected with enterprise-level security and privacy standards
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Perfect Formatting</h3>
              <p className="text-slate-600 leading-relaxed">
                Every PDF is perfectly formatted and ready for professional submission
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Create Your Professional PDF?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who trust Workforce PDF for their job applications
          </p>
          <Link 
            href="/apply"
            className="inline-flex items-center px-8 py-4 bg-white text-slate-900 text-lg font-semibold rounded-xl hover:bg-slate-100 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 group"
          >
            <FileText className="w-5 h-5 mr-2 group-hover:animate-pulse" />
            Start Creating Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-500">
              © 2024 PDF Generator. Built with Next.js, Prisma, and React PDF.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
