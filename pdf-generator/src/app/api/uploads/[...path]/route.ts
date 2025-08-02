import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const filePath = join(process.cwd(), "uploads", ...path);

    // Security: Ensure the path doesn't escape the uploads directory
    if (!filePath.startsWith(join(process.cwd(), "uploads"))) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const file = await readFile(filePath);

    // Determine content type based on file extension
    const ext = filePath.split(".").pop()?.toLowerCase();
    let contentType = "application/octet-stream";

    if (ext === "pdf") {
      contentType = "application/pdf";
    } else if (ext === "jpg" || ext === "jpeg") {
      contentType = "image/jpeg";
    } else if (ext === "png") {
      contentType = "image/png";
    }

    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${path[path.length - 1]}"`,
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse("File not found", { status: 404 });
  }
}
