import { NextRequest, NextResponse } from "next/server";
import { cleanupOrphanedFiles } from "@/lib/cleanup";

export async function GET(request: NextRequest) {
  try {
    // Authentication for cron jobs
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "dev-secret-key";

    // Check for Bearer token, query parameter, or Vercel cron header
    const tokenFromHeader = authHeader?.replace("Bearer ", "");
    const tokenFromQuery = request.nextUrl.searchParams.get("token");
    const vercelCronHeader = request.headers.get("x-vercel-cron");

    // For Vercel cron jobs, check the special header and environment
    const isVercelCron = vercelCronHeader === "1" && process.env.VERCEL === "1";
    const providedToken = tokenFromHeader || tokenFromQuery;

    if (!isVercelCron && providedToken !== cronSecret) {
      console.warn("Unauthorized cron cleanup attempt", {
        hasToken: !!providedToken,
        isVercelCron,
        userAgent: request.headers.get("user-agent"),
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Log cron job start
    const startTime = Date.now();
    const authMethod = isVercelCron ? "vercel-header" : "token";
    console.log(
      `[CRON] Starting automated cleanup at ${new Date().toISOString()}`,
      { authMethod, isVercelCron }
    );

    // Run cleanup
    const result = await cleanupOrphanedFiles();
    const duration = Date.now() - startTime;

    // Log results
    console.log(`[CRON] Cleanup completed in ${duration}ms:`, {
      success: result.success,
      cleanedCount: result.cleanedCount,
      errorCount: result.errors.length,
    });

    if (result.errors.length > 0) {
      console.warn("[CRON] Cleanup errors:", result.errors);
    }

    // Return simplified response for cron systems
    return NextResponse.json({
      success: result.success,
      cleaned: result.cleanedCount,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      authMethod,
      ...(result.errors.length > 0 && { errors: result.errors.length }),
    });
  } catch (error) {
    console.error("[CRON] Cleanup failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Cleanup failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}
