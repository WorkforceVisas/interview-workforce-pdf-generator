'use client';

interface JobDescriptionFormProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function JobDescriptionForm({
  value,
  onChange,
  error,
  disabled = false,
}: JobDescriptionFormProps) {
  const wordCount = value
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const charCount = value.length;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Job Description</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Describe your current job role and responsibilities *
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Please provide a detailed description of your current position,
          including key responsibilities, skills used, and any notable
          achievements. Minimum 50 characters required.
        </p>

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={8}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100' : ''}`}
          placeholder="Example: As a Senior Software Engineer at XYZ Company, I lead the development of web applications using React and Node.js. My key responsibilities include architecting scalable solutions, mentoring junior developers, and collaborating with cross-functional teams to deliver high-quality products..."
        />

        <div className="mt-2 flex justify-between text-sm text-gray-500">
          <span>
            {wordCount} words • {charCount} characters
          </span>
          <span className={charCount < 50 ? 'text-red-500' : 'text-green-600'}>
            {charCount < 50
              ? `${50 - charCount} more characters needed`
              : 'Minimum requirement met'}
          </span>
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
