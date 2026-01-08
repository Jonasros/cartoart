/**
 * Hook for managing print validation state
 *
 * Provides real-time print validation for sculpture configurations.
 * Uses debouncing to prevent excessive re-validation on rapid config changes.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as THREE from 'three';
import type { SculptureConfig } from '@/types/sculpture';
import {
  validateForPrinting,
  getQuickPrintStatus,
  type PrintValidationResult,
} from '@/lib/sculpture/printValidator';

interface UsePrintValidationOptions {
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
  /** Whether to run full validation (requires scene) or quick check */
  fullValidation?: boolean;
}

interface UsePrintValidationResult {
  /** Full validation result (null if not yet run or quick mode) */
  validation: PrintValidationResult | null;
  /** Quick status check (always available) */
  quickStatus: {
    status: 'ready' | 'warning' | 'error';
    message: string;
  };
  /** Whether validation is currently running */
  isValidating: boolean;
  /** Manually trigger validation with a scene */
  validateScene: (scene: THREE.Object3D) => void;
  /** Reset validation state */
  reset: () => void;
}

/**
 * Hook for managing sculpture print validation
 *
 * @param config - Current sculpture configuration
 * @param options - Validation options
 * @returns Validation result and controls
 *
 * @example
 * ```tsx
 * const { validation, quickStatus, isValidating } = usePrintValidation(config);
 *
 * // For full validation with scene
 * const sceneRef = useRef<THREE.Scene>(null);
 * validateScene(sceneRef.current);
 * ```
 */
export function usePrintValidation(
  config: SculptureConfig,
  options: UsePrintValidationOptions = {}
): UsePrintValidationResult {
  const { debounceMs = 300 } = options;

  const [validation, setValidation] = useState<PrintValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSceneRef = useRef<THREE.Object3D | null>(null);

  // Quick status is always available based on config alone
  const quickStatus = getQuickPrintStatus(config);

  // Debounced validation when config changes
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If we have a cached scene, re-validate after debounce
    if (lastSceneRef.current) {
      setIsValidating(true);
      debounceTimerRef.current = setTimeout(() => {
        if (lastSceneRef.current) {
          const result = validateForPrinting(lastSceneRef.current, config);
          setValidation(result);
        }
        setIsValidating(false);
      }, debounceMs);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [config, debounceMs]);

  // Manual validation trigger
  const validateScene = useCallback(
    (scene: THREE.Object3D) => {
      lastSceneRef.current = scene;
      setIsValidating(true);

      // Use requestAnimationFrame to avoid blocking UI
      requestAnimationFrame(() => {
        const result = validateForPrinting(scene, config);
        setValidation(result);
        setIsValidating(false);
      });
    },
    [config]
  );

  // Reset validation state
  const reset = useCallback(() => {
    setValidation(null);
    setIsValidating(false);
    lastSceneRef.current = null;
  }, []);

  return {
    validation,
    quickStatus,
    isValidating,
    validateScene,
    reset,
  };
}

/**
 * Lightweight hook for quick print status only
 * Does not require Three.js scene access
 */
export function useQuickPrintStatus(config: SculptureConfig) {
  return getQuickPrintStatus(config);
}
