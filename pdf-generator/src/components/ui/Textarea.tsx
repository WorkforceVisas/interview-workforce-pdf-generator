import React from 'react';
import { cn } from '../../utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  helperText?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, maxLength, showCharCount = false, required, id, value, ...props }, ref) => {
    const textareaId = React.useId();
    const finalId = id || textareaId;
    const currentLength = typeof value === 'string' ? value.length : 0;
     
     return (
       <div className="w-full">
         {label && (
           <label htmlFor={finalId} className="block text-sm font-medium text-gray-700 mb-1">
             {label}
             {required && <span className="text-red-500 ml-1">*</span>}
           </label>
         )}
         <textarea
           id={finalId}
           className={cn(
             'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical',
             error ? 'border-red-300 focus-visible:ring-red-500' : '',
             className
           )}
           ref={ref}
           value={value}
           {...props}
        />
        <div className="flex justify-between items-center mt-1">
          <div>
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            {helperText && !error && (
              <p className="text-sm text-gray-500">
                {helperText}
              </p>
            )}
          </div>
          {showCharCount && maxLength && (
            <p className={cn(
              'text-xs',
              currentLength > maxLength * 0.9 ? 'text-orange-500' : 'text-gray-400',
              currentLength >= maxLength ? 'text-red-500' : ''
            )}>
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';