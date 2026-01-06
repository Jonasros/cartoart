'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export function ThemeToggle({ className, variant = 'default' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn('flex items-center gap-1 p-1 rounded-lg bg-secondary/50', className)}>
        <div className="w-8 h-8 rounded-md bg-secondary animate-pulse" />
        <div className="w-8 h-8 rounded-md bg-secondary animate-pulse" />
        <div className="w-8 h-8 rounded-md bg-secondary animate-pulse" />
      </div>
    );
  }

  if (variant === 'compact') {
    // Simple toggle between light and dark
    return (
      <button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className={cn(
          'p-2 rounded-lg transition-colors',
          'text-muted-foreground hover:text-foreground hover:bg-secondary',
          className
        )}
        title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>
    );
  }

  // Full toggle with system option
  const options = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const;

  return (
    <div
      className={cn(
        'flex items-center gap-1 p-1 rounded-lg bg-secondary/50',
        className
      )}
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            'p-2 rounded-md transition-colors',
            theme === value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          title={label}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
