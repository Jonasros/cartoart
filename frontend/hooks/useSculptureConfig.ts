'use client';

import { useState, useCallback } from 'react';
import type { SculptureConfig } from '@/types/sculpture';
import { DEFAULT_SCULPTURE_CONFIG } from '@/types/sculpture';

/**
 * Hook for managing sculpture configuration state.
 * Provides simple state management for 3D sculpture preview settings.
 *
 * @returns Object containing:
 * - config: Current sculpture configuration
 * - updateConfig: Update partial configuration
 * - resetConfig: Reset to default configuration
 *
 * @example
 * ```tsx
 * const { config, updateConfig, resetConfig } = useSculptureConfig();
 * updateConfig({ size: 20, elevationScale: 2.0 });
 * ```
 */
export function useSculptureConfig() {
  const [config, setConfig] = useState<SculptureConfig>(DEFAULT_SCULPTURE_CONFIG);

  /**
   * Update partial configuration, merging with existing state
   */
  const updateConfig = useCallback((updates: Partial<SculptureConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Reset configuration to defaults
   */
  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_SCULPTURE_CONFIG);
  }, []);

  /**
   * Set entire configuration (for loading saved states)
   */
  const setFullConfig = useCallback((newConfig: SculptureConfig) => {
    setConfig(newConfig);
  }, []);

  return {
    config,
    updateConfig,
    resetConfig,
    setFullConfig,
  };
}
