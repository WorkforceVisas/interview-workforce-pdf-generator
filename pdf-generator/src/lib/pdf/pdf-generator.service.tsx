import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Submission, PdfGenerationOptions } from "../../types";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 35,
    paddingLeft: 35,
    paddingRight: 35,
    lineHeight: 1.5,
    flexDirection: "column",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
    borderBottom: "1px solid #000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  date: {
    fontSize: 10,
    marginBottom: 20,
    textAlign: "right",
    color: "#000",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
    borderBottom: "1px solid #000",
    paddingBottom: 2,
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 5,
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "bold",
    width: 80,
    color: "#000",
  },
  fieldValue: {
    fontSize: 10,
    marginLeft: 10,
    flex: 1,
    color: "#000",
  },
  jobDescriptionText: {
    fontSize: 10,
    lineHeight: 1.4,
    textAlign: "justify",
    color: "#000",
    marginTop: 5,
  },
  documentItem: {
    flexDirection: "row",
    marginBottom: 3,
    alignItems: "center",
  },
  documentLabel: {
    fontSize: 10,
    fontWeight: "bold",
    width: 80,
    color: "#000",
  },
  documentValue: {
    fontSize: 10,
    marginLeft: 10,
    flex: 1,
    color: "#000",
  },
  footer: {
    position: "absolute",
    fontSize: 9,
    bottom: 30,
    left: 35,
    right: 35,
    flexDirection: "row",
    justifyContent: "space-between",
    color: "#666",
  },
  footerText: {
    fontSize: 9,
    color: "#666",
  },
  pageNumber: {
    fontSize: 9,
    color: "#666",
  },
});

interface ApplicationPdfDocumentProps {
  submission: Submission;
  uploadedFiles?: Array<{
    originalName: string;
    filePath?: string;
    fileSize?: number;
  }>;
}

// Main PDF Document Component
const ApplicationPdfDocument: React.FC<ApplicationPdfDocumentProps> = ({
  submission,
  uploadedFiles,
}) => {
  // PDF generation for submission

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatDateShort = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>JOB APPLICATION FORM</Text>
        </View>
        
        {/* Date */}
        <Text style={styles.date}>Date: {formatDateShort(submission.createdAt)}</Text>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>First Name:</Text>
            <Text style={styles.fieldValue}>{submission.user?.firstName || "N/A"}</Text>
            <Text style={styles.fieldLabel}>Last Name:</Text>
            <Text style={styles.fieldValue}>{submission.user?.lastName || "N/A"}</Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTACT INFORMATION</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Email:</Text>
            <Text style={styles.fieldValue}>{submission.user?.email || "N/A"}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Phone:</Text>
            <Text style={styles.fieldValue}>{submission.user?.phone || "N/A"}</Text>
          </View>
        </View>

        {/* Position Applied For */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>POSITION APPLIED FOR</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Position:</Text>
            <Text style={styles.fieldValue}>Software Engineer - Full Stack Developer</Text>
          </View>
        </View>

        {/* Job Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>JOB DESCRIPTION</Text>
          <Text style={styles.jobDescriptionText}>
            {submission.jobDescription}
          </Text>
        </View>

        {/* Resume Section */}
        {uploadedFiles && uploadedFiles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RESUME</Text>
            {uploadedFiles.map((file, index) => (
              <View key={index}>
                <View style={styles.documentItem}>
                  <Text style={styles.documentLabel}>File Name:</Text>
                  <Text style={styles.documentValue}>{file.originalName}</Text>
                </View>
                {file.fileSize && (
                  <View style={styles.documentItem}>
                    <Text style={styles.documentLabel}>File Size:</Text>
                    <Text style={styles.documentValue}>{(file.fileSize / (1024 * 1024)).toFixed(1)} MB</Text>
                  </View>
                )}
                <View style={styles.documentItem}>
                  <Text style={styles.documentLabel}>Status:</Text>
                  <Text style={styles.documentValue}>Successfully Uploaded</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This application was generated on {formatDate(submission.createdAt)}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
            fixed
          />
        </View>
      </Page>
    </Document>
  );
};

export class PdfGeneratorService {
  async generateApplicationPdf({
    submission,
    uploadedFiles,
  }: {
    submission: Submission;
    uploadedFiles?: Array<{
      originalName: string;
      filePath?: string;
      fileSize?: number;
    }>;
    options?: PdfGenerationOptions;
  }): Promise<Buffer> {
    try {
      const pdfDocument = (
        <ApplicationPdfDocument
          submission={submission}
          uploadedFiles={uploadedFiles}
        />
      );

      const pdfBuffer = await renderToBuffer(pdfDocument);
      return pdfBuffer;
    } catch (error) {
      throw new Error(
        `Failed to generate PDF: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

export const pdfGeneratorService = new PdfGeneratorService();
