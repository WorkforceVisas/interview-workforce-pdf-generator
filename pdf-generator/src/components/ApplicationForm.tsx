'use client';

import { useState } from 'react';
import {
  ApplicationFormData,
  PersonalDetails,
  FormValidationErrors,
} from '@/types';
import { validateApplicationForm } from '@/lib/validation';

interface ApplicationFormProps {
  onSubmit: (data: ApplicationFormData) => Promise<void>;
  disabled?: boolean;
}

export function ApplicationForm({
  onSubmit,
  disabled = false,
}: ApplicationFormProps) {
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const [jobDescription, setJobDescription] = useState('');
  const [supportingDocument, setSupportingDocument] = useState<File | null>(
    null
  );
  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (disabled || isSubmitting) return;

    const formData: ApplicationFormData = {
      personalDetails,
      jobDescription,
      supportingDocument,
    };

    // Validate form
    const validationErrors = validateApplicationForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePersonalDetailsChange = (
    field: keyof PersonalDetails,
    value: string
  ) => {
    setPersonalDetails((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific errors when user starts typing
    if (errors.personalDetails?.[field]) {
      setErrors((prev) => ({
        ...prev,
        personalDetails: {
          ...prev.personalDetails,
          [field]: undefined,
        },
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSupportingDocument(file);
    if (errors.supportingDocument) {
      setErrors((prev) => ({ ...prev, supportingDocument: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Details Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              value={personalDetails.firstName}
              onChange={(e) =>
                handlePersonalDetailsChange('firstName', e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.personalDetails?.firstName
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              disabled={disabled || isSubmitting}
            />
            {errors.personalDetails?.firstName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.personalDetails.firstName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              value={personalDetails.lastName}
              onChange={(e) =>
                handlePersonalDetailsChange('lastName', e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.personalDetails?.lastName
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              disabled={disabled || isSubmitting}
            />
            {errors.personalDetails?.lastName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.personalDetails.lastName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={personalDetails.email}
              onChange={(e) =>
                handlePersonalDetailsChange('email', e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.personalDetails?.email
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              disabled={disabled || isSubmitting}
            />
            {errors.personalDetails?.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.personalDetails.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={personalDetails.phone}
              onChange={(e) =>
                handlePersonalDetailsChange('phone', e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.personalDetails?.phone
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              disabled={disabled || isSubmitting}
            />
            {errors.personalDetails?.phone && (
              <p className="mt-1 text-sm text-red-600">
                {errors.personalDetails.phone}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Address
            </label>
            <input
              type="text"
              id="address"
              value={personalDetails.address}
              onChange={(e) =>
                handlePersonalDetailsChange('address', e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.personalDetails?.address
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              disabled={disabled || isSubmitting}
            />
            {errors.personalDetails?.address && (
              <p className="mt-1 text-sm text-red-600">
                {errors.personalDetails.address}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              value={personalDetails.city}
              onChange={(e) =>
                handlePersonalDetailsChange('city', e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.personalDetails?.city
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              disabled={disabled || isSubmitting}
            />
            {errors.personalDetails?.city && (
              <p className="mt-1 text-sm text-red-600">
                {errors.personalDetails.city}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="state"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              State/Province
            </label>
            <input
              type="text"
              id="state"
              value={personalDetails.state}
              onChange={(e) =>
                handlePersonalDetailsChange('state', e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.personalDetails?.state
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              disabled={disabled || isSubmitting}
            />
            {errors.personalDetails?.state && (
              <p className="mt-1 text-sm text-red-600">
                {errors.personalDetails.state}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="zipCode"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              ZIP/Postal Code
            </label>
            <input
              type="text"
              id="zipCode"
              value={personalDetails.zipCode}
              onChange={(e) =>
                handlePersonalDetailsChange('zipCode', e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.personalDetails?.zipCode
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              disabled={disabled || isSubmitting}
            />
            {errors.personalDetails?.zipCode && (
              <p className="mt-1 text-sm text-red-600">
                {errors.personalDetails.zipCode}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Country *
            </label>
            <select
              id="country"
              value={personalDetails.country}
              onChange={(e) =>
                handlePersonalDetailsChange('country', e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.personalDetails?.country
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              disabled={disabled || isSubmitting}
            >
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Other">Other</option>
            </select>
            {errors.personalDetails?.country && (
              <p className="mt-1 text-sm text-red-600">
                {errors.personalDetails.country}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Job Description Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Job Description
        </h2>
        <div>
          <label
            htmlFor="jobDescription"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Current Job Description *
          </label>
          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value);
              if (errors.jobDescription) {
                setErrors((prev) => ({ ...prev, jobDescription: undefined }));
              }
            }}
            rows={6}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.jobDescription ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe your current job responsibilities, duties, and role in detail..."
            disabled={disabled || isSubmitting}
          />
          <p className="mt-1 text-sm text-gray-500">
            Minimum 50 characters. Please provide a detailed description of your
            current role.
          </p>
          {errors.jobDescription && (
            <p className="mt-1 text-sm text-red-600">{errors.jobDescription}</p>
          )}
        </div>
      </div>

      {/* Supporting Document Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Supporting Document
        </h2>
        <div>
          <label
            htmlFor="supportingDocument"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Upload Supporting Document *
          </label>
          <input
            type="file"
            id="supportingDocument"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.supportingDocument ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={disabled || isSubmitting}
          />
          <p className="mt-1 text-sm text-gray-500">
            Accepted formats: PDF, DOC, DOCX, TXT. Maximum file size: 10MB.
          </p>
          {supportingDocument && (
            <p className="mt-1 text-sm text-green-600">
              Selected: {supportingDocument.name} (
              {(supportingDocument.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
          {errors.supportingDocument && (
            <p className="mt-1 text-sm text-red-600">
              {errors.supportingDocument}
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={disabled || isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Processing Application...' : 'Submit Application'}
        </button>
      </div>
    </form>
  );
}
