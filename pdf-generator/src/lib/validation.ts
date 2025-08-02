import {
  ApplicationFormData,
  PersonalDetails,
  FormValidationErrors,
} from '@/types';

/**
 * Validate complete application form data
 */
export function validateApplicationForm(
  data: ApplicationFormData
): FormValidationErrors {
  const errors: FormValidationErrors = {};

  // Validate personal details
  const personalDetailsErrors = validatePersonalDetails(data.personalDetails);
  if (Object.keys(personalDetailsErrors).length > 0) {
    errors.personalDetails = personalDetailsErrors;
  }

  // Validate job description
  const jobDescriptionError = validateJobDescription(data.jobDescription);
  if (jobDescriptionError) {
    errors.jobDescription = jobDescriptionError;
  }

  // Validate supporting document
  const documentError = validateSupportingDocument(data.supportingDocument);
  if (documentError) {
    errors.supportingDocument = documentError;
  }

  return errors;
}

/**
 * Validate personal details
 */
export function validatePersonalDetails(
  details: PersonalDetails
): Partial<Record<keyof PersonalDetails, string>> {
  const errors: Partial<Record<keyof PersonalDetails, string>> = {};

  // First name validation
  if (!details.firstName?.trim()) {
    errors.firstName = 'First name is required';
  } else if (details.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters';
  } else if (details.firstName.trim().length > 50) {
    errors.firstName = 'First name must be less than 50 characters';
  } else if (!/^[a-zA-Z\s\-']+$/.test(details.firstName.trim())) {
    errors.firstName = 'First name contains invalid characters';
  }

  // Last name validation
  if (!details.lastName?.trim()) {
    errors.lastName = 'Last name is required';
  } else if (details.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters';
  } else if (details.lastName.trim().length > 50) {
    errors.lastName = 'Last name must be less than 50 characters';
  } else if (!/^[a-zA-Z\s\-']+$/.test(details.lastName.trim())) {
    errors.lastName = 'Last name contains invalid characters';
  }

  // Email validation
  if (!details.email?.trim()) {
    errors.email = 'Email address is required';
  } else if (!isValidEmail(details.email.trim())) {
    errors.email = 'Please enter a valid email address';
  } else if (details.email.trim().length > 100) {
    errors.email = 'Email address is too long';
  }

  // Phone validation (optional)
  if (details.phone && details.phone.trim()) {
    if (!isValidPhone(details.phone.trim())) {
      errors.phone = 'Please enter a valid phone number';
    }
  }

  // Address validation (optional)
  if (details.address && details.address.trim()) {
    if (details.address.trim().length > 200) {
      errors.address = 'Address must be less than 200 characters';
    }
  }

  // City validation (optional)
  if (details.city && details.city.trim()) {
    if (details.city.trim().length > 100) {
      errors.city = 'City name must be less than 100 characters';
    } else if (!/^[a-zA-Z\s\-'\.]+$/.test(details.city.trim())) {
      errors.city = 'City name contains invalid characters';
    }
  }

  // State validation (optional)
  if (details.state && details.state.trim()) {
    if (details.state.trim().length > 50) {
      errors.state = 'State must be less than 50 characters';
    }
  }

  // ZIP code validation (optional)
  if (details.zipCode && details.zipCode.trim()) {
    if (!isValidZipCode(details.zipCode.trim())) {
      errors.zipCode = 'Please enter a valid ZIP code';
    }
  }

  // Country validation
  if (!details.country?.trim()) {
    errors.country = 'Country is required';
  } else if (details.country.trim().length > 100) {
    errors.country = 'Country name is too long';
  }

  return errors;
}

/**
 * Validate job description
 */
export function validateJobDescription(
  jobDescription: string
): string | undefined {
  if (!jobDescription?.trim()) {
    return 'Job description is required';
  }

  const trimmed = jobDescription.trim();

  if (trimmed.length < 50) {
    return 'Job description must be at least 50 characters';
  }

  if (trimmed.length > 5000) {
    return 'Job description must be less than 5000 characters';
  }

  // Check for minimum word count
  const wordCount = trimmed
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  if (wordCount < 10) {
    return 'Job description must contain at least 10 words';
  }

  // Check for suspicious content
  if (containsSuspiciousContent(trimmed)) {
    return 'Job description contains inappropriate content';
  }

  return undefined;
}

/**
 * Validate supporting document
 */
export function validateSupportingDocument(
  file: File | null
): string | undefined {
  if (!file) {
    return 'Supporting document is required';
  }

  // File size validation (10MB max)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return `File size must be less than ${maxSize / (1024 * 1024)}MB`;
  }

  if (file.size === 0) {
    return 'File appears to be empty';
  }

  // File type validation
  const allowedTypes = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!allowedTypes.includes(file.type)) {
    return 'File type not supported. Please upload PDF, DOC, DOCX, or TXT files only';
  }

  // File name validation
  if (file.name.length > 255) {
    return 'File name is too long';
  }

  if (!/^[a-zA-Z0-9\s\-_\.]+$/.test(file.name)) {
    return 'File name contains invalid characters';
  }

  return undefined;
}

/**
 * Email validation using RFC 5322 regex (simplified)
 */
function isValidEmail(email: string): boolean {
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

/**
 * Phone number validation (flexible format)
 */
function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');

  // Check for reasonable length (7-15 digits)
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return false;
  }

  // Basic format validation (allows various formats)
  const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)\.]{6,20}$/;
  return phoneRegex.test(phone);
}

