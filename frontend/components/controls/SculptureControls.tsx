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
import { useElevationGrid } from '@/hooks/useElevationGrid';
import type { RouteData } from '@/types/poster';
import type {
  SculptureConfig,
  SculptureShape,
  SculptureRouteStyle,
  SculptureMaterial,
  SculptureTextConfig,
} from '@/types/sculpture';
import {
  SCULPTURE_SIZES,
  SCULPTURE_SHAPES,
  SCULPTURE_ROUTE_STYLES,
  SCULPTURE_MATERIALS,
} from '@/types/sculpture';

interface SculptureControlsProps {
  config: SculptureConfig;
  onConfigChange: (updates: Partial<SculptureConfig>) => void;
  routeData?: RouteData | null;
  routeName?: string;
}

export function SculptureControls({ config, onConfigChange, routeData, routeName }: SculptureControlsProps) {
  const [showColorPicker, setShowColorPicker] = useState<'terrain' | 'route' | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Get elevation grid for export
  const { grid: elevationGrid } = useElevationGrid(routeData ?? null, config.terrainResolution);

  const updateText = (updates: Partial<SculptureTextConfig>) => {
    onConfigChange({ text: { ...config.text, ...updates } });
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
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                <div className="flex justify-center mb-2">
                  {shape === 'circular' ? (
                    <Circle className={cn(
                      'w-8 h-8',
                      config.shape === shape ? 'text-blue-600' : 'text-gray-400'
                    )} />
                  ) : (
                    <Square className={cn(
                      'w-8 h-8',
                      config.shape === shape ? 'text-blue-600' : 'text-gray-400'
                    )} />
                  )}
                </div>
                <div className={cn(
                  'text-sm font-semibold',
                  config.shape === shape ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
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
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
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
        {/* Route Style Toggle */}
        <div className="space-y-2">
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
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  )}
                >
                  <div className={cn(
                    'text-xs font-semibold',
                    config.routeStyle === style ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                  )}>
                    {label}
                  </div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{description}</div>
                </button>
              )
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
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
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
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
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
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                <div>
                  <div className={cn(
                    'text-sm font-medium',
                    config.material === material
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300'
                  )}>
                    {label}
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {description}
                  </div>
                </div>
                {config.material === material && (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </button>
            )
          )}
        </div>
      </ControlSection>

    </div>
  );
}
