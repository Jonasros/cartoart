'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import type { SculptureConfig } from '@/types/sculpture';
import { getMaterialProperties, getRimMaterialProperties } from './materials';

interface RectangularBaseProps {
  config: SculptureConfig;
}

/**
 * Rectangular plaque base with raised border frame.
 * Creates a classic rectangular platform for the terrain relief.
 */
export function RectangularBase({ config }: RectangularBaseProps) {
  const { size, baseHeight, rimHeight, terrainColor, material } = config;

  // Convert cm to scene units (10 cm = 1 unit, matching TerrainMesh scale)
  const sceneSize = size / 10;
  const baseThickness = baseHeight / 100; // Convert mm to scene units
  const rimThickness = rimHeight / 100;
  const rimWidth = sceneSize * 0.04; // 4% of size for rim width

  // Create a slightly darker color for the rim
  const rimColor = useMemo(() => {
    const color = new THREE.Color(terrainColor);
    color.multiplyScalar(0.85);
    return color;
  }, [terrainColor]);

  // Get material properties based on selected material
  const materialProps = getMaterialProperties(material);
  const rimMaterialProps = getRimMaterialProperties(material);

  // Frame geometry using individual box segments
  const frameSegments = useMemo(() => {
    if (rimThickness <= 0) return [];

    const halfSize = sceneSize / 2;

    return [
      // Top edge
      { position: [0, rimThickness / 2, -halfSize + rimWidth / 2], size: [sceneSize, rimThickness, rimWidth] },
      // Bottom edge
      { position: [0, rimThickness / 2, halfSize - rimWidth / 2], size: [sceneSize, rimThickness, rimWidth] },
      // Left edge
      { position: [-halfSize + rimWidth / 2, rimThickness / 2, 0], size: [rimWidth, rimThickness, sceneSize - rimWidth * 2] },
      // Right edge
      { position: [halfSize - rimWidth / 2, rimThickness / 2, 0], size: [rimWidth, rimThickness, sceneSize - rimWidth * 2] },
    ];
  }, [sceneSize, rimThickness, rimWidth]);

  return (
    <group>
      {/* Main base box */}
      <mesh position={[0, -baseThickness / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[sceneSize, baseThickness, sceneSize]} />
        <meshPhysicalMaterial
          color={terrainColor}
          roughness={materialProps.roughness}
          metalness={materialProps.metalness}
          clearcoat={materialProps.clearcoat ?? 0}
          clearcoatRoughness={materialProps.clearcoatRoughness ?? 0}
          envMapIntensity={materialProps.envMapIntensity ?? 0.5}
        />
      </mesh>

      {/* Frame border segments */}
      {frameSegments.map((segment, index) => (
        <mesh
          key={index}
          position={segment.position as [number, number, number]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={segment.size as [number, number, number]} />
          <meshPhysicalMaterial
            color={rimColor}
            roughness={rimMaterialProps.roughness}
            metalness={rimMaterialProps.metalness}
            clearcoat={rimMaterialProps.clearcoat ?? 0}
            clearcoatRoughness={rimMaterialProps.clearcoatRoughness ?? 0}
            envMapIntensity={rimMaterialProps.envMapIntensity ?? 0.5}
          />
        </mesh>
      ))}
    </group>
  );
}
