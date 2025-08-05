import React, { useCallback, useState } from 'react';
import { cn } from '../../utils';
import { ValidationUtils } from '../../utils';

export interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in bytes
  error?: string;
  label?: string;
  helperText?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = '.pdf',
  maxSize = 10 * 1024 * 1024, // 10MB default
  error,
  label,
  helperText,
  className,
  disabled = false,
  required = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${ValidationUtils.formatFileSize(maxSize)}`;
    }

    // Check file type
    if (accept && !accept.split(',').some(type => {
      const trimmedType = type.trim();
      if (trimmedType.startsWith('.')) {
        return file.name.toLowerCase().endsWith(trimmedType.toLowerCase());
      }
      return file.type === trimmedType;
    })) {
      return `File type not supported. Accepted types: ${accept}`;
    }

    // Additional PDF validation
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      if (!ValidationUtils.isValidFileType(file.type, ['application/pdf'])) {
        return 'Invalid PDF file';
      }
    }

    return null;
  }, [accept, maxSize]);

  const handleFileChange = useCallback((file: File | null) => {
    setUploadError('');
    
    if (!file) {
      setSelectedFile(null);
      onFileSelect(null);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      setSelectedFile(null);
      onFileSelect(null);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  }, [validateFile, onFileSelect]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileChange(files[0]);
    }
  }, [disabled, handleFileChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileChange(files[0]);
    }
  }, [handleFileChange]);

  const removeFile = useCallback(() => {
    handleFileChange(null);
  }, [handleFileChange]);

  const inputId = React.useId();
  const displayError = error || uploadError;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          dragActive && !disabled ? 'border-blue-400 bg-blue-50' : 'border-gray-300',
          disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-400',
          displayError ? 'border-red-300 bg-red-50' : '',
          selectedFile ? 'bg-green-50 border-green-300' : ''
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id={inputId}
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={handleInputChange}
          accept={accept}
          disabled={disabled}
        />
        
        <div className="text-center">
          {selectedFile ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{ValidationUtils.formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-sm text-red-600 hover:text-red-800 underline"
                disabled={disabled}
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500">
                    Click to upload
                  </span>
                  {' '}or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  {accept} up to {ValidationUtils.formatFileSize(maxSize)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {displayError && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {displayError}
        </p>
      )}
      {helperText && !displayError && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export { FileUpload };