/**
 * ZIP code validation (US format with optional +4)
 */
function isValidZipCode(zipCode: string): boolean {
  // Remove extra spaces
  const cleaned = zipCode.trim();

  // If empty, it's valid (optional field)
  if (!cleaned) return true;

  // US ZIP code: 12345 or 12345-6789
  if (/^\d{5}(-\d{4})?$/.test(cleaned)) return true;

  // Canadian postal code: A1A 1A1 or A1A1A1
  if (/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(cleaned)) return true;

  // UK postal code: SW1A 1AA, M1 1AA, etc.
  if (/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(cleaned)) return true;

  // German postal code: 12345
  if (/^\d{5}$/.test(cleaned)) return true;

  // French postal code: 12345
  if (/^\d{5}$/.test(cleaned)) return true;

  // General international format (alphanumeric, 3-10 characters, spaces and dashes allowed)
  if (/^[A-Z0-9\s\-]{3,10}$/i.test(cleaned)) return true;

  return false;
}

/**
 * Check for suspicious or inappropriate content
 */
function containsSuspiciousContent(text: string): boolean {
  const suspiciousPatterns = [
    // Script injection attempts
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,

    // SQL injection attempts
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i,

    // Excessive special characters
    /[<>{}[\]\\]{5,}/,

    // Potential spam markers
    /\$\$\$/,
    /!!!/,

    // Common inappropriate content markers
    /\b(xxx|porn|drugs|hack|crack)\b/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(text));
}

/**
 * Sanitize text input by removing potentially harmful content
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return (
    text
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove potential script content
      .replace(/javascript:/gi, '')
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove control characters
      .replace(/[\x00-\x1F\x7F]/g, '')
      // Trim whitespace
      .trim()
  );
}

/**
 * Validate and sanitize form data
 */
export function sanitizeApplicationFormData(
  data: ApplicationFormData
): ApplicationFormData {
  return {
    personalDetails: {
      firstName: sanitizeText(data.personalDetails.firstName),
      lastName: sanitizeText(data.personalDetails.lastName),
      email: sanitizeText(data.personalDetails.email).toLowerCase(),
      phone: data.personalDetails.phone
        ? sanitizeText(data.personalDetails.phone)
        : undefined,
      address: data.personalDetails.address
        ? sanitizeText(data.personalDetails.address)
        : undefined,
      city: data.personalDetails.city
        ? sanitizeText(data.personalDetails.city)
        : undefined,
      state: data.personalDetails.state
        ? sanitizeText(data.personalDetails.state)
        : undefined,
      zipCode: data.personalDetails.zipCode
        ? sanitizeText(data.personalDetails.zipCode)
        : undefined,
      country: sanitizeText(data.personalDetails.country || 'United States'),
    },
    jobDescription: sanitizeText(data.jobDescription),
    supportingDocument: data.supportingDocument, // Files don't need text sanitization
  };
}
