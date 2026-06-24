# PDF Generator - From Form to PDF

A Next.js application that takes user-submitted data + an uploaded file and turns it into a single PDF.

## Quick Start

```bash
# Install dependencies
npm install

# Set up database
cp .env.example .env
npx prisma db push

# Run development server
npm run dev
```

Then visit `http://localhost:3000`

## Features

- **Form Input**: Personal details + job description text
- **File Upload**: PDF file attachment support
- **PDF Generation**: Professional formatted output combining user data and uploaded content
- **Database**: SQLite with Prisma for data persistence
- **Local Storage**: Files stored in `./uploads` directory

## User Flow

1. **Landing Page** – Professional homepage with clear call-to-action
2. **Application Form** – Clean, intuitive form for personal details and job description
3. **File Upload** – Secure upload for resume/CV documents (PDF format)
4. **PDF Generation** – Instant generation of professionally formatted application PDF
5. **Download** – Immediate download of the generated PDF document

## Architecture

The application follows a modern, scalable architecture:

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes with proper error handling
- **Database**: SQLite with Prisma ORM for type-safe database operations
- **File Storage**: Local file system with organized directory structure
- **PDF Generation**: React-PDF for high-quality document generation

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run type-check` - Run TypeScript type checking
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Prisma Studio for database management
- `npm run clean` - Clean build artifacts

## Project Structure

```
pdf-generator/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility libraries and configurations
│   ├── services/            # Business logic and API services
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Helper functions
├── prisma/                  # Database schema and migrations
├── public/                  # Static assets
├── uploads/                 # File upload storage
├── generated/               # Generated PDF files
└── package.json             # Dependencies and scripts
```

## Key Features

### Professional Design
- Modern, clean interface with professional aesthetics
- Responsive design that works on all devices
- Intuitive user experience with clear navigation

### Robust PDF Generation
- High-quality PDF output with professional formatting
- Integration of user data and uploaded documents
- Optimized for various document types and sizes

### Data Management
- Type-safe database operations with Prisma
- Secure file handling and storage
- Comprehensive error handling and validation

### Production Ready
- Comprehensive TypeScript implementation
- Proper error boundaries and fallbacks
- Optimized build process and deployment configuration

## Contributing

This application is built with modern development practices:

1. **Code Quality**: ESLint and TypeScript for code quality and type safety
2. **Database**: Prisma for type-safe database operations
3. **Styling**: Tailwind CSS for consistent, maintainable styling
4. **Components**: Modular, reusable component architecture

## License

MIT License - see LICENSE file for details.

## Support

For questions or support, please refer to the system design documentation in `system-design.md` for architectural details.
