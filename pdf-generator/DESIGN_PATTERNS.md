# File Upload Design Patterns Analysis

## Current Implementation: Upload on Selection

### Pattern

```
File Select → Immediate Chunked Upload → Form Fill → Submit (metadata only)
```

### Why This Pattern Works Well for Our Use Case

1. **Large File Handling**: 50MB PDFs require chunked upload, which works better with immediate upload
2. **User Confidence**: Immediate feedback that upload succeeded
3. **Performance**: Final submission is fast (no file transfer delay)
4. **Modern UX**: Matches user expectations from modern applications

## Alternative Patterns Considered

### 1. Upload on Form Submit (Traditional)

```typescript
// Traditional approach - upload during form submission
const handleSubmit = async (formData: FormData) => {
  setIsSubmitting(true);

  // Upload file + process form together
  const result = await uploadAndProcess(formData);

  if (result.success) redirect("/success");
};
```

**Issues with this approach for large files:**

- Potential timeouts (50MB uploads can take minutes)
- Poor UX (user waits at submit button)
- Difficult to show upload progress
- Server action timeouts on slow connections

### 2. Background Upload While Typing

```typescript
// Upload starts immediately but form can be submitted before completion
const [uploadStatus, setUploadStatus] = useState<
  "idle" | "uploading" | "complete"
>("idle");

const handleFileSelect = async (file: File) => {
  setUploadStatus("uploading");
  uploadInBackground(file);
  // User can continue filling form
};

const handleSubmit = async (formData: FormData) => {
  if (uploadStatus !== "complete") {
    // Wait for upload to complete or show error
    await waitForUpload();
  }
  // Submit form
};
```

### 3. Staged Upload with Confirmation

```typescript
// Two-step process with explicit confirmation
const handleFileSelect = async (file: File) => {
  const result = await uploadFile(file);
  setUploadedFile(result);
  // Show "File ready, now fill form" message
};

const handleSubmit = async (formData: FormData) => {
  if (!uploadedFile) {
    throw new Error("No file uploaded");
  }
  // Submit with file reference
};
```

## Handling Orphaned Files ✅ IMPLEMENTED

We've implemented a robust cleanup system to handle orphaned files:

### 1. Cleanup Job ✅ IMPLEMENTED

```typescript
// Clean up files older than 24 hours with no associated submission
async function cleanupOrphanedFiles() {
  const orphanedFiles = await findFilesWithoutSubmissions();
  for (const file of orphanedFiles) {
    if (isOlderThan24Hours(file)) {
      await deleteFile(file.path);
    }
  }
}
```

**Implementation:** `src/lib/cleanup.ts` and `src/app/api/cron/cleanup/route.ts`
**Automation:** Configured via `vercel.json` for scheduled execution

### 2. Temporary Upload with Confirmation

```typescript
// Move to permanent location only after successful submission
const tempPath = `temp/${uploadId}`;
const permanentPath = `uploads/${submissionId}`;

// On successful submission:
await moveFile(tempPath, permanentPath);
```

### 3. Session-based Cleanup

```typescript
// Track uploads per session/user
const sessionUploads = new Map<string, string[]>();

// Clean up on session end or page unload
window.addEventListener("beforeunload", () => {
  // Signal server to clean up session files
  navigator.sendBeacon("/api/cleanup-session");
});
```

## Recommendation: Keep Current Pattern

For job applications with large PDFs, our current approach is optimal because:

1. **User Experience**: Immediate feedback and fast final submission
2. **Technical Requirements**: Large files need chunked upload
3. **Industry Standard**: Matches modern application expectations
4. **Reliability**: Avoids timeout issues with slow connections

The orphaned files issue is minor and can be addressed with a simple cleanup job rather than changing the core UX pattern.

## Future Enhancements

1. **Upload Resumption**: Allow users to resume interrupted uploads
2. **Parallel Chunks**: Upload multiple chunks simultaneously
3. **Smart Retry**: Automatic retry for failed chunks
4. **Upload Analytics**: Track upload success rates and performance
