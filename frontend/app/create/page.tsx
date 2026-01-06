'use client';

import { Suspense } from 'react';
import { PosterEditor } from '@/components/layout/PosterEditor';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function CreatePage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }>
        <PosterEditor />
      </Suspense>
    </ErrorBoundary>
  );
}
