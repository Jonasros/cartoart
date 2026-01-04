'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import type { SculptureConfig } from '@/types/sculpture';

interface CircularBaseProps {
  config: SculptureConfig;
}

/**
 * Circular medallion base with raised rim.
 * Creates a coin-like platform for the terrain relief.
 */
export function CircularBase({ config }: CircularBaseProps) {
  const { size, baseHeight, rimHeight, terrainColor } = config;

  // Convert cm to scene units (10 cm = 1 unit, matching TerrainMesh scale)
  const sceneSize = size / 10;
  const radius = sceneSize / 2;
  const baseThickness = baseHeight / 100; // Convert mm to scene units
  const rimThickness = rimHeight / 100;
  const rimWidth = sceneSize * 0.03; // 3% of diameter for rim width

  // Create a slightly darker color for the rim
  const rimColor = useMemo(() => {
    const color = new THREE.Color(terrainColor);
    color.multiplyScalar(0.85);
    return color;
  }, [terrainColor]);

  return (
    <group>
      {/* Main base cylinder */}
      <mesh position={[0, -baseThickness / 2, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[radius, radius, baseThickness, 64]} />
        <meshStandardMaterial
          color={terrainColor}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Outer rim (torus ring around the edge) */}
      {rimThickness > 0 && (
        <mesh
          position={[0, rimThickness / 2, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          receiveShadow
          castShadow
        >
          <torusGeometry args={[radius - rimWidth / 2, rimWidth / 2, 16, 64]} />
          <meshStandardMaterial
            color={rimColor}
            roughness={0.6}
            metalness={0.15}
          />
        </mesh>
      )}

      {/* Inner flat surface ring (slightly recessed inside rim) */}
      {rimThickness > 0 && (
        <mesh
          position={[0, 0.001, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <ringGeometry args={[radius - rimWidth, radius, 64]} />
          <meshStandardMaterial
            color={terrainColor}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
      )}
    </group>
  );
}
