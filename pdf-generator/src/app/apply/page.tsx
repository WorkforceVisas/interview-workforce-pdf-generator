"use client";
import { createSubmission } from "./actions";
import { useChunkedUpload } from "./useChunkedUpload";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileDropZone } from "@/components/ui/file-drop-zone";
import {
  FileText,
  User,
  Mail,
  Briefcase,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function Apply() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFilePath, setUploadedFilePath] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    uploadFile,
    isUploading,
    progress,
    error: uploadError,
    reset,
  } = useChunkedUpload();

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setFileError("");
    setUploadedFilePath("");
    reset();

    const result = await uploadFile(file);
    if (result.success && result.filePath) {
      setUploadedFilePath(result.filePath);
    } else {
      setFileError(result.error || "Upload failed");
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadedFilePath("");
    setFileError("");
    reset();
  };

  const handleSubmit = async (formData: FormData) => {
    if (!uploadedFilePath) {
      setFileError("Please upload a file first");
      return;
    }

    setFileError("");
    reset();
    setIsSubmitting(true);

    try {
      formData.append("uploadedFilePath", uploadedFilePath);
      await createSubmission(formData);
    } catch (error: unknown) {
      // Handle Next.js redirect (successful submission)
      if (
        error &&
        typeof error === "object" &&
        "digest" in error &&
        typeof (error as { digest: string }).digest === "string" &&
        (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
      ) {
        return;
      }

      console.error("Submission error:", error);
      setFileError("Submission failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    uploadedFilePath && !isUploading && !uploadError && !fileError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Step 1 of 1
            </Badge>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent mb-4">
              Submit Your Application
            </h1>
            <p className="text-lg text-slate-600">
              Fill out your details and upload your resume to generate a
              professional application PDF
            </p>
          </div>

          <form action={handleSubmit} className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Personal Information
                </CardTitle>
                <CardDescription>Tell us about yourself</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      First Name
                    </label>
                    <Input
                      required
                      name="firstName"
                      placeholder="John"
                      disabled={isSubmitting}
                      className="bg-white/80"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Last Name
                    </label>
                    <Input
                      required
                      name="lastName"
                      placeholder="Doe"
                      disabled={isSubmitting}
                      className="bg-white/80"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Address
                  </label>
                  <Input
                    required
                    type="email"
                    name="email"
                    placeholder="john.doe@example.com"
                    disabled={isSubmitting}
                    className="bg-white/80"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Briefcase className="w-5 h-5 mr-2 text-green-600" />
                  Current Position
                </CardTitle>
                <CardDescription>
                  Describe your current job responsibilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Job Description
                </label>
                <Textarea
                  required
                  name="jobDesc"
                  placeholder="Tell us about your current role, responsibilities, and key achievements..."
                  rows={6}
                  disabled={isSubmitting}
                  className="bg-white/80 resize-none"
                />
              </CardContent>
            </Card>
            <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Resume Upload
                </CardTitle>
                <CardDescription>
                  Drag and drop your PDF resume or click to browse (up to 50MB)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileDropZone
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  onRemoveFile={handleRemoveFile}
                  disabled={isUploading || isSubmitting}
                  maxSize={50 * 1024 * 1024}
                />

                {isUploading && (
                  <div className="space-y-3 mt-4">
                    <Progress
                      value={progress.percentage}
                      className="w-full h-3"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center text-blue-600">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading... {progress.percentage}%
                      </span>
                      <span className="text-slate-600">
                        {Math.round((progress.loaded / (1024 * 1024)) * 10) /
                          10}
                        MB /{" "}
                        {Math.round((progress.total / (1024 * 1024)) * 10) / 10}
                        MB
                      </span>
                    </div>
                  </div>
                )}

                {(fileError || uploadError) && !isSubmitting && (
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-red-700">
                      {fileError || uploadError}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator className="my-8" />

            <div className="text-center">
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-12 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Application PDF
                  </>
                )}
              </Button>

              {!canSubmit && !isSubmitting && (
                <p className="text-sm text-slate-500 mt-3">
                  Please fill out all fields and upload your resume to continue
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
