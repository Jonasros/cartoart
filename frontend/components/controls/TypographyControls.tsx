'use client';

import { useMemo } from 'react';
import type { PosterConfig } from '@/types/poster';
import { ControlSection, ControlSlider, ControlInput, ControlSelect, ControlLabel, ControlCheckbox, ControlGroup } from '@/components/ui/control-components';
import { getMaxTitleSize, getMaxSubtitleSize } from '@/lib/utils/layoutLimits';
import { LAYOUT } from '@/lib/constants/limits';

interface TypographyControlsProps {
  config: PosterConfig;
  onTypographyChange: (typography: Partial<PosterConfig['typography']>) => void;
  onLocationChange: (location: Partial<PosterConfig['location']>) => void;
}

export function TypographyControls({ config, onTypographyChange, onLocationChange }: TypographyControlsProps) {
  const { typography, style } = config;
  const hasRoute = config.route?.data != null;

  // Calculate dynamic max values based on current layout
  const maxTitleSize = useMemo(() => getMaxTitleSize(config), [config]);
  const maxSubtitleSize = useMemo(() => getMaxSubtitleSize(config), [config]);

  // Use recommended fonts from the style or a general list
  const availableFonts = [
    ...new Set([
      ...style.recommendedFonts,
      'Inter', 'Montserrat', 'Poppins', 'Playfair Display', 'Crimson Text', 'JetBrains Mono'
    ])
  ];

  return (
    <div className="space-y-6">
      <ControlSection title="Content">
        <ControlGroup>
          <div className="space-y-3">
            <div>
              <ControlLabel>Title</ControlLabel>
              <ControlInput
                type="text"
                value={config.location.name}
                onChange={(e) => onLocationChange({ name: e.target.value })}
                placeholder="WHERE WE MET"
              />
            </div>
            <div>
              <ControlLabel>Subtitle</ControlLabel>
              <ControlInput
                type="text"
                value={config.location.city || ''}
                onChange={(e) => onLocationChange({ city: e.target.value })}
                placeholder="SUBTITLE"
              />
            </div>
          </div>
        </ControlGroup>
      </ControlSection>

      <ControlSection title="Appearance">
        <div className="space-y-4">
          <div>
            <ControlLabel>Font Family</ControlLabel>
            <ControlSelect
              value={typography.titleFont}
              onChange={(e) => onTypographyChange({ 
                titleFont: e.target.value,
                subtitleFont: e.target.value
              })}
            >
              {availableFonts.map((font) => (
                <option key={font} value={font}>{font}</option>
              ))}
            </ControlSelect>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <ControlLabel className="mb-0">Title Size</ControlLabel>
                <span className="text-xs font-mono text-gray-500">
                  {typography.titleSize.toFixed(1)} / {maxTitleSize.toFixed(1)}
                </span>
              </div>
              <ControlSlider
                min={String(LAYOUT.TITLE_SIZE_MIN)}
                max={String(maxTitleSize)}
                step="0.1"
                value={Math.min(typography.titleSize, maxTitleSize)}
                onChange={(e) => onTypographyChange({ titleSize: parseFloat(e.target.value) })}
              />
              {typography.titleSize >= maxTitleSize * 0.95 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                  Near limit for current layout
                </p>
              )}
            </div>

            <div>
              <ControlLabel>Title Weight</ControlLabel>
              <ControlSlider
                min="100"
                max="900"
                step="100"
                value={typography.titleWeight}
                onChange={(e) => onTypographyChange({ titleWeight: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <ControlLabel>Letter Spacing</ControlLabel>
              <ControlSlider
                min="-0.1"
                max="0.5"
                step="0.01"
                value={typography.titleLetterSpacing || 0}
                onChange={(e) => onTypographyChange({ titleLetterSpacing: parseFloat(e.target.value) })}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <ControlLabel className="mb-0">Subtitle Size</ControlLabel>
                <span className="text-xs font-mono text-gray-500">
                  {typography.subtitleSize.toFixed(1)} / {maxSubtitleSize.toFixed(1)}
                </span>
              </div>
              <ControlSlider
                min={String(LAYOUT.SUBTITLE_SIZE_MIN)}
                max={String(maxSubtitleSize)}
                step="0.1"
                value={Math.min(typography.subtitleSize, maxSubtitleSize)}
                onChange={(e) => onTypographyChange({ subtitleSize: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </div>
      </ControlSection>

      <ControlSection title="Readability">
        <div className="space-y-4">
          <div>
            <ControlLabel>Backdrop Style</ControlLabel>
            <ControlSelect
              value={typography.textBackdrop || 'subtle'}
              onChange={(e) => onTypographyChange({ textBackdrop: e.target.value as any })}
            >
              <option value="none">None</option>
              <option value="subtle">Subtle</option>
              <option value="strong">Strong</option>
              <option value="gradient">Full Gradient</option>
            </ControlSelect>
          </div>

          {typography.textBackdrop !== 'none' && (
            <div className="space-y-4 pt-2">
              <div>
                <ControlLabel>Backdrop Height</ControlLabel>
                <ControlSlider
                  min="10"
                  max="100"
                  step="1"
                  value={typography.backdropHeight ?? 35}
                  onChange={(e) => onTypographyChange({ backdropHeight: parseInt(e.target.value) })}
                  displayValue={`${typography.backdropHeight ?? 35}%`}
                />
              </div>
              
              {typography.textBackdrop === 'gradient' && (
                <div>
                  <ControlLabel>Gradient Sharpness</ControlLabel>
                  <ControlSlider
                    min="0"
                    max="100"
                    step="1"
                    value={typography.backdropSharpness ?? 50}
                    onChange={(e) => onTypographyChange({ backdropSharpness: parseInt(e.target.value) })}
                    displayValue={typography.backdropSharpness === 0 ? 'Soft' : typography.backdropSharpness === 100 ? 'Abrupt' : `${typography.backdropSharpness}%`}
                  />
                </div>
              )}

              <div>
                <ControlLabel>Backdrop Opacity</ControlLabel>
                <ControlSlider
                  min="0"
                  max="1"
                  step="0.01"
                  value={typography.backdropAlpha ?? 1.0}
                  onChange={(e) => onTypographyChange({ backdropAlpha: parseFloat(e.target.value) })}
                  displayValue={`${Math.round((typography.backdropAlpha ?? 1.0) * 100)}%`}
                />
              </div>
            </div>
          )}
        </div>
      </ControlSection>

      <ControlSection title="Options">
        <div className="space-y-2">
          <ControlCheckbox
            label="Show Title"
            checked={typography.showTitle !== false}
            onChange={(e) => onTypographyChange({ showTitle: e.target.checked })}
          />
          <ControlCheckbox
            label="Show Subtitle"
            checked={typography.showSubtitle !== false}
            onChange={(e) => onTypographyChange({ showSubtitle: e.target.checked })}
          />
          <ControlCheckbox
            label="ALL CAPS"
            checked={Boolean(typography.titleAllCaps)}
            onChange={(e) => onTypographyChange({ titleAllCaps: e.target.checked })}
          />
          <ControlCheckbox
            label={hasRoute ? "Show Stats" : "Show Coordinates"}
            checked={typography.showCoordinates !== false}
            onChange={(e) => onTypographyChange({ showCoordinates: e.target.checked })}
          />
        </div>
      </ControlSection>
    </div>
  );
}

