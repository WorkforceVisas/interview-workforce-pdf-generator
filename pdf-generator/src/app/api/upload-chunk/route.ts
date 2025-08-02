import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readFile, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const chunk = formData.get("chunk") as File;
    const uploadId = formData.get("uploadId") as string;
    const chunkIndex = parseInt(formData.get("chunkIndex") as string);
    const totalChunks = parseInt(formData.get("totalChunks") as string);
    const originalFileName = formData.get("originalFileName") as string;

    if (!chunk || !uploadId || isNaN(chunkIndex) || isNaN(totalChunks)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create uploads and temp directories
    await mkdir("./uploads", { recursive: true });
    await mkdir("./uploads/temp", { recursive: true });

    // Save chunk with uploadId and chunk index
    const chunkPath = join(
      "uploads",
      "temp",
      `${uploadId}_chunk_${chunkIndex}`
    );
    await writeFile(chunkPath, Buffer.from(await chunk.arrayBuffer()));

    // Check if all chunks are uploaded
    const uploadedChunks = [];
    for (let i = 0; i < totalChunks; i++) {
      const chunkFile = join("uploads", "temp", `${uploadId}_chunk_${i}`);
      if (existsSync(chunkFile)) {
        uploadedChunks.push(i);
      }
    }

    // If all chunks uploaded, reassemble the file
    if (uploadedChunks.length === totalChunks) {
      const finalPath = join(
        "uploads",
        `${uploadId}-${originalFileName.replace(/\s+/g, "_")}`
      );
      const chunks: Buffer[] = [];

      // Read all chunks in order
      for (let i = 0; i < totalChunks; i++) {
        const chunkFile = join("uploads", "temp", `${uploadId}_chunk_${i}`);
        const chunkData = await readFile(chunkFile);
        chunks.push(chunkData);
      }

      // Combine chunks and write final file
      const finalBuffer = Buffer.concat(chunks);
      await writeFile(finalPath, finalBuffer);

      // Clean up chunk files
      for (let i = 0; i < totalChunks; i++) {
        const chunkFile = join("uploads", "temp", `${uploadId}_chunk_${i}`);
        try {
          await unlink(chunkFile);
        } catch {
          console.warn(`Failed to delete chunk file: ${chunkFile}`);
        }
      }

      return NextResponse.json({
        complete: true,
        filePath: finalPath,
        message: "File uploaded successfully",
      });
    }

    return NextResponse.json({
      complete: false,
      uploadedChunks: uploadedChunks.length,
      totalChunks,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded`,
    });
  } catch (error) {
    console.error("Chunk upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload chunk" },
      { status: 500 }
    );
  }
}
