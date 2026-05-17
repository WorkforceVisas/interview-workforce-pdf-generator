'use client';

import React from 'react';

interface ErrorAlertProps {
  message: string;
  onClose: () => void;
  title?: string;
  type?: 'error' | 'warning' | 'info';
}

export function ErrorAlert({
  message,
  onClose,
  title = 'Error',
  type = 'error',
}: ErrorAlertProps) {
  const getAlertStyles = () => {
    switch (type) {
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-400',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          button:
            'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600',
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-400',
          title: 'text-blue-800',
          message: 'text-blue-700',
          button:
            'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-blue-600',
        };
      default: // error
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-400',
          title: 'text-red-800',
          message: 'text-red-700',
          button: 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600',
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        );
      case 'info':
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default: // error
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const styles = getAlertStyles();

  return (
    <div
      className={`border rounded-md p-4 animate-slide-up ${styles.container}`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <div className={styles.icon}>{getIcon()}</div>
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${styles.title}`}>{title}</h3>
          <div className={`mt-1 text-sm ${styles.message}`}>
            {typeof message === 'string' ? (
              <p>{message}</p>
            ) : (
              <div>
                {Array.isArray(message) ? (
                  <ul className="list-disc list-inside space-y-1">
                    {message.map((msg, index) => (
                      <li key={index}>{msg}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{String(message)}</p>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${styles.button}`}
            >
              <span className="sr-only">Dismiss</span>
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Additional utility component for multiple errors
interface ErrorListProps {
  errors: string[];
  onClose: () => void;
  title?: string;
}

export function ErrorList({
  errors,
  onClose,
  title = 'Please fix the following errors:',
}: ErrorListProps) {
  if (errors.length === 0) return null;

  return (
    <ErrorAlert title={title} message={errors} onClose={onClose} type="error" />
  );
}

// Toast-style error that auto-dismisses
interface ErrorToastProps {
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function ErrorToast({
  message,
  onClose,
  autoClose = true,
  duration = 5000,
}: ErrorToastProps) {
  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  return (
    <div className="fixed top-4 right-4 max-w-sm w-full z-50 animate-slide-up">
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="mt-1 text-sm text-red-700">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex text-red-400 hover:text-red-600 focus:outline-none focus:text-red-600 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        {autoClose && (
          <div className="mt-2">
            <div className="bg-red-200 rounded-full h-1">
              <div
                className="bg-red-500 h-1 rounded-full animate-pulse"
                style={{
                  animation: `shrink ${duration}ms linear forwards`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
