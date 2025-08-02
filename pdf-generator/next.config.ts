import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Handle PDF.js worker and canvas issues
    if (isServer) {
      // Server-side configuration
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
        encoding: false,
      };
      
      // Ignore PDF.js worker on server-side
      config.externals = config.externals || [];
      config.externals.push({
        'pdfjs-dist/build/pdf.worker.js': 'commonjs pdfjs-dist/build/pdf.worker.js',
      });
    }

    // Client and server configuration
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      encoding: false,
      fs: false,
    };

    return config;
  },
  
  // Serve the PDF worker from your public directory
  async rewrites() {
    return [
      {
        source: '/pdf.worker.js',
        destination: '/pdf-worker/pdf.worker.min.js',
      },
    ];
  },

  // Experimental features that may help with PDF.js
  experimental: {
    esmExternals: 'loose',
  },
};

export default nextConfig;
