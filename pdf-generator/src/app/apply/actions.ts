"use server";
import { writeFile, readFile } from "fs/promises";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { join } from "path";
import { redirect } from "next/navigation";

export async function createSubmission(formData: FormData) {
  try {
    // Extract form data
    const firstName = formData.get("firstName")?.toString().trim() || "";
    const lastName = formData.get("lastName")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim() || "";
    const jobDesc = formData.get("jobDesc")?.toString().trim() || "";
    const uploadedFilePath =
      formData.get("uploadedFilePath")?.toString().trim() || "";

    // Validate required fields
    if (!firstName || !lastName || !email || !jobDesc || !uploadedFilePath) {
      throw new Error("All fields are required");
    }

    // Validate uploaded file exists and is accessible
    try {
      await readFile(uploadedFilePath);
    } catch {
      throw new Error("Uploaded file not found. Please upload a file again.");
    }

    // Upsert user
    const user = await prisma.user.upsert({
      where: { email },
      update: { firstName, lastName },
      create: { firstName, lastName, email },
    });

    // Generate output PDF using the already uploaded file
    const outputPdfPath = join("uploads", `${crypto.randomUUID()}.pdf`);
    const pdfBytes = await buildOutputPdf({
      firstName,
      lastName,
      email,
      jobDesc,
      uploadPath: uploadedFilePath,
    });
    await writeFile(outputPdfPath, pdfBytes);

    // Create submission record
    const submission = await prisma.submission.create({
      data: {
        userId: user.id,
        jobDesc,
        filePath: uploadedFilePath,
        pdfPath: outputPdfPath,
      },
    });

    // Redirect to success page
    redirect(`/apply/success?id=${submission.id}`);
  } catch (error) {
    console.error("Error processing submission:", error);
    throw error;
  }
}

async function buildOutputPdf({
  firstName,
  lastName,
  email,
  jobDesc,
  uploadPath,
}: {
  firstName: string;
  lastName: string;
  email: string;
  jobDesc: string;
  uploadPath: string;
}) {
  try {
    // Create new PDF document
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

    // Add first page with applicant info
    const page = doc.addPage();
    const { height } = page.getSize();

    // Title
    page.drawText("Job Application", {
      x: 50,
      y: height - 50,
      size: 20,
      font: boldFont,
    });

    // Applicant details
    page.drawText(`Name: ${firstName} ${lastName}`, {
      x: 50,
      y: height - 100,
      size: 12,
      font,
    });

    page.drawText(`Email: ${email}`, {
      x: 50,
      y: height - 120,
      size: 12,
      font,
    });

    // Job description
    page.drawText("Current Job Description:", {
      x: 50,
      y: height - 160,
      size: 14,
      font: boldFont,
    });

    // Wrap job description text
    const lines = wrapText(jobDesc, 80);
    let yPosition = height - 185;
    for (const line of lines) {
      if (yPosition < 50) break; // Prevent text from going off page
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 11,
        font,
      });
      yPosition -= 15;
    }

    // Load and append first page of uploaded PDF
    try {
      const uploadBytes = await readFile(uploadPath);
      const uploadedPdf = await PDFDocument.load(uploadBytes);
      const [firstPage] = await doc.copyPages(uploadedPdf, [0]);
      doc.addPage(firstPage);
    } catch (error) {
      console.error("Error appending uploaded PDF:", error);
      // Add a note if we couldn't append the uploaded file
      const errorPage = doc.addPage();
      errorPage.drawText("Note: Unable to append uploaded PDF", {
        x: 50,
        y: errorPage.getHeight() - 50,
        size: 12,
        font,
      });
    }

    return doc.save();
  } catch (error) {
    console.error("Error building PDF:", error);
    throw error;
  }
}

// Simple text wrapping function
function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).length > maxCharsPerLine) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = currentLine ? currentLine + " " + word : word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}
