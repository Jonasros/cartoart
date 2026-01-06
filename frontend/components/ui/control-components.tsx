'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check, ChevronRight } from 'lucide-react';

/* -------------------------------------------------------------------------------------------------
 * Button Component
 * -----------------------------------------------------------------------------------------------*/

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-accent text-white hover:bg-accent/90 dark:bg-accent dark:hover:bg-accent/90': variant === 'default',
            'border border-border bg-white text-foreground hover:bg-secondary dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-secondary': variant === 'outline',
            'text-muted-foreground hover:bg-secondary dark:text-muted-foreground dark:hover:bg-secondary': variant === 'ghost',
            'bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive dark:hover:bg-destructive/90': variant === 'destructive',
          },
          {
            'h-9 px-4 py-2': size === 'default',
            'h-8 px-3 text-xs': size === 'sm',
            'h-11 px-8': size === 'lg',
            'h-9 w-9': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

/* -------------------------------------------------------------------------------------------------
 * Layout Components
 * -----------------------------------------------------------------------------------------------*/

export function ControlSection({ title, children, className, action }: { 
  title: string; 
  children: React.ReactNode; 
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        {action}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}

export function ControlGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
    </div>
  );
}

export function ControlRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {children}
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function CollapsibleSection({ title, children, defaultOpen = true, className }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className={cn("space-y-2", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        {title}
      </button>
      {isOpen && (
        <div className="pl-6 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Input Components
 * -----------------------------------------------------------------------------------------------*/

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  action?: React.ReactNode;
}

export function ControlLabel({ children, className, action, ...props }: LabelProps) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <label
        className={cn("text-xs font-medium text-foreground/80 select-none", className)}
        {...props}
      >
        {children}
      </label>
      {action}
    </div>
  );
}

export const ControlInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
ControlInput.displayName = "ControlInput";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const ControlSelect = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex h-9 w-full appearance-none items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 opacity-50 pointer-events-none" />
      </div>
    );
  }
);
ControlSelect.displayName = "ControlSelect";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  displayValue?: React.ReactNode;
  onValueChange?: (value: number) => void;
  parseValue?: (value: string) => number;
  formatValue?: (value: number) => string;
}

export const ControlSlider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, displayValue, onValueChange, parseValue, formatValue, ...props }, ref) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editValue, setEditValue] = React.useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleDisplayClick = () => {
      if (displayValue !== undefined && onValueChange && props.value !== undefined) {
        let currentValue: number;
        if (typeof props.value === 'string') {
          currentValue = parseFloat(props.value);
        } else if (typeof props.value === 'number') {
          currentValue = props.value;
        } else if (Array.isArray(props.value)) {
          currentValue = parseFloat(props.value[0] || '0');
        } else {
          currentValue = 0;
        }
        setEditValue(formatValue ? formatValue(currentValue) : String(currentValue));
        setIsEditing(true);
      }
    };

    React.useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isEditing]);

    const handleSubmit = () => {
      if (onValueChange && editValue !== '') {
        const parsed = parseValue ? parseValue(editValue) : parseFloat(editValue);
        if (!isNaN(parsed)) {
          const min = props.min ? parseFloat(String(props.min)) : 0;
          const max = props.max ? parseFloat(String(props.max)) : 100;
          const clamped = Math.max(min, Math.min(max, parsed));
          onValueChange(clamped);
        }
      }
      setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Escape') {
        setIsEditing(false);
      }
    };

    return (
      <div className={cn("relative flex items-center gap-3", className)}>
        <input
          type="range"
          ref={ref}
          className="flex-1 h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20"
          {...props}
        />
        {displayValue !== undefined && (
          <>
            {isEditing && onValueChange ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSubmit}
                onKeyDown={handleKeyDown}
                className="w-12 text-right text-xs font-mono text-foreground bg-background border border-primary rounded px-1 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            ) : (
              <button
                type="button"
                onClick={handleDisplayClick}
                className={cn(
                  "w-12 text-right text-xs font-mono tabular-nums transition-colors",
                  onValueChange
                    ? "text-primary hover:text-primary/80 cursor-pointer"
                    : "text-muted-foreground cursor-default"
                )}
              >
                {displayValue}
              </button>
            )}
          </>
        )}
      </div>
    );
  }
);
ControlSlider.displayName = "ControlSlider";

interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const ControlToggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, checked, ...props }, ref) => {
    return (
      <label className={cn("flex items-center gap-3 cursor-pointer group", className)}>
        <div className="relative inline-flex items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            ref={ref}
            checked={checked ?? false}
            {...props}
          />
          <div className="h-5 w-9 rounded-full bg-secondary peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-1 peer-focus:ring-offset-background peer-checked:bg-primary transition-colors" />
          <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
        </div>
        <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
          {label}
        </span>
      </label>
    );
  }
);
ControlToggle.displayName = "ControlToggle";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

export const ControlCheckbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, checked, ...props }, ref) => {
    return (
      <label className={cn("flex items-start gap-3 p-2 -ml-2 rounded-lg hover:bg-secondary cursor-pointer transition-colors group", className)}>
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            type="checkbox"
            className="peer h-4 w-4 rounded border-border text-primary focus:ring-primary"
            ref={ref}
            checked={checked ?? false}
            {...props}
          />
        </div>
        <div className="flex-1 space-y-0.5">
          <div className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
            {label}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </label>
    );
  }
);
ControlCheckbox.displayName = "ControlCheckbox";

