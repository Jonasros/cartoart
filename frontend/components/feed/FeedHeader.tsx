'use client';

import Link from 'next/link';
import { PenTool, ArrowLeft } from 'lucide-react';
import { WaymarkerLogo } from '@/components/ui/WaymarkerLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function FeedHeader() {
  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Back to Editor */}
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Back to Editor</span>
          </Link>

          {/* Center - Logo */}
          <Link href="/">
            <WaymarkerLogo size="md" showText />
          </Link>

          {/* Right side - Theme toggle and Create button */}
          <div className="flex items-center gap-3">
            <ThemeToggle variant="compact" />
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              <PenTool className="w-4 h-4" />
              <span className="hidden sm:inline">Start Your Journey</span>
              <span className="sm:hidden">Create</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
