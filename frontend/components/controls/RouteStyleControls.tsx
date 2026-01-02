'use client';

import { useState, useMemo } from 'react';
import { Paintbrush, Minus, Circle } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import type { RouteConfig, RouteStyle } from '@/types/poster';
import { cn } from '@/lib/utils';
import { ControlSection, ControlCheckbox, ControlSlider, ControlLabel, ControlInput } from '@/components/ui/control-components';

interface RouteStyleControlsProps {
  route: RouteConfig;
  onRouteChange: (route: RouteConfig) => void;
}

const lineStyles = [
  { id: 'solid', label: 'Solid', icon: Minus },
  { id: 'dashed', label: 'Dashed', icon: Minus },
  { id: 'dotted', label: 'Dotted', icon: Circle },
] as const;

export function RouteStyleControls({ route, onRouteChange }: RouteStyleControlsProps) {
  const [showColorPicker, setShowColorPicker] = useState<'route' | 'start' | 'end' | null>(null);

  const updateStyle = (updates: Partial<RouteStyle>) => {
    onRouteChange({
      ...route,
      style: {
        ...route.style,
        ...updates,
      },
    });
  };

  const effectiveRouteColor = route.style?.color || '#FF4444';
  const effectiveStartColor = route.style?.startColor || '#22C55E';
  const effectiveEndColor = route.style?.endColor || '#EF4444';

  return (
    <div className="space-y-6">
      <ControlSection title="Route Appearance">
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
              style={{ backgroundColor: effectiveRouteColor }}
              aria-label="Toggle route color picker"
            />
            <ControlInput
              type="text"
              value={effectiveRouteColor}
              onChange={(e) => updateStyle({ color: e.target.value })}
              className="font-mono"
              placeholder="#FF4444"
            />
          </div>

          {showColorPicker === 'route' && (
            <div className="absolute left-0 top-full mt-2 z-50 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
              <div
                className="fixed inset-0 z-[-1]"
                onClick={() => setShowColorPicker(null)}
              />
              <HexColorPicker
                color={effectiveRouteColor}
                onChange={(color) => updateStyle({ color })}
              />
            </div>
          )}
        </div>

        {/* Line Width */}
        <div className="space-y-1">
          <ControlLabel className="text-[10px] uppercase text-gray-500">Line Width</ControlLabel>
          <ControlSlider
            min="1"
            max="8"
            step="0.5"
            value={route.style?.width ?? 3}
            onChange={(e) => updateStyle({ width: parseFloat(e.target.value) })}
            displayValue={`${(route.style?.width ?? 3).toFixed(1)}px`}
            onValueChange={(value) => updateStyle({ width: value })}
            formatValue={(v) => `${v.toFixed(1)}px`}
            parseValue={(s) => parseFloat(s.replace('px', ''))}
          />
          <div className="flex justify-between text-[10px] text-gray-400 uppercase font-medium">
            <span>Thin</span>
            <span>Thick</span>
          </div>
        </div>

        {/* Opacity */}
        <div className="space-y-1">
          <ControlLabel className="text-[10px] uppercase text-gray-500">Opacity</ControlLabel>
          <ControlSlider
            min="0.1"
            max="1.0"
            step="0.1"
            value={route.style?.opacity ?? 0.9}
            onChange={(e) => updateStyle({ opacity: parseFloat(e.target.value) })}
            displayValue={`${Math.round((route.style?.opacity ?? 0.9) * 100)}%`}
            onValueChange={(value) => updateStyle({ opacity: value })}
            formatValue={(v) => `${Math.round(v * 100)}%`}
            parseValue={(s) => parseFloat(s.replace('%', '')) / 100}
          />
        </div>

        {/* Line Style */}
        <div className="space-y-2">
          <ControlLabel className="text-[10px] uppercase text-gray-500">Line Style</ControlLabel>
          <div className="grid grid-cols-3 gap-2">
            {lineStyles.map(({ id, label }) => {
              const isActive = (route.style?.lineStyle ?? 'solid') === id;
              return (
                <button
                  key={id}
                  onClick={() => updateStyle({ lineStyle: id as RouteStyle['lineStyle'] })}
                  className={cn(
                    "py-2 px-2 text-[10px] uppercase font-bold rounded border transition-all",
                    isActive
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </ControlSection>

      <ControlSection title="Start & End Markers">
        <ControlCheckbox
          label="Show Start/End Points"
          checked={route.style?.showStartEnd ?? true}
          onChange={() => updateStyle({ showStartEnd: !(route.style?.showStartEnd ?? true) })}
        />

        {route.style?.showStartEnd && (
          <div className="pl-6 space-y-4">
            {/* Start Color */}
            <div className="space-y-2 relative">
              <ControlLabel className="text-[10px] uppercase text-gray-500">
                Start Point Color
              </ControlLabel>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(showColorPicker === 'start' ? null : 'start')}
                  className={cn(
                    'w-7 h-7 rounded-md border shadow-sm transition-all',
                    showColorPicker === 'start'
                      ? 'border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  )}
                  style={{ backgroundColor: effectiveStartColor }}
                  aria-label="Toggle start color picker"
                />
                <ControlInput
                  type="text"
                  value={effectiveStartColor}
                  onChange={(e) => updateStyle({ startColor: e.target.value })}
                  className="font-mono text-xs"
                  placeholder="#22C55E"
                />
              </div>

              {showColorPicker === 'start' && (
                <div className="absolute left-0 top-full mt-2 z-50 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
                  <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setShowColorPicker(null)}
                  />
                  <HexColorPicker
                    color={effectiveStartColor}
                    onChange={(color) => updateStyle({ startColor: color })}
                  />
                </div>
              )}
            </div>

            {/* End Color */}
            <div className="space-y-2 relative">
              <ControlLabel className="text-[10px] uppercase text-gray-500">
                End Point Color
              </ControlLabel>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(showColorPicker === 'end' ? null : 'end')}
                  className={cn(
                    'w-7 h-7 rounded-md border shadow-sm transition-all',
                    showColorPicker === 'end'
                      ? 'border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  )}
                  style={{ backgroundColor: effectiveEndColor }}
                  aria-label="Toggle end color picker"
                />
                <ControlInput
                  type="text"
                  value={effectiveEndColor}
                  onChange={(e) => updateStyle({ endColor: e.target.value })}
                  className="font-mono text-xs"
                  placeholder="#EF4444"
                />
              </div>

              {showColorPicker === 'end' && (
                <div className="absolute left-0 top-full mt-2 z-50 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
                  <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setShowColorPicker(null)}
                  />
                  <HexColorPicker
                    color={effectiveEndColor}
                    onChange={(color) => updateStyle({ endColor: color })}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </ControlSection>
    </div>
  );
}
