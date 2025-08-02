import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Database,
  FileText,
  Zap,
  Shield,
  Code,
  Upload,
  Cpu,
  Clock,
  Users,
  CheckCircle,
} from "lucide-react";

export default function DesignPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Code className="w-4 h-4 mr-2" />
              System Architecture
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-6">
              System Design Documentation
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              A comprehensive overview of the job application PDF generator
              architecture, data models, and technical implementation decisions.
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm border-0 shadow-lg rounded-xl p-2">
              <TabsTrigger value="overview" className="rounded-lg">
                Overview
              </TabsTrigger>
              <TabsTrigger value="data-model" className="rounded-lg">
                Data Model
              </TabsTrigger>
              <TabsTrigger value="flow" className="rounded-lg">
                Request Flow
              </TabsTrigger>
              <TabsTrigger value="architecture" className="rounded-lg">
                Architecture
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <Upload className="w-6 h-6 mr-3 text-blue-600" />
                      Chunked Upload
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      Handles files up to 50MB by breaking them into 2MB chunks.
                      Works seamlessly across all deployment platforms with
                      real-time progress tracking.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <FileText className="w-6 h-6 mr-3 text-green-600" />
                      PDF Generation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      Uses pdf-lib to combine user information with uploaded
                      resumes into professional application documents with
                      consistent formatting.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <Clock className="w-6 h-6 mr-3 text-purple-600" />
                      Auto Cleanup
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      Automated file cleanup system removes orphaned files older
                      than 24 hours and temp chunks older than 1 hour using
                      Vercel cron jobs for zero-maintenance operation.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>

              {/* Success Experience Section */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <CheckCircle className="w-6 h-6 mr-3 text-emerald-600" />
                    Success Experience
                  </CardTitle>
                  <CardDescription>
                    Celebrating successful applications with engaging feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white/60 rounded-lg">
                      <div className="text-2xl mb-2">🎉</div>
                      <div className="font-semibold">Confetti Animation</div>
                      <div className="text-sm text-slate-600">
                        Canvas-confetti celebration on success
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white/60 rounded-lg">
                      <div className="text-2xl mb-2">📄</div>
                      <div className="font-semibold">Application Summary</div>
                      <div className="text-sm text-slate-600">
                        Detailed submission review with unique ID
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white/60 rounded-lg">
                      <div className="text-2xl mb-2">⬇️</div>
                      <div className="font-semibold">Smart Download</div>
                      <div className="text-sm text-slate-600">
                        Named PDFs for easy organization
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="text-2xl">Technology Stack</CardTitle>
                  <CardDescription>
                    Modern technologies powering the application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: "Next.js 15.4.5", desc: "React framework" },
                      { name: "React 19.1.0", desc: "UI framework" },
                      { name: "TypeScript", desc: "Type safety" },
                      { name: "Prisma", desc: "Database ORM" },
                      { name: "SQLite", desc: "Database" },
                      { name: "pdf-lib", desc: "PDF manipulation" },
                      { name: "Radix UI", desc: "Accessible components" },
                      { name: "Tailwind CSS v4", desc: "Styling" },
                      { name: "canvas-confetti", desc: "Success animations" },
                      { name: "Vercel Cron", desc: "Scheduling" },
                      { name: "Lucide React", desc: "Icon library" },
                      { name: "Turbopack", desc: "Development bundler" },
                    ].map((tech) => (
                      <div
                        key={tech.name}
                        className="text-center p-3 bg-white/60 rounded-lg"
                      >
                        <div className="font-semibold text-slate-800">
                          {tech.name}
                        </div>
                        <div className="text-sm text-slate-600">
                          {tech.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Model Tab */}
            <TabsContent value="data-model" className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Database className="w-6 h-6 mr-3 text-blue-600" />
                    Entity Relationship Diagram
                  </CardTitle>
                  <CardDescription>
                    Database schema and relationships
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-900 text-green-400 p-6 rounded-xl font-mono text-sm overflow-x-auto">
                    <pre>{`User {
  id         String    @id @default(cuid())
  firstName  String
  lastName   String
  email      String    @unique
  createdAt  DateTime  @default(now())
  submissions Submission[]  // 1:N relationship
}

Submission {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  jobDesc   String
  filePath  String   // Path to uploaded PDF
  pdfPath   String   // Path to generated PDF
  createdAt DateTime @default(now())
}`}</pre>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-green-600" />
                      User Entity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <strong>Purpose:</strong> Stores applicant information
                    </div>
                    <div>
                      <strong>Key Feature:</strong> Email uniqueness constraint
                    </div>
                    <div>
                      <strong>Relationship:</strong> One-to-many with
                      submissions
                    </div>
                    <div>
                      <strong>Indexing:</strong> Email field for fast lookups
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-purple-600" />
                      Submission Entity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <strong>Purpose:</strong> Links applications to users
                    </div>
                    <div>
                      <strong>Key Feature:</strong> Dual file path storage
                    </div>
                    <div>
                      <strong>Files:</strong> Original upload + generated PDF
                    </div>
                    <div>
                      <strong>Cleanup:</strong> References checked during file
                      cleanup
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Request Flow Tab */}
            <TabsContent value="flow" className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Request Lifecycle</CardTitle>
                  <CardDescription>Step-by-step process flow</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      "User fills form - Personal information and job description",
                      "File selection - PDF file up to 50MB",
                      "Chunked upload - 2MB chunks with progress tracking",
                      "Form submission - Reference to uploaded file",
                      "User processing - Create/update user record",
                      "PDF generation - Combine info with resume",
                      "Success redirect - Navigate to completion page",
                      "Confetti celebration - Animated success feedback",
                      "Application summary - Show submission details and ID",
                      "PDF download - Download formatted application document",
                    ].map((step, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div className="text-slate-700">{step}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Architecture Tab */}
            <TabsContent value="architecture" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Cpu className="w-5 h-5 mr-2 text-blue-600" />
                      Core Decisions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="font-semibold">SQLite Database</div>
                      <div className="text-sm text-slate-600">
                        Simple, file-based database perfect for development
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="font-semibold">Chunked Upload System</div>
                      <div className="text-sm text-slate-600">
                        Handles large files by breaking into manageable pieces
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="font-semibold">Server Actions</div>
                      <div className="text-sm text-slate-600">
                        Next.js 15 feature for seamless form handling
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="font-semibold">pdf-lib</div>
                      <div className="text-sm text-slate-600">
                        Pure JavaScript PDF library for universal compatibility
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="font-semibold">Success Flow</div>
                      <div className="text-sm text-slate-600">
                        Confetti animations and downloadable PDFs with smart
                        naming
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="font-semibold">Radix UI Components</div>
                      <div className="text-sm text-slate-600">
                        Accessible, unstyled components with consistent behavior
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-green-600" />
                      Security Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      "File type validation (PDF only)",
                      "File size limits (50MB maximum)",
                      "Path traversal protection",
                      "Automated file cleanup",
                      "Multi-method cron authentication",
                      "Vercel header validation",
                      "Environment variable security",
                      "Unique application ID tracking",
                    ].map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Zap className="w-6 h-6 mr-3 text-purple-600" />
                    Performance Optimizations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white/60 rounded-lg">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <div className="font-semibold">Immediate Upload</div>
                      <div className="text-sm text-slate-600">
                        Files upload on selection
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white/60 rounded-lg">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <div className="font-semibold">Fast Processing</div>
                      <div className="text-sm text-slate-600">
                        Efficient PDF generation
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white/60 rounded-lg">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                      <div className="font-semibold">Auto Cleanup</div>
                      <div className="text-sm text-slate-600">
                        Scheduled maintenance
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white/60 rounded-lg">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                      <div className="font-semibold">Success UX</div>
                      <div className="text-sm text-slate-600">
                        Instant feedback & confetti
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
