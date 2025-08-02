"use client";

import React, { useCallback, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "./button";

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  disabled?: boolean;
  selectedFile?: File | null;
  onRemoveFile?: () => void;
  className?: string;
}

export function FileDropZone({
  onFileSelect,
  accept = "application/pdf",
  maxSize = 50 * 1024 * 1024, // 50MB default
  disabled = false,
  selectedFile,
  onRemoveFile,
  className,
}: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (disabled) {
      setError("");
    }
  }, [disabled]);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (accept && !file.type.match(accept.replace("application/", ""))) {
        return "Please upload a PDF file only";
      }
      if (maxSize && file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        const fileSizeMB = Math.round((file.size / (1024 * 1024)) * 10) / 10;
        return `File too large (${maxSizeMB}MB max). Your file is ${fileSizeMB}MB.`;
      }
      return null;
    },
    [accept, maxSize]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      setError("");
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      onFileSelect(file);
    },
    [validateFile, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [disabled, handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const formatFileSize = (bytes: number) => {
    return Math.round((bytes / (1024 * 1024)) * 10) / 10;
  };

  if (selectedFile) {
    return (
      <div
        className={cn(
          "relative border-2 border-dashed border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 transition-all duration-300 shadow-lg",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center shadow-sm">
              <FileText className="w-7 h-7 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-green-900 text-lg truncate max-w-xs">
                {selectedFile.name}
              </div>
              <div className="text-sm text-green-700 flex items-center space-x-2">
                <span className="bg-green-200 px-2 py-1 rounded-full text-xs font-medium">
                  {formatFileSize(selectedFile.size)}MB
                </span>
                <span>•</span>
                <span>PDF Document</span>
              </div>
            </div>
          </div>
          {onRemoveFile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveFile}
              className="text-green-600 hover:text-green-800 hover:bg-green-100 transition-all duration-200 hover:scale-105"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer group",
          isDragOver
            ? "border-blue-400 bg-blue-50 scale-[1.02]"
            : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-red-300 bg-red-50"
        )}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="text-center space-y-4">
          <div
            className={cn(
              "w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-300",
              isDragOver
                ? "bg-gradient-to-br from-blue-100 to-indigo-100 scale-110 shadow-lg"
                : "bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-slate-200 group-hover:to-slate-300 group-hover:scale-105"
            )}
          >
            <Upload
              className={cn(
                "w-10 h-10 transition-all duration-300",
                isDragOver
                  ? "text-blue-600 animate-bounce"
                  : "text-slate-500 group-hover:text-slate-600"
              )}
            />
          </div>

          <div className="space-y-2">
            <h3
              className={cn(
                "text-lg font-semibold transition-colors duration-200",
                isDragOver ? "text-blue-900" : "text-slate-700"
              )}
            >
              {isDragOver ? "Drop your PDF here" : "Upload your resume"}
            </h3>
            <p className="text-sm text-slate-500">
              Drag and drop your PDF file here, or{" "}
              <span className="text-blue-600 font-medium">click to browse</span>
            </p>
          </div>

          <div className="flex items-center justify-center space-x-1 text-xs text-slate-400">
            <FileText className="w-4 h-4" />
            <span>
              PDF files only • Up to {Math.round(maxSize / (1024 * 1024))}MB
            </span>
          </div>
        </div>
      </div>

      {error && !disabled && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <X className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}
    </div>
  );
}
