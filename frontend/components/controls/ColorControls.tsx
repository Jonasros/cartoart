'use client';

import { HexColorPicker } from 'react-colorful';
import { useState } from 'react';
import type { ColorPalette } from '@/types/poster';
import { cn } from '@/lib/utils';
import { ControlSection, ControlGroup, ControlLabel, ControlInput } from '@/components/ui/control-components';
import { Check, Info } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';

interface ColorControlsProps {
  palette: ColorPalette;
  presets?: ColorPalette[];
  onPaletteChange: (palette: ColorPalette) => void;
}

const colorLabels: Record<string, string> = {
  background: 'Background',
  primary: 'Primary',
  secondary: 'Secondary',
  water: 'Water',
  greenSpace: 'Green Space',
  text: 'Text',
  grid: 'Grid',
};

export function ColorControls({ palette, presets, onPaletteChange }: ColorControlsProps) {
  const [activeColor, setActiveColor] = useState<string | null>(null);

  const handleColorChange = (colorKey: string, color: string) => {
    onPaletteChange({
      ...palette,
      [colorKey]: color,
    });
  };

  const visibleColorKeys = Object.keys(colorLabels).filter(key => 
    key in palette || (key === 'grid' && presets?.some(p => 'grid' in p))
  );

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800/30">
        <div className="flex gap-2">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
            <span className="font-medium">Theme colors:</span> Presets are color variations for the selected theme. Custom colors override presets and give you full control.
          </p>
        </div>
      </div>

      {presets && presets.length > 0 && (
        <ControlSection title="Presets">
          <div className="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => {
                const isActive = palette.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onPaletteChange(preset)}
                    className={cn(
                      'group relative flex flex-col gap-2 p-3 text-left border rounded-lg transition-all',
                      isActive
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-500/50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    )}
                  >
                    <div className="flex -space-x-1.5">
                      <div className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 shadow-sm" style={{ backgroundColor: preset.background }} />
                      <div className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 shadow-sm" style={{ backgroundColor: preset.primary }} />
                      <div className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 shadow-sm" style={{ backgroundColor: preset.water }} />
                    </div>
                  <div className="flex items-center gap-1.5 w-full min-w-0">
                    <span className={cn(
                      "text-xs font-medium truncate flex-1",
                      isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
                    )}>
                      {preset.name}
                    </span>
                    {preset.name === 'Whiteprint' && (
                      <Tooltip content="Inverse of blueprint: dark lines on light background">
                        <Info className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      </Tooltip>
                    )}
                  </div>
                    {isActive && (
                      <div className="absolute top-2 right-2 text-blue-500">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </ControlSection>
      )}
      
      <ControlSection title="Custom Colors" className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          {visibleColorKeys.map((colorKey) => (
            <div key={colorKey} className="relative">
              <ControlLabel>{colorLabels[colorKey]}</ControlLabel>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveColor(activeColor === colorKey ? null : colorKey)}
                  className={cn(
                    'w-9 h-9 rounded-md border shadow-sm transition-all',
                    activeColor === colorKey
                      ? 'border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  )}
                  style={{ backgroundColor: (palette as any)[colorKey] }}
                  aria-label={`Select ${colorLabels[colorKey]} color`}
                />
                <ControlInput
                  type="text"
                  value={(palette as any)[colorKey] || ''}
                  onChange={(e) => handleColorChange(colorKey, e.target.value)}
                  className="font-mono"
                  placeholder="#000000"
                />
              </div>
              
              {activeColor === colorKey && (
                <div className="absolute left-0 top-full mt-2 z-50 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
                  <div 
                    className="fixed inset-0 z-[-1]" 
                    onClick={() => setActiveColor(null)} 
                  />
                  <HexColorPicker
                    color={(palette as any)[colorKey] || '#000000'}
                    onChange={(color) => handleColorChange(colorKey, color)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </ControlSection>
    </div>
  );
}

