# Job Application PDF Generator

A Next.js application that processes job applications with PDF uploads and generates consolidated PDF documents.

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up database
echo 'DATABASE_URL="file:./dev.db"' > .env
npx prisma db push

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Features

- **Job Application Form** (`/apply`) - Submit personal details, job description, and upload PDF
- **Chunked File Upload** - Handles large files (up to 50MB) with real-time progress tracking
- **Celebration Effects** - Confetti animation for successful application submissions 🎉
- **PDF Generation** - Creates a new PDF combining applicant information with uploaded document
- **File Storage** - Stores uploaded and generated PDFs locally in `./uploads` directory
- **Success Page** - Download link for generated PDF after successful submission
- **System Design Docs** (`/design`) - Architecture and data model documentation

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Prisma** - ORM with SQLite database
- **pdf-lib** - PDF generation and manipulation
- **canvas-confetti** - Celebration effects and animations
- **Tailwind CSS** - Styling

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── apply/
│   │   ├── page.tsx          # Application form
│   │   ├── actions.ts        # Server actions for form processing
│   │   └── success/
│   │       └── page.tsx      # Success page with download
│   ├── design/
│   │   └── page.tsx          # System design documentation
│   └── api/
│       ├── uploads/          # API route for serving uploaded files
│       ├── upload-chunk/     # Chunked upload endpoint
│       └── cron/
│           └── cleanup/      # Automated cleanup endpoint
├── lib/
│   ├── prisma.ts             # Prisma client instance
│   └── cleanup.ts            # File cleanup logic
prisma/
└── schema.prisma             # Database schema
```

## Environment Variables

Create a `.env` file with:

```
DATABASE_URL="file:./dev.db"
CRON_SECRET="your-secure-random-string"
```

Generate a secure CRON_SECRET:

```bash
# Generate a random 32-character string
openssl rand -hex 32
```

## Automated File Cleanup

The application automatically cleans up orphaned files (older than 24 hours with no associated submissions) using scheduled jobs.

### Vercel Deployment ✅ PRE-CONFIGURED

The `vercel.json` file is already configured for daily cleanup at 2 AM UTC.

**Setup steps:**

1. Deploy to Vercel
2. Set environment variable: `CRON_SECRET` in Vercel dashboard
3. The cleanup runs automatically!

Environment variables in Vercel:

- Go to Project Settings → Environment Variables
- Add `CRON_SECRET` with your generated secret value
- Add `DATABASE_URL` if using external database

✅ **Security:** Vercel cron jobs use special headers (`x-vercel-cron`) for automatic authentication.

💡 **Performance:** The cleanup function has a 60-second timeout to handle large numbers of files.

## Data Model

- **User** - Stores applicant information (firstName, lastName, email)
- **Submission** - Links user to their job description and file paths

## Development Notes

- Files are stored in `./uploads` directory (gitignored)
- **Chunked Upload System:**
  - Handles files up to 50MB by breaking them into 2MB chunks
  - Works on all deployment platforms (Vercel, custom servers, etc.)
  - Real-time upload progress tracking
  - Automatic chunk reassembly on server
- **File Management:**
  - Automatic cleanup of orphaned files (older than 24 hours)
  - Scheduled cleanup via Vercel cron or external schedulers
  - Zero-maintenance automated file management
- Supported file type: PDF only
- The generated PDF includes applicant info and the first page of uploaded PDF
- Client-side validation and progress feedback
- Celebration confetti effect triggered on successful application submission completion

---

# Original Coding Challenge

<details>
<summary>Click to expand original challenge description</summary>

# Coding Challenge – "From Form to PDF"

Welcome!  
You'll build a tiny Next.js feature that takes **user-submitted data + an uploaded file** and turns it into a **single PDF**.  
Most details are intentionally vague so you can show us how you think, structure data, and make trade-offs.

---

## 1 . The (deliberately loose) user flow

1. **Entry point** – A user visits `/apply`.
2. **Form** – They fill out basic personal details _and_ specify their **current job description** (plain text).
3. **Upload** – They attach **one supporting document** (pdf file type).
4. **Submit** – After the form posts:
   - Persist everything somewhere in the repo (FS, JSON - your choice, but no need to integrate a blob storage).
   - Generate a **PDF** that contains:
     - The user's personal details (as a nicely formatted header).
     - The job-description paragraph they typed.
     - _Any_ content you choose from the uploaded file (or a note that it's been stored).
   - Return a link or modal so the user can download that PDF.

That's all! How you design the data model and plumbing is up to you.

---

## 2.a. Starter repo

We give you a minimal **Next.js 14 / TypeScript** skeleton:

Feel free to reorganize folders, add libs, or install packages.

Next.js gives us the convenience of using their serverless api package, instead of needing to spin up a separate api server. Feel free to use it.

## 2.b. 💾 Database Instructions

To keep this project self-contained, we'll use **SQLite** with Prisma.

No hosted database is needed. Just follow these steps:

### Set up

```bash
cp .env.example .env
npx prisma db push
```

---

## 3 . What we care about

| Area                   | What to demonstrate                                                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Data modeling**      | Show your reasoning: TS interfaces, Prisma schema, SQL DDL—any clear representation of how "User", "Submission", and "Document" relate. |
| **Code structure**     | Separation of concerns, clear naming, testability.                                                                                      |
| **PDF generation**     | Library choice is yours (`pdf-lib`, `@react-pdf/renderer`, LaTeX + puppeteer, etc.). The result just needs to open.                     |
| **DX & README**        | `pnpm install && pnpm dev` should run; explain any env vars or scripts.                                                                 |
| **Edge-case thinking** | Basic validation, error feedback, graceful failure on large files.                                                                      |

---

## 4 . Deliverables

1. **Running code** committed to your repo.
2. **`/design` folder** with a short Markdown note explaining:
   - Your data model (ER diagram, schema file, or bullet list).
   - How the request travels through your code.
3. (Optional) Unit or integration tests showing something you deem critical.

---

## 5 . Ground rules & hints

| Topic            | Guideline                                                                      |
| ---------------- | ------------------------------------------------------------------------------ |
| **File storage** | Skip S3/GCS; writing to `./uploads` (git-ignored) is fine.                     |
| **Styling**      | Keep UI minimal—focus is backend logic.                                        |
| **Libraries**    | Use anything publicly available via npm.                                       |
| **Secrets**      | Don't commit API keys. If you need an env var, add an entry to `.env.example`. |
| **Time box**     | It's okay to annotate unfinished areas with TODOs.                             |

---

## 6 . How to submit - Fork & Pull Request

1. Fork this repo to your own GitHub account (public is fine).
2. Complete the project in your fork.
3. Open a Pull Request **to this repo's `main` branch**.
4. In the PR description, include your name and anything you want us to know.

Looking forward to seeing your approach—have fun and surprise us!

</details>
