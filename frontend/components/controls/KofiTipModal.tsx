'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KofiTipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KofiTipModal({ isOpen, onClose }: KofiTipModalProps) {
  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        // Close when clicking backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Support the Project
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Ko-fi Iframe Container */}
        <div className="flex-1 overflow-auto p-4">
          <iframe
            id="kofiframe"
            src="https://ko-fi.com/kkingsberry/?hidefeed=true&widget=true&embed=true&preview=true"
            style={{
              border: 'none',
              width: '100%',
              padding: '4px',
              background: '#f9f9f9',
            }}
            height={712}
            title="kkingsberry"
            className="dark:bg-gray-700"
          />
        </div>

        {/* Footer with Close Button */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className={cn(
              'px-4 py-2 rounded-md font-medium transition-colors',
              'bg-gray-900 text-white dark:bg-white dark:text-gray-900',
              'hover:bg-gray-800 dark:hover:bg-gray-100',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
            )}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

