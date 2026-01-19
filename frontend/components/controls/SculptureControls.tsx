'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Circle, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ControlSection,
  ControlSlider,
  ControlLabel,
  ControlInput,
} from '@/components/ui/control-components';
import { SculptureExportModal } from './SculptureExportModal';
import { PrintabilityBadge } from '@/components/sculpture/PrintabilityBadge';
import { useElevationGrid } from '@/hooks/useElevationGrid';
import { useQuickPrintStatus } from '@/hooks/usePrintValidation';
import type { RouteData } from '@/types/poster';
import type { PrintValidationResult } from '@/lib/sculpture/printValidator';
import type {
  SculptureConfig,
  SculptureShape,
  SculptureRouteStyle,
  SculptureMaterial,
  SculptureTextConfig,
  SculptureTerrainMode,
  SculptureStylePreset,
  TerrainColorPreset,
  TerrainColorizationConfig,
} from '@/types/sculpture';
import {
  SCULPTURE_SIZES,
  SCULPTURE_SHAPES,
  SCULPTURE_ROUTE_STYLES,
  SCULPTURE_MATERIALS,
  SCULPTURE_TERRAIN_MODES,
  SCULPTURE_STYLE_PRESETS,
  TERRAIN_COLOR_PRESETS,
  DEFAULT_COLORIZATION_CONFIG,
} from '@/types/sculpture';

interface SculptureControlsProps {
  config: SculptureConfig;
  onConfigChange: (updates: Partial<SculptureConfig>) => void;
  routeData?: RouteData | null;
  routeName?: string;
  /** Optional full validation result from parent (requires 3D scene) */
  printValidation?: PrintValidationResult | null;
  /** Whether print validation is currently running */
  isPrintValidating?: boolean;
}

