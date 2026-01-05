'use client';

import { cn } from '@/lib/utils';
import { ControlSection } from '@/components/ui/control-components';
import type { SculptureConfig } from '@/types/sculpture';

interface SculptureStylePresetsProps {
  config: SculptureConfig;
  onConfigChange: (updates: Partial<SculptureConfig>) => void;
}

interface SculpturePreset {
  id: string;
  name: string;
  description: string;
  preview: {
    gradient: string;
    accent: string;
  };
  config: Partial<SculptureConfig>;
}

const SCULPTURE_PRESETS: SculpturePreset[] = [
  {
    id: 'classic-earth',
    name: 'Classic Earth',
    description: 'Natural terrain with green route',
    preview: {
      gradient: 'from-amber-700 to-amber-900',
      accent: 'bg-emerald-500',
    },
    config: {
      terrainColor: '#8b7355',
      routeColor: '#4ade80',
      routeStyle: 'raised',
      elevationScale: 1.5,
      terrainHeightLimit: 0.8,
      routeClearance: 0.05,
      terrainSmoothing: 1,
      terrainMode: 'route',
      terrainResolution: 128,
    },
  },
  {
    id: 'midnight-gold',
    name: 'Midnight Gold',
    description: 'Dark terrain with golden path',
    preview: {
      gradient: 'from-gray-800 to-gray-900',
      accent: 'bg-amber-400',
    },
    config: {
      terrainColor: '#2d3748',
      routeColor: '#f6ad55',
      routeStyle: 'raised',
      elevationScale: 1.8,
      terrainHeightLimit: 0.85,
      routeClearance: 0.06,
      terrainSmoothing: 1,
      terrainMode: 'route',
      terrainResolution: 128,
    },
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Coastal vibes with engraved route',
    preview: {
      gradient: 'from-slate-500 to-slate-700',
      accent: 'bg-cyan-400',
    },
    config: {
      terrainColor: '#64748b',
      routeColor: '#22d3ee',
      routeStyle: 'engraved',
      elevationScale: 1.2,
      terrainHeightLimit: 0.7,
      routeClearance: 0.04,
      terrainSmoothing: 2,
      terrainMode: 'route',
      terrainResolution: 96,
    },
  },
  {
    id: 'forest-trail',
    name: 'Forest Trail',
    description: 'Deep green with engraved path',
    preview: {
      gradient: 'from-green-800 to-green-900',
      accent: 'bg-lime-400',
    },
    config: {
      terrainColor: '#166534',
      routeColor: '#a3e635',
      routeStyle: 'engraved',
      elevationScale: 2.0,
      terrainHeightLimit: 0.9,
      routeClearance: 0.06,
      terrainSmoothing: 1,
      terrainMode: 'terrain',
      terrainResolution: 128,
    },
  },
  {
    id: 'snow-peak',
    name: 'Snow Peak',
    description: 'Alpine white with red trail',
    preview: {
      gradient: 'from-gray-100 to-gray-300',
      accent: 'bg-red-500',
    },
    config: {
      terrainColor: '#e5e7eb',
      routeColor: '#ef4444',
      routeStyle: 'raised',
      elevationScale: 2.5,
      terrainHeightLimit: 1.0,
      routeClearance: 0.08,
      terrainSmoothing: 0,
      terrainMode: 'terrain',
      terrainResolution: 128,
    },
  },
  {
    id: 'desert-sand',
    name: 'Desert Sand',
    description: 'Warm desert tones',
    preview: {
      gradient: 'from-orange-300 to-orange-400',
      accent: 'bg-red-600',
    },
    config: {
      terrainColor: '#fcd34d',
      routeColor: '#dc2626',
      routeStyle: 'raised',
      elevationScale: 1.0,
      terrainHeightLimit: 0.6,
      routeClearance: 0.03,
      terrainSmoothing: 2,
      terrainMode: 'route',
      terrainResolution: 96,
    },
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Clean black and white',
    preview: {
      gradient: 'from-white to-gray-200',
      accent: 'bg-black',
    },
    config: {
      terrainColor: '#f5f5f5',
      routeColor: '#1a1a1a',
      routeStyle: 'raised',
      elevationScale: 1.5,
      terrainHeightLimit: 0.8,
      routeClearance: 0.05,
      terrainSmoothing: 1,
      terrainMode: 'route',
      terrainResolution: 128,
    },
  },
  {
    id: 'volcanic',
    name: 'Volcanic',
    description: 'Dark rock with lava trail',
    preview: {
      gradient: 'from-stone-700 to-stone-900',
      accent: 'bg-orange-500',
    },
    config: {
      terrainColor: '#44403c',
      routeColor: '#f97316',
      routeStyle: 'engraved',
      elevationScale: 2.2,
      terrainHeightLimit: 0.95,
      routeClearance: 0.07,
      terrainSmoothing: 0,
      terrainMode: 'terrain',
      terrainResolution: 128,
    },
  },
];

export function SculptureStylePresets({ config, onConfigChange }: SculptureStylePresetsProps) {
  const isPresetActive = (preset: SculpturePreset) => {
    return (
      config.terrainColor === preset.config.terrainColor &&
      config.routeColor === preset.config.routeColor
    );
  };

  return (
    <div className="space-y-6">
      <ControlSection title="Style Presets">
        <div className="grid grid-cols-2 gap-3">
          {SCULPTURE_PRESETS.map((preset) => {
            const isActive = isPresetActive(preset);
            return (
              <button
                key={preset.id}
                onClick={() => onConfigChange(preset.config)}
                className={cn(
                  'relative p-3 rounded-xl border-2 transition-all text-left overflow-hidden group',
                  isActive
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                {/* Preview visualization */}
                <div className="relative h-12 rounded-lg overflow-hidden mb-2">
                  <div className={cn(
                    'absolute inset-0 bg-gradient-to-br',
                    preset.preview.gradient
                  )} />
                  {/* Route line preview */}
                  <div className={cn(
                    'absolute top-1/2 left-2 right-2 h-1.5 rounded-full transform -translate-y-1/2',
                    preset.preview.accent
                  )}
                  style={{
                    clipPath: 'polygon(0% 50%, 15% 30%, 35% 70%, 55% 40%, 75% 60%, 100% 50%, 100% 100%, 0% 100%)',
                  }}
                  />
                </div>

                <div className={cn(
                  'text-xs font-semibold',
                  isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                )}>
                  {preset.name}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {preset.description}
                </div>

                {isActive && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" />
                )}
              </button>
            );
          })}
        </div>
      </ControlSection>

      <ControlSection title="Quick Settings">
        <div className="space-y-3">
          {/* Current colors display */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-[10px] uppercase text-gray-500 mb-1">Terrain</div>
              <div
                className="h-8 rounded-md border border-gray-200 dark:border-gray-700"
                style={{ backgroundColor: config.terrainColor }}
              />
            </div>
            <div className="flex-1">
              <div className="text-[10px] uppercase text-gray-500 mb-1">Route</div>
              <div
                className="h-8 rounded-md border border-gray-200 dark:border-gray-700"
                style={{ backgroundColor: config.routeColor }}
              />
            </div>
          </div>

          <div className="text-[10px] text-gray-500 text-center">
            Customize colors in the Sculpture tab
          </div>
        </div>
      </ControlSection>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-xs text-blue-800 dark:text-blue-200">
        <p className="font-medium mb-1">3D Sculpture Mode</p>
        <p className="opacity-90">
          Choose a style preset or fine-tune colors and settings in the Sculpture tab.
          Your route will be rendered as a 3D printable model.
        </p>
      </div>
    </div>
  );
}
