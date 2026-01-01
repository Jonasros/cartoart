'use client';

import Link from 'next/link';
import { PenTool, ArrowLeft } from 'lucide-react';

export function FeedHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Back to Editor */}
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Back to Editor</span>
          </Link>

          {/* Center - Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg" />
            <span className="font-bold text-xl text-gray-900 dark:text-white">CartoArt</span>
          </Link>

          {/* Right side - Create button */}
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            <PenTool className="w-4 h-4" />
            <span className="hidden sm:inline">Create Your Own</span>
            <span className="sm:hidden">Create</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