export function SculptureControls({
  config,
  onConfigChange,
  routeData,
  routeName,
  printValidation,
  isPrintValidating,
}: SculptureControlsProps) {
  const [showColorPicker, setShowColorPicker] = useState<'terrain' | 'route' | 'base' | 'colorize-low' | 'colorize-mid' | 'colorize-high' | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Get elevation grid for export (now with terrain mode support)
  const { grid: elevationGrid, loading: terrainLoading } = useElevationGrid(
    routeData ?? null,
    config.terrainResolution,
    config.terrainMode
  );

  // Quick print status (always available, config-based only)
  const quickStatus = useQuickPrintStatus(config);

  const updateText = (updates: Partial<SculptureTextConfig>) => {
    onConfigChange({ text: { ...config.text, ...updates } });
  };

  // Helper to update colorization config
  const colorization = config.colorization ?? DEFAULT_COLORIZATION_CONFIG;
  const updateColorization = (updates: Partial<TerrainColorizationConfig>) => {
    onConfigChange({
      colorization: { ...colorization, ...updates },
    });
  };

  const updateCustomColor = (key: 'low' | 'mid' | 'high', color: string) => {
    updateColorization({
      customColors: { ...colorization.customColors, [key]: color },
    });
  };

  return (
    <div className="space-y-6">
      {/* Export Modal */}
      <SculptureExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        routeData={routeData ?? null}
        config={config}
        elevationGrid={elevationGrid ?? undefined}
        routeName={routeName}
      />

      {/* Printability Status */}
      <PrintabilityBadge
        validation={printValidation ?? null}
        quickStatus={quickStatus}
        isLoading={isPrintValidating}
      />

      {/* Shape Selection */}
      <ControlSection title="Shape">
        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(SCULPTURE_SHAPES) as [SculptureShape, { label: string; description: string }][]).map(
            ([shape, { label, description }]) => (
              <button
                key={shape}
                onClick={() => onConfigChange({ shape })}
                className={cn(
                  'p-4 text-center rounded-xl border-2 transition-all',
                  config.shape === shape
                    ? 'bg-primary/5 dark:bg-primary/10 border-primary'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                <div className="flex justify-center mb-2">
                  {shape === 'circular' ? (
                    <Circle className={cn(
                      'w-8 h-8',
                      config.shape === shape ? 'text-primary' : 'text-gray-400'
                    )} />
                  ) : (
                    <Square className={cn(
                      'w-8 h-8',
                      config.shape === shape ? 'text-primary' : 'text-gray-400'
                    )} />
                  )}
                </div>
                <div className={cn(
                  'text-sm font-semibold',
                  config.shape === shape ? 'text-primary dark:text-primary' : 'text-gray-700 dark:text-gray-300'
                )}>
                  {label}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">{description}</div>
              </button>
            )
          )}
        </div>
      </ControlSection>

      {/* Size Selection */}
      <ControlSection title="Size">
        <div className="grid grid-cols-3 gap-2">
          {SCULPTURE_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => onConfigChange({ size })}
              className={cn(
                'py-3 px-2 text-center rounded-lg border transition-all',
                config.size === size
                  ? 'bg-primary border-primary text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              <div className="text-lg font-bold">{size}</div>
              <div className="text-[10px] uppercase opacity-70">cm</div>
            </button>
          ))}
        </div>
      </ControlSection>

      {/* Terrain & Route */}
      <ControlSection title="Terrain & Route">
        {/* Terrain Mode Toggle */}
        <div className="space-y-2">
          <ControlLabel className="text-[10px] uppercase text-gray-500">
            Terrain Data Source
          </ControlLabel>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(SCULPTURE_TERRAIN_MODES) as [SculptureTerrainMode, { label: string; description: string }][]).map(
              ([mode, { label, description }]) => (
                <button
                  key={mode}
                  onClick={() => onConfigChange({ terrainMode: mode })}
                  className={cn(
                    'p-2.5 text-left rounded-lg border transition-all',
                    config.terrainMode === mode
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  )}
                >
                  <div className={cn(
                    'text-xs font-semibold',
                    config.terrainMode === mode ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'
                  )}>
                    {label}
                  </div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{description}</div>
                </button>
              )
            )}
          </div>
          {terrainLoading && (
            <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
              <span className="inline-block w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              Fetching terrain data...
            </div>
          )}
        </div>

        {/* Route Style Toggle */}
        <div className="space-y-2 mt-4">
          <ControlLabel className="text-[10px] uppercase text-gray-500">
            Route Style
          </ControlLabel>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(SCULPTURE_ROUTE_STYLES) as [SculptureRouteStyle, { label: string; description: string }][]).map(
              ([style, { label, description }]) => (
                <button
                  key={style}
                  onClick={() => onConfigChange({ routeStyle: style })}
                  className={cn(
                    'p-2.5 text-left rounded-lg border transition-all',
                    config.routeStyle === style
                      ? 'bg-primary/5 dark:bg-primary/10 border-primary'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  )}
                >
                  <div className={cn(
                    'text-xs font-semibold',
                    config.routeStyle === style ? 'text-primary dark:text-primary' : 'text-gray-700 dark:text-gray-300'
                  )}>
                    {label}
                  </div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{description}</div>
                </button>
              )
            )}
          </div>
        </div>

        {/* Style Presets */}
        <div className="space-y-2 mt-4">
          <ControlLabel className="text-[10px] uppercase text-gray-500">
            Style Preset
          </ControlLabel>
          <div className="grid grid-cols-3 gap-1.5">
            {(Object.entries(SCULPTURE_STYLE_PRESETS) as [SculptureStylePreset, { label: string; description: string; config: typeof SCULPTURE_STYLE_PRESETS['balanced']['config'] }][]).map(
              ([preset, { label, description, config: presetConfig }]) => {
                // Check if current config matches this preset
                const isActive =
                  config.elevationScale === presetConfig.elevationScale &&
                  (config.terrainHeightLimit ?? 0.8) === presetConfig.terrainHeightLimit &&
                  (config.routeClearance ?? 0.05) === presetConfig.routeClearance &&
                  (config.terrainSmoothing ?? 1) === presetConfig.terrainSmoothing &&
                  config.terrainMode === presetConfig.terrainMode;

                return (
                  <button
                    key={preset}
                    onClick={() => onConfigChange(presetConfig)}
                    title={description}
                    className={cn(
                      'px-2 py-1.5 text-center rounded-lg border transition-all',
                      isActive
                        ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-500'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    )}
                  >
                    <div className={cn(
                      'text-[10px] font-semibold',
                      isActive ? 'text-violet-700 dark:text-violet-300' : 'text-gray-700 dark:text-gray-300'
                    )}>
                      {label}
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Elevation Scale */}
        <div className="space-y-1 mt-4">
          <ControlLabel className="text-[10px] uppercase text-gray-500">
            Elevation Scale
          </ControlLabel>
          <ControlSlider
            min="0.5"
            max="3.0"
            step="0.1"
            value={config.elevationScale}
            onChange={(e) => onConfigChange({ elevationScale: parseFloat(e.target.value) })}
            displayValue={`${config.elevationScale.toFixed(1)}x`}
            onValueChange={(value) => onConfigChange({ elevationScale: value })}
            formatValue={(v) => `${v.toFixed(1)}x`}
            parseValue={(s) => parseFloat(s.replace('x', ''))}
          />
          <div className="flex justify-between text-[10px] text-gray-400 uppercase font-medium">
            <span>Flat</span>
            <span>Dramatic</span>
          </div>
        </div>

        {/* Terrain Height Limit */}
        <div className="space-y-1 mt-4">
          <ControlLabel className="text-[10px] uppercase text-gray-500">
            Height Limit
          </ControlLabel>
          <ControlSlider
            min="0.3"
            max="1.0"
            step="0.05"
            value={config.terrainHeightLimit ?? 0.8}
            onChange={(e) => onConfigChange({ terrainHeightLimit: parseFloat(e.target.value) })}
            displayValue={`${Math.round((config.terrainHeightLimit ?? 0.8) * 100)}%`}
            onValueChange={(value) => onConfigChange({ terrainHeightLimit: value })}
            formatValue={(v) => `${Math.round(v * 100)}%`}
            parseValue={(s) => parseFloat(s.replace('%', '')) / 100}
          />
          <div className="flex justify-between text-[10px] text-gray-400 uppercase font-medium">
            <span>Capped</span>
            <span>Full</span>
          </div>
        </div>

        {/* Route Clearance */}
        <div className="space-y-1 mt-4">
          <ControlLabel className="text-[10px] uppercase text-gray-500">
            Route Clearance
          </ControlLabel>
          <ControlSlider
            min="0"
            max="0.15"
            step="0.01"
            value={config.routeClearance ?? 0.05}
            onChange={(e) => onConfigChange({ routeClearance: parseFloat(e.target.value) })}
            displayValue={(config.routeClearance ?? 0.05) === 0 ? 'Off' : `${Math.round((config.routeClearance ?? 0.05) * 100)}%`}
            onValueChange={(value) => onConfigChange({ routeClearance: value })}
            formatValue={(v) => v === 0 ? 'Off' : `${Math.round(v * 100)}%`}
            parseValue={(s) => s === 'Off' ? 0 : parseFloat(s.replace('%', '')) / 100}
          />
          <div className="flex justify-between text-[10px] text-gray-400 uppercase font-medium">
            <span>None</span>
            <span>Wide</span>
          </div>
        </div>

        {/* Terrain Smoothing */}
        <div className="space-y-1 mt-4">
          <ControlLabel className="text-[10px] uppercase text-gray-500">
            Terrain Smoothing
          </ControlLabel>
          <ControlSlider
            min="0"
            max="3"
            step="1"
            value={config.terrainSmoothing ?? 1}
            onChange={(e) => onConfigChange({ terrainSmoothing: parseInt(e.target.value) })}
            displayValue={(config.terrainSmoothing ?? 1) === 0 ? 'Off' : `${config.terrainSmoothing ?? 1}x`}
            onValueChange={(value) => onConfigChange({ terrainSmoothing: value })}
            formatValue={(v) => v === 0 ? 'Off' : `${v}x`}
            parseValue={(s) => s === 'Off' ? 0 : parseInt(s.replace('x', ''))}
          />
          <div className="flex justify-between text-[10px] text-gray-400 uppercase font-medium">
            <span>Sharp</span>
            <span>Smooth</span>
          </div>
        </div>

        {/* Route Thickness */}
        <div className="space-y-1 mt-4">
          <ControlLabel className="text-[10px] uppercase text-gray-500">
            Route Thickness
          </ControlLabel>
          <ControlSlider
            min="1"
            max="5"
            step="0.5"
            value={config.routeThickness}
            onChange={(e) => onConfigChange({ routeThickness: parseFloat(e.target.value) })}
            displayValue={`${config.routeThickness.toFixed(1)} mm`}
            onValueChange={(value) => onConfigChange({ routeThickness: value })}
            formatValue={(v) => `${v.toFixed(1)} mm`}
            parseValue={(s) => parseFloat(s.replace(' mm', ''))}
          />
          <div className="flex justify-between text-[10px] text-gray-400 uppercase font-medium">
            <span>Thin</span>
            <span>Thick</span>
          </div>
        </div>

        {/* Terrain Rotation */}
        <div className="space-y-2 mt-4">
          <ControlLabel className="text-[10px] uppercase text-gray-500">
            Terrain Rotation
          </ControlLabel>
          {/* Auto checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={(config.terrainRotation ?? -1) === -1}
              onChange={(e) => onConfigChange({ terrainRotation: e.target.checked ? -1 : 0 })}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">Auto (start point at front)</span>
          </label>
          {/* Manual rotation - only shown when not auto */}
          {(config.terrainRotation ?? -1) !== -1 && (
            <>
              {/* Rectangular: 4 discrete rotation buttons */}
              {config.shape === 'rectangular' ? (
                <div className="grid grid-cols-4 gap-2">
                  {[0, 90, 180, 270].map((angle) => (
                    <button
                      key={angle}
                      onClick={() => onConfigChange({ terrainRotation: angle })}
                      className={cn(
                        'py-2 px-1 text-center rounded-lg border transition-all text-xs font-medium',
                        (config.terrainRotation ?? 0) === angle
                          ? 'bg-primary border-primary text-white'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                      )}
                    >
                      {angle}°
                    </button>
                  ))}
                </div>
              ) : (
                /* Circular: continuous slider */
                <div className="space-y-1">
                  <ControlSlider
                    min="0"
                    max="360"
                    step="5"
                    value={config.terrainRotation ?? 0}
                    onChange={(e) => onConfigChange({ terrainRotation: parseFloat(e.target.value) })}
                    displayValue={`${(config.terrainRotation ?? 0).toFixed(0)}°`}
                    onValueChange={(value) => onConfigChange({ terrainRotation: value })}
                    formatValue={(v) => `${v.toFixed(0)}°`}
                    parseValue={(s) => parseFloat(s.replace('°', ''))}
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 uppercase font-medium">
                    <span>0°</span>
                    <span>360°</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ControlSection>

      {/* Colors */}
      <ControlSection title="Colors">
        {/* Terrain Color */}
        <div className="space-y-2 relative">
          <ControlLabel className="text-[10px] uppercase text-gray-500">
            Terrain Color
          </ControlLabel>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowColorPicker(showColorPicker === 'terrain' ? null : 'terrain')}
              className={cn(
                'w-9 h-9 rounded-md border shadow-sm transition-all',
                showColorPicker === 'terrain'
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              )}
              style={{ backgroundColor: config.terrainColor }}
              aria-label="Toggle terrain color picker"
            />
            <ControlInput
              type="text"
              value={config.terrainColor}
              onChange={(e) => onConfigChange({ terrainColor: e.target.value })}
              className="font-mono"
              placeholder="#8b7355"
            />
          </div>
          {showColorPicker === 'terrain' && (
            <div className="absolute left-0 top-full mt-2 z-50 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
              <div
                className="fixed inset-0 z-[-1]"
                onClick={() => setShowColorPicker(null)}
              />
              <HexColorPicker
                color={config.terrainColor}
                onChange={(color) => onConfigChange({ terrainColor: color })}
              />
            </div>
          )}
        </div>

        {/* Base/Platform Color */}
        <div className="space-y-2 relative">
          <ControlLabel className="text-[10px] uppercase text-gray-500">
            Base Color
          </ControlLabel>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowColorPicker(showColorPicker === 'base' ? null : 'base')}
              className={cn(
                'w-9 h-9 rounded-md border shadow-sm transition-all',
                showColorPicker === 'base'
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              )}
              style={{ backgroundColor: config.baseColor || config.terrainColor }}
              aria-label="Toggle base color picker"
            />
            <ControlInput
              type="text"
              value={config.baseColor || ''}
              onChange={(e) => onConfigChange({ baseColor: e.target.value || undefined })}
              className="font-mono"
              placeholder={config.terrainColor}
            />
            {config.baseColor && (
              <button
                type="button"
                onClick={() => onConfigChange({ baseColor: undefined })}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Reset to terrain color"
              >
                Reset
              </button>
            )}
          </div>
          <div className="text-[10px] text-gray-400">
            {config.baseColor ? 'Custom base color' : 'Using terrain color'}
          </div>
          {showColorPicker === 'base' && (
            <div className="absolute left-0 top-full mt-2 z-50 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
              <div
                className="fixed inset-0 z-[-1]"
                onClick={() => setShowColorPicker(null)}
              />
              <HexColorPicker
                color={config.baseColor || config.terrainColor}
                onChange={(color) => onConfigChange({ baseColor: color })}
              />
            </div>
          )}
        </div>

        {/* Route Color */}
        <div className="space-y-2 relative">
          <ControlLabel className="text-[10px] uppercase text-gray-500">
            Route Color
          </ControlLabel>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowColorPicker(showColorPicker === 'route' ? null : 'route')}
              className={cn(
                'w-9 h-9 rounded-md border shadow-sm transition-all',
                showColorPicker === 'route'
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              )}
              style={{ backgroundColor: config.routeColor }}
              aria-label="Toggle route color picker"
            />
            <ControlInput
              type="text"
              value={config.routeColor}
              onChange={(e) => onConfigChange({ routeColor: e.target.value })}
              className="font-mono"
              placeholder="#4ade80"
            />
          </div>
          {showColorPicker === 'route' && (
            <div className="absolute left-0 top-full mt-2 z-50 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
              <div
                className="fixed inset-0 z-[-1]"
                onClick={() => setShowColorPicker(null)}
              />
              <HexColorPicker
                color={config.routeColor}
                onChange={(color) => onConfigChange({ routeColor: color })}
              />
            </div>
          )}
        </div>
      </ControlSection>

      {/* Platform */}
      <ControlSection title="Platform">
        {/* Rim Height */}
        <div className="space-y-1">
          <ControlLabel className="text-[10px] uppercase text-gray-500">
            Rim Height
          </ControlLabel>
          <ControlSlider
            min="0"
            max="5"
            step="0.5"
            value={config.rimHeight}
            onChange={(e) => onConfigChange({ rimHeight: parseFloat(e.target.value) })}
            displayValue={`${config.rimHeight.toFixed(1)} mm`}
            onValueChange={(value) => onConfigChange({ rimHeight: value })}
            formatValue={(v) => `${v.toFixed(1)} mm`}
            parseValue={(s) => parseFloat(s.replace(' mm', ''))}
          />
          <div className="flex justify-between text-[10px] text-gray-400 uppercase font-medium">
            <span>None</span>
            <span>Tall</span>
          </div>
        </div>

        {/* Base Height */}
        <div className="space-y-1 mt-4">
          <ControlLabel className="text-[10px] uppercase text-gray-500">
            Base Thickness
          </ControlLabel>
          <ControlSlider
            min="3"
            max="10"
            step="1"
            value={config.baseHeight}
            onChange={(e) => onConfigChange({ baseHeight: parseFloat(e.target.value) })}
            displayValue={`${config.baseHeight.toFixed(0)} mm`}
            onValueChange={(value) => onConfigChange({ baseHeight: value })}
            formatValue={(v) => `${v.toFixed(0)} mm`}
            parseValue={(s) => parseFloat(s.replace(' mm', ''))}
          />
        </div>
      </ControlSection>

      {/* Typography */}
      <ControlSection title="Engraved Text">
        <div className="space-y-4">
          {/* Enable Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.text.enabled}
              onChange={(e) => updateText({ enabled: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show engraved text</span>
          </label>

          {config.text.enabled && (
            <>
              {/* Title */}
              <div className="space-y-1">
                <ControlLabel className="text-[10px] uppercase text-gray-500">
                  Title
                </ControlLabel>
                <ControlInput
                  type="text"
                  value={config.text.title}
                  onChange={(e) => updateText({ title: e.target.value })}
                  placeholder="ROUTE NAME"
                  className="uppercase"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-1">
                <ControlLabel className="text-[10px] uppercase text-gray-500">
                  Stats Line
                </ControlLabel>
                <ControlInput
                  type="text"
                  value={config.text.subtitle}
                  onChange={(e) => updateText({ subtitle: e.target.value })}
                  placeholder="79.3 km · 3,887 m↑"
                />
              </div>

              {/* Engraving Depth */}
              <div className="space-y-1">
                <ControlLabel className="text-[10px] uppercase text-gray-500">
                  Engraving Depth
                </ControlLabel>
                <ControlSlider
                  min="0.3"
                  max="1.5"
                  step="0.1"
                  value={config.text.depth}
                  onChange={(e) => updateText({ depth: parseFloat(e.target.value) })}
                  displayValue={`${config.text.depth.toFixed(1)} mm`}
                  onValueChange={(value) => updateText({ depth: value })}
                  formatValue={(v) => `${v.toFixed(1)} mm`}
                  parseValue={(s) => parseFloat(s.replace(' mm', ''))}
                />
                <div className="flex justify-between text-[10px] text-gray-400 uppercase font-medium">
                  <span>Subtle</span>
                  <span>Deep</span>
                </div>
              </div>
            </>
          )}
        </div>
      </ControlSection>

      {/* Material */}
      <ControlSection title="Material">
        <div className="space-y-2">
          {(Object.entries(SCULPTURE_MATERIALS) as [SculptureMaterial, { label: string; description: string }][]).map(
            ([material, { label, description }]) => (
              <button
                key={material}
                onClick={() => onConfigChange({ material })}
                className={cn(
                  'w-full p-3 text-left rounded-lg border transition-all flex items-center justify-between',
                  config.material === material
                    ? 'bg-primary/5 dark:bg-primary/10 border-primary'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                <div>
                  <div className={cn(
                    'text-sm font-medium',
                    config.material === material
                      ? 'text-primary dark:text-primary'
                      : 'text-gray-700 dark:text-gray-300'
                  )}>
                    {label}
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {description}
                  </div>
                </div>
                {config.material === material && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            )
          )}
        </div>
      </ControlSection>

      {/* Preview Settings */}
      <ControlSection title="Preview">
        <div className="space-y-3">
          {/* Turntable Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Turntable
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400">
                Auto-rotate for showcase
              </div>
            </div>
            <button
              onClick={() => onConfigChange({ turntableEnabled: !config.turntableEnabled })}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                config.turntableEnabled
                  ? 'bg-primary'
                  : 'bg-gray-200 dark:bg-gray-700'
              )}
              aria-label="Toggle turntable animation"
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  config.turntableEnabled ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {/* Turntable Speed - only shown when enabled */}
          {config.turntableEnabled && (
            <div>
              <ControlLabel className="text-[10px] uppercase text-gray-500">
                Rotation Speed
              </ControlLabel>
              <ControlSlider
                min="0.1"
                max="1.0"
                step="0.1"
                value={config.turntableSpeed ?? 0.3}
                onChange={(e) => onConfigChange({ turntableSpeed: parseFloat(e.target.value) })}
                onValueChange={(value) => onConfigChange({ turntableSpeed: value })}
              />
              <div className="flex justify-between text-[10px] text-gray-400 uppercase font-medium">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>
          )}
        </div>
      </ControlSection>

      {/* Terrain Colorization - Preview Only */}
      <ControlSection title="Terrain Colorization">
        {/* Info Banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-amber-600 dark:text-amber-400 text-lg">🎨</span>
            <div>
              <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
                Preview Only Feature
              </p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                Colorization is for visualization inspiration. Paint your 3D print like a Warhammer figure!
              </p>
            </div>
          </div>
        </div>

        {/* Enable Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable Colorization
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400">
              Elevation-based terrain coloring
            </div>
          </div>
          <button
            onClick={() => updateColorization({ enabled: !colorization.enabled })}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              colorization.enabled
                ? 'bg-primary'
                : 'bg-gray-200 dark:bg-gray-700'
            )}
            aria-label="Toggle terrain colorization"
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                colorization.enabled ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {colorization.enabled && (
          <>
            {/* Preset Selector */}
            <div className="space-y-2">
              <ControlLabel className="text-[10px] uppercase text-gray-500">
                Color Scheme
              </ControlLabel>
              <div className="grid grid-cols-2 gap-2">
                {/* Preset options */}
                {(['natural', 'earth', 'topo', 'mono', 'custom'] as const).map((preset) => {
                  const isActive = colorization.preset === preset;
                  const presetInfo = preset === 'custom'
                    ? { name: 'Custom', description: 'Pick your own colors' }
                    : TERRAIN_COLOR_PRESETS[preset];

                  // Generate gradient preview for preset
                  const gradientStops = preset === 'custom'
                    ? [colorization.customColors.low, colorization.customColors.mid, colorization.customColors.high]
                    : TERRAIN_COLOR_PRESETS[preset].stops.map(s => s.color);
                  const gradientStyle = {
                    background: `linear-gradient(to right, ${gradientStops.join(', ')})`,
                  };

                  return (
                    <button
                      key={preset}
                      onClick={() => updateColorization({ preset })}
                      className={cn(
                        'p-2.5 text-left rounded-lg border transition-all',
                        isActive
                          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      )}
                    >
                      {/* Color gradient preview */}
                      <div
                        className="h-3 rounded-sm mb-1.5"
                        style={gradientStyle}
                      />
                      <div className={cn(
                        'text-xs font-semibold',
                        isActive ? 'text-amber-700 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300'
                      )}>
                        {presetInfo.name}
                      </div>
                      <div className="text-[9px] text-gray-500 mt-0.5 truncate">
                        {presetInfo.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Pickers (when preset === 'custom') */}
            {colorization.preset === 'custom' && (
              <div className="space-y-3 mt-4">
                {/* Low Elevation Color */}
                <div className="space-y-1 relative">
                  <ControlLabel className="text-[10px] uppercase text-gray-500">
                    Low Elevation
                  </ControlLabel>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(showColorPicker === 'colorize-low' ? null : 'colorize-low')}
                      className={cn(
                        'w-9 h-9 rounded-md border shadow-sm transition-all',
                        showColorPicker === 'colorize-low'
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      )}
                      style={{ backgroundColor: colorization.customColors.low }}
                      aria-label="Toggle low elevation color picker"
                    />
                    <ControlInput
                      type="text"
                      value={colorization.customColors.low}
                      onChange={(e) => updateCustomColor('low', e.target.value)}
                      className="font-mono"
                      placeholder="#4a7c59"
                    />
                  </div>
                  {showColorPicker === 'colorize-low' && (
                    <div className="absolute left-0 top-full mt-2 z-50 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
                      <div className="fixed inset-0 z-[-1]" onClick={() => setShowColorPicker(null)} />
                      <HexColorPicker
                        color={colorization.customColors.low}
                        onChange={(color) => updateCustomColor('low', color)}
                      />
                    </div>
                  )}
                </div>

                {/* Mid Elevation Color */}
                <div className="space-y-1 relative">
                  <ControlLabel className="text-[10px] uppercase text-gray-500">
                    Mid Elevation
                  </ControlLabel>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(showColorPicker === 'colorize-mid' ? null : 'colorize-mid')}
                      className={cn(
                        'w-9 h-9 rounded-md border shadow-sm transition-all',
                        showColorPicker === 'colorize-mid'
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      )}
                      style={{ backgroundColor: colorization.customColors.mid }}
                      aria-label="Toggle mid elevation color picker"
                    />
                    <ControlInput
                      type="text"
                      value={colorization.customColors.mid}
                      onChange={(e) => updateCustomColor('mid', e.target.value)}
                      className="font-mono"
                      placeholder="#b8860b"
                    />
                  </div>
                  {showColorPicker === 'colorize-mid' && (
                    <div className="absolute left-0 top-full mt-2 z-50 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
                      <div className="fixed inset-0 z-[-1]" onClick={() => setShowColorPicker(null)} />
                      <HexColorPicker
                        color={colorization.customColors.mid}
                        onChange={(color) => updateCustomColor('mid', color)}
                      />
                    </div>
                  )}
                </div>

                {/* High Elevation Color */}
                <div className="space-y-1 relative">
                  <ControlLabel className="text-[10px] uppercase text-gray-500">
                    High Elevation
                  </ControlLabel>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(showColorPicker === 'colorize-high' ? null : 'colorize-high')}
                      className={cn(
                        'w-9 h-9 rounded-md border shadow-sm transition-all',
                        showColorPicker === 'colorize-high'
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      )}
                      style={{ backgroundColor: colorization.customColors.high }}
                      aria-label="Toggle high elevation color picker"
                    />
                    <ControlInput
                      type="text"
                      value={colorization.customColors.high}
                      onChange={(e) => updateCustomColor('high', e.target.value)}
                      className="font-mono"
                      placeholder="#f5f5f5"
                    />
                  </div>
                  {showColorPicker === 'colorize-high' && (
                    <div className="absolute left-0 top-full mt-2 z-50 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
                      <div className="fixed inset-0 z-[-1]" onClick={() => setShowColorPicker(null)} />
                      <HexColorPicker
                        color={colorization.customColors.high}
                        onChange={(color) => updateCustomColor('high', color)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Smoothness Slider */}
            <div className="space-y-1 mt-4">
              <ControlLabel className="text-[10px] uppercase text-gray-500">
                Gradient Style
              </ControlLabel>
              <ControlSlider
                min="0"
                max="1"
                step="0.1"
                value={colorization.smoothness}
                onChange={(e) => updateColorization({ smoothness: parseFloat(e.target.value) })}
                displayValue={colorization.smoothness < 0.5 ? 'Stepped' : 'Smooth'}
                onValueChange={(value) => updateColorization({ smoothness: value })}
                formatValue={(v) => v < 0.5 ? 'Stepped' : 'Smooth'}
                parseValue={(s) => s === 'Stepped' ? 0.2 : 0.8}
              />
              <div className="flex justify-between text-[10px] text-gray-400 uppercase font-medium">
                <span>Banded</span>
                <span>Smooth</span>
              </div>
            </div>
          </>
        )}
      </ControlSection>

    </div>
  );
}
