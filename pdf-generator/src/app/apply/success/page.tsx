import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SuccessConfetti } from "./SuccessConfetti";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Download,
  FileText,
  User,
  Calendar,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const id = params.id;

  if (!id) {
    notFound();
  }

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!submission) {
    notFound();
  }

  const submissionDate = submission.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <SuccessConfetti />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-6 px-6 py-3 text-base">
              <Sparkles className="w-5 h-5 mr-2" />
              Application Complete
            </Badge>

            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Success!
              </span>{" "}
              <span className="text-yellow-500">🎉</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Thank you,{" "}
              <span className="font-semibold text-slate-800">
                {submission.user.firstName}
              </span>
              ! Your application has been successfully processed and your PDF is
              ready for download.
            </p>
          </div>

          {/* Application Summary Card */}
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <User className="w-6 h-6 mr-3 text-blue-600" />
                Application Summary
              </CardTitle>
              <CardDescription className="text-base">
                Your submission details and generated PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Applicant Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Full Name
                    </label>
                    <p className="text-lg font-semibold text-slate-800">
                      {submission.user.firstName} {submission.user.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Email
                    </label>
                    <p className="text-lg text-slate-700">
                      {submission.user.email}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Submitted
                    </label>
                    <p className="text-lg text-slate-700">{submissionDate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Application ID
                    </label>
                    <p className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      {submission.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Job Description Preview */}
              <div>
                <label className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2 block">
                  Job Description
                </label>
                <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="text-slate-700 leading-relaxed">
                    {submission.jobDesc.length > 200
                      ? `${submission.jobDesc.substring(0, 200)}...`
                      : submission.jobDesc}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Download Card */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Your Application PDF</CardTitle>
              <CardDescription className="text-base">
                Download your professionally formatted application document
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <a
                  href={`/api/${submission.pdfPath}`}
                  download={`application-${submission.user.firstName}-${submission.user.lastName}.pdf`}
                  className="flex items-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Application PDF
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>

              <p className="text-sm text-slate-600">
                The PDF includes your personal information, job description, and
                uploaded resume
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 hover:bg-slate-50 px-8 py-4 rounded-xl"
            >
              <Link href="/apply" className="flex items-center">
                <RefreshCw className="w-5 h-5 mr-2" />
                Submit Another Application
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              size="lg"
              className="hover:bg-slate-100 px-8 py-4 rounded-xl"
            >
              <Link href="/">Back to Home</Link>
            </Button>
          </div>

          {/* Tips */}
          <Card className="mt-12 border-dashed border-2 border-slate-300 bg-slate-50/50">
            <CardContent className="text-center py-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                💡 Pro Tip
              </h3>
              <p className="text-slate-600">
                Save the PDF to your device and keep the application ID for your
                records. You can always return to this page using the direct
                link.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
