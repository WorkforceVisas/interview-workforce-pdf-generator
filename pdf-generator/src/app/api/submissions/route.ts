import { NextRequest, NextResponse } from 'next/server';
import { applicationService } from '../../../services/application.service';
import { applicationFormSchema } from '../../../lib/validations/schemas';
import type { ApplicationFormData } from '../../../types';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      return await handleFormData(request);
    } else {
      return await handleJsonData(request);
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Something went wrong' },
      { status: 500 }
    );
  }
}

async function handleFormData(request: NextRequest) {
  const formData = await request.formData();
  
  // Extract form fields
  const applicationData: ApplicationFormData = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    jobDescription: formData.get('jobDescription') as string,
  };

  // Validate form data
   const validation = applicationFormSchema.safeParse(applicationData);
   if (!validation.success) {
     return NextResponse.json(
       { error: 'Invalid form data', details: validation.error.issues },
       { status: 400 }
     );
   }

  // Handle file upload
  const file = formData.get('file') as File | null;
  let uploadedFile;
  
  if (file) {
    const arrayBuffer = await file.arrayBuffer();
    uploadedFile = {
      buffer: Buffer.from(arrayBuffer),
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
    };
  }

  const result = await applicationService.processApplication(validation.data, uploadedFile);
  return NextResponse.json(result, { status: 201 });
}

async function handleJsonData(request: NextRequest) {
  const body = await request.json();
  
  const validation = applicationFormSchema.safeParse(body);
   if (!validation.success) {
     return NextResponse.json(
       { error: 'Invalid form data', details: validation.error.issues },
       { status: 400 }
     );
   }

  const result = await applicationService.processApplication(validation.data);
  return NextResponse.json(result, { status: 201 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const submissionId = searchParams.get('id');
  
  if (!submissionId) {
    return NextResponse.json({ error: 'Submission ID required' }, { status: 400 });
  }
  
  try {
    const submission = await applicationService.getSubmission(submissionId);
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }
    
    return NextResponse.json(submission);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submission' },
      { status: 500 }
    );
  }
}