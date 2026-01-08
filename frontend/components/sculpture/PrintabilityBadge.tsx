'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Package,
  Ruler,
  ChevronDown,
  ChevronUp,
  Info,
  Printer,
} from 'lucide-react';
import type { PrintValidationResult, ValidationCheck } from '@/lib/sculpture/printValidator';
import { formatPrintTime, formatMaterialUsage } from '@/lib/sculpture/printValidator';

interface PrintabilityBadgeProps {
  validation: PrintValidationResult | null;
  /** Quick status for immediate feedback when full validation isn't available */
  quickStatus?: {
    status: 'ready' | 'warning' | 'error';
    message: string;
  };
  isLoading?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Badge showing print readiness status
 * Expandable to show detailed validation checks and print stats
 */
export function PrintabilityBadge({
  validation,
  quickStatus,
  isLoading = false,
  compact = false,
  className,
}: PrintabilityBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine status and styling - use quickStatus when validation not available
  const status = useMemo(() => {
    // If we have full validation, use it
    if (validation) {
      if (validation.isOptimal) {
        return {
          type: 'optimal' as const,
          label: 'Print Ready',
          icon: CheckCircle,
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          textColor: 'text-green-700 dark:text-green-400',
          borderColor: 'border-green-200 dark:border-green-800',
          message: validation.summary,
        };
      }

      if (validation.isPrintReady) {
        return {
          type: 'ready' as const,
          label: 'Print Ready',
          icon: CheckCircle,
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          textColor: 'text-yellow-700 dark:text-yellow-400',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          message: validation.summary,
        };
      }

      return {
        type: 'error' as const,
        label: 'Issues Found',
        icon: XCircle,
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        textColor: 'text-red-700 dark:text-red-400',
        borderColor: 'border-red-200 dark:border-red-800',
        message: validation.summary,
      };
    }

    // Fall back to quick status if available
    if (quickStatus) {
      if (quickStatus.status === 'ready') {
        return {
          type: 'ready' as const,
          label: 'Print Ready',
          icon: CheckCircle,
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          textColor: 'text-green-700 dark:text-green-400',
          borderColor: 'border-green-200 dark:border-green-800',
          message: quickStatus.message,
        };
      }

      if (quickStatus.status === 'warning') {
        return {
          type: 'warning' as const,
          label: 'Review Needed',
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          textColor: 'text-yellow-700 dark:text-yellow-400',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          message: quickStatus.message,
        };
      }

      return {
        type: 'error' as const,
        label: 'Issues Found',
        icon: XCircle,
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        textColor: 'text-red-700 dark:text-red-400',
        borderColor: 'border-red-200 dark:border-red-800',
        message: quickStatus.message,
      };
    }

    // No validation or quick status - show loading
    return {
      type: 'loading' as const,
      label: 'Analyzing...',
      icon: Clock,
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      textColor: 'text-gray-600 dark:text-gray-400',
      borderColor: 'border-gray-200 dark:border-gray-700',
      message: 'Checking print requirements...',
    };
  }, [validation, quickStatus]);

  const StatusIcon = status.icon;

  // Group checks by status
  const groupedChecks = useMemo(() => {
    if (!validation) return { errors: [], warnings: [], passed: [] };

    return {
      errors: validation.checks.filter(c => !c.passed && c.severity === 'error'),
      warnings: validation.checks.filter(c => !c.passed && c.severity === 'warning'),
      passed: validation.checks.filter(c => c.passed),
    };
  }, [validation]);

  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
          status.bgColor,
          status.textColor,
          className
        )}
      >
        {isLoading ? (
          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <StatusIcon className="w-3 h-3" />
        )}
        <span>{status.label}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden transition-all',
        status.borderColor,
        className
      )}
    >
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between p-3',
          status.bgColor,
          'hover:opacity-90 transition-opacity'
        )}
      >
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <StatusIcon className={cn('w-5 h-5', status.textColor)} />
          )}
          <div className="text-left">
            <div className={cn('font-semibold text-sm', status.textColor)}>
              {status.label}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {status.message}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {validation && (
            <>
              <div className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                validation.score >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                validation.score >= 70 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' :
                'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
              )}>
                {validation.score}%
              </div>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </>
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && validation && (
        <div className="p-3 space-y-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          {/* Print Stats */}
          <div className="grid grid-cols-3 gap-2">
            <StatCard
              icon={Clock}
              label="Print Time"
              value={formatPrintTime(validation.stats.estimatedPrintTime)}
            />
            <StatCard
              icon={Package}
              label="Material"
              value={formatMaterialUsage(validation.stats.materialUsageGrams)}
            />
            <StatCard
              icon={Ruler}
              label="Size"
              value={`${validation.stats.dimensions.width}×${validation.stats.dimensions.height}mm`}
            />
          </div>

          {/* Errors */}
          {groupedChecks.errors.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wide">
                Issues to Fix
              </div>
              {groupedChecks.errors.map((check) => (
                <CheckItem key={check.id} check={check} />
              ))}
            </div>
          )}

          {/* Warnings */}
          {groupedChecks.warnings.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">
                Suggestions
              </div>
              {groupedChecks.warnings.map((check) => (
                <CheckItem key={check.id} check={check} />
              ))}
            </div>
          )}

          {/* Passed checks (collapsed by default) */}
          {groupedChecks.passed.length > 0 && (
            <details className="group">
              <summary className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide cursor-pointer hover:underline">
                {groupedChecks.passed.length} Checks Passed
              </summary>
              <div className="mt-2 space-y-2">
                {groupedChecks.passed.map((check) => (
                  <CheckItem key={check.id} check={check} />
                ))}
              </div>
            </details>
          )}

          {/* Mesh info */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Printer className="w-3 h-3" />
              <span>
                {validation.stats.triangleCount.toLocaleString()} triangles · {validation.stats.vertexCount.toLocaleString()} vertices
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Small stat card for print statistics
 */
function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
      <Icon className="w-4 h-4 mx-auto mb-1 text-gray-400" />
      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {value}
      </div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

/**
 * Individual validation check item
 */
function CheckItem({ check }: { check: ValidationCheck }) {
  const getIcon = () => {
    if (check.passed) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (check.severity === 'error') {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (check.severity === 'warning') {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
    return <Info className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      {getIcon()}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {check.name}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {check.message}
        </div>
        {check.suggestion && (
          <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
            💡 {check.suggestion}
          </div>
        )}
      </div>
      {check.value !== undefined && check.threshold !== undefined && (
        <div className="text-xs text-gray-400 whitespace-nowrap">
          {check.value}/{check.threshold}
        </div>
      )}
    </div>
  );
}

/**
 * Compact inline status indicator
 */
export function PrintStatusIndicator({
  status,
  className,
}: {
  status: 'ready' | 'warning' | 'error' | 'loading';
  className?: string;
}) {
  const config = {
    ready: {
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-500',
      label: 'Print Ready',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500',
      label: 'Has Warnings',
    },
    error: {
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-500',
      label: 'Issues Found',
    },
    loading: {
      icon: Clock,
      color: 'text-gray-400',
      bg: 'bg-gray-400',
      label: 'Analyzing',
    },
  }[status];

  const Icon = config.icon;

  return (
    <div
      className={cn('flex items-center gap-1.5', className)}
      title={config.label}
    >
      <div className={cn('w-2 h-2 rounded-full animate-pulse', config.bg)} />
      <Icon className={cn('w-4 h-4', config.color)} />
    </div>
  );
}
