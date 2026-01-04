'use client';

import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { SculptureConfig } from '@/types/sculpture';

interface TextMeshProps {
  config: SculptureConfig;
}

/**
 * Text mesh positioned on the front face of the base.
 * For rectangular: on the front vertical face
 * For circular: on the front curved surface
 */
export function SimpleTextMesh({ config }: TextMeshProps) {
  if (!config.text.enabled) return null;

  // Convert cm to scene units (10cm = 1 scene unit)
  const sceneSize = config.size / 10;
  const baseThickness = config.baseHeight / 100;
  const radius = sceneSize / 2;

  // Text sizing relative to base - smaller to fit on base face
  const titleSize = baseThickness * 0.35;
  const subtitleSize = baseThickness * 0.22;

  // Vertical center of the base front face
  const textY = -baseThickness / 2;

  // Position just in front of the base surface (small offset to prevent z-fighting)
  const textZ = radius + 0.002;

  // Calculate text color based on terrain color (use contrasting color)
  const terrainColor = new THREE.Color(config.terrainColor);
  const luminance = terrainColor.r * 0.299 + terrainColor.g * 0.587 + terrainColor.b * 0.114;
  const textColor = luminance > 0.5 ? '#1a1a1a' : '#f5f5f5';

  return (
    <group position={[0, textY, textZ]}>
      {/* Title - positioned upper part of base face */}
      {config.text.title && (
        <Text
          position={[0, baseThickness * 0.15, 0]}
          fontSize={titleSize}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          maxWidth={sceneSize * 0.9}
          textAlign="center"
          letterSpacing={0.03}
        >
          {config.text.title.toUpperCase()}
        </Text>
      )}

      {/* Subtitle - positioned lower part of base face */}
      {config.text.subtitle && (
        <Text
          position={[0, -baseThickness * 0.15, 0]}
          fontSize={subtitleSize}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          maxWidth={sceneSize * 0.9}
          textAlign="center"
          letterSpacing={0.01}
        >
          {config.text.subtitle}
        </Text>
      )}
    </group>
  );
}
