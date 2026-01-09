'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useHelper } from '@react-three/drei';

interface StudioLightingProps {
  /** Intensity multiplier for all lights (default: 1.0) */
  intensity?: number;
  /** Whether to show light helpers for debugging (default: false) */
  showHelpers?: boolean;
  /** Preset lighting style (default: 'studio') */
  preset?: 'studio' | 'dramatic' | 'soft' | 'natural';
}

/**
 * Lighting presets for different moods
 */
const lightingPresets = {
  studio: {
    // Balanced professional product photography lighting - optimized for post-processing
    key: { intensity: 1.2, color: '#fff5e6', position: [4, 6, 3] as [number, number, number] },
    fill: { intensity: 0.35, color: '#e6f0ff', position: [-3, 3, 2] as [number, number, number] },
    rim: { intensity: 0.5, color: '#ffffff', position: [0, 2, -4] as [number, number, number] },
    ambient: { intensity: 0.1 },
  },
  dramatic: {
    // High contrast with strong shadows
    key: { intensity: 1.5, color: '#ffe4c4', position: [6, 10, 4] as [number, number, number] },
    fill: { intensity: 0.2, color: '#b0c4de', position: [-5, 3, 2] as [number, number, number] },
    rim: { intensity: 0.8, color: '#ffd700', position: [0, 4, -6] as [number, number, number] },
    ambient: { intensity: 0.1 },
  },
  soft: {
    // Gentle diffused lighting for subtle details
    key: { intensity: 0.8, color: '#ffffff', position: [4, 6, 4] as [number, number, number] },
    fill: { intensity: 0.5, color: '#f0f0ff', position: [-3, 5, 3] as [number, number, number] },
    rim: { intensity: 0.4, color: '#ffffff', position: [0, 4, -4] as [number, number, number] },
    ambient: { intensity: 0.35 },
  },
  natural: {
    // Simulated outdoor/window light
    key: { intensity: 1.0, color: '#fff8dc', position: [3, 10, 5] as [number, number, number] },
    fill: { intensity: 0.3, color: '#add8e6', position: [-4, 2, 1] as [number, number, number] },
    rim: { intensity: 0.5, color: '#fff8dc', position: [2, 5, -5] as [number, number, number] },
    ambient: { intensity: 0.25 },
  },
};

/**
 * Studio 3-Point Lighting Component
 *
 * Professional product photography lighting setup with:
 * - Key Light: Main source, warm, 45° front-right, casts shadows
 * - Fill Light: Softer, opposite side, cool tint, reduces harsh shadows
 * - Rim/Back Light: Edge definition, creates separation from background
 * - Ambient Fill: Subtle overall illumination to lift shadows
 *
 * This lighting setup creates professional product-photo quality renders
 * without the auto-lighting of the Stage component.
 */
export function StudioLighting({
  intensity = 1.0,
  showHelpers = false,
  preset = 'studio',
}: StudioLightingProps) {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const fillLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);

  // Get lighting configuration for the selected preset
  const config = lightingPresets[preset];

  // Optional light helpers for debugging (only in development)
  // Note: useHelper can cause issues in production, so it's conditional
  if (showHelpers && process.env.NODE_ENV === 'development') {
    // Light helpers would be added here in development
    // useHelper(keyLightRef, THREE.DirectionalLightHelper, 1, '#ffff00');
  }

  return (
    <group name="studio-lighting">
      {/* Key Light - Main source, warm, casts shadows */}
      <directionalLight
        ref={keyLightRef}
        position={config.key.position}
        intensity={config.key.intensity * intensity}
        color={config.key.color}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />

      {/* Fill Light - Softer, opposite side, cool tint */}
      <directionalLight
        ref={fillLightRef}
        position={config.fill.position}
        intensity={config.fill.intensity * intensity}
        color={config.fill.color}
      />

      {/* Rim/Back Light - Edge definition */}
      <directionalLight
        ref={rimLightRef}
        position={config.rim.position}
        intensity={config.rim.intensity * intensity}
        color={config.rim.color}
      />

      {/* Ambient Fill - Subtle overall illumination */}
      <ambientLight intensity={config.ambient.intensity * intensity} />
    </group>
  );
}

/**
 * Contact Shadow component for grounding the sculpture
 * This creates soft shadows beneath the object for a more realistic look.
 */
export function GroundShadow({
  opacity = 0.5,
  scale = 3,
  blur = 2.5,
}: {
  opacity?: number;
  scale?: number;
  blur?: number;
}) {
  // Import ContactShadows from drei when needed
  // For now, we'll use the Stage's built-in contact shadows
  // This component is a placeholder for custom shadow implementation
  return null;
}

export default StudioLighting;
