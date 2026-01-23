'use client';

import { Suspense, useMemo, useRef, useImperativeHandle, forwardRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, Grid, Environment, ContactShadows } from '@react-three/drei';
import type { RouteData } from '@/types/poster';
import type { SculptureConfig } from '@/types/sculpture';
import { TerrainMesh } from './TerrainMesh';
import { RouteMesh } from './RouteMesh';
import { CircularBase } from './CircularBase';
import { RectangularBase } from './RectangularBase';
import { SimpleTextMesh } from './TextMesh';
import { useElevationGrid } from '@/hooks/useElevationGrid';
import { StudioLighting } from './StudioLighting';
import { PostProcessing } from './PostProcessing';
import { cleanupMaterialTextures } from './materials';

/**
 * Ref handle for SculpturePreview, exposing capture functionality
 */
export interface SculpturePreviewHandle {
  captureCanvas: () => HTMLCanvasElement | null;
}

/**
 * Calculate the rotation angle needed to orient the route start point to the front.
 * Returns the angle in radians to rotate around the Y axis.
 */
function calculateStartRotation(routeData: RouteData, meshSize: number): number {
  const { points, bounds } = routeData;
  if (points.length === 0) return 0;

  const [[minLng, minLat], [maxLng, maxLat]] = bounds;
  const lngRange = maxLng - minLng || 0.001;
  const latRange = maxLat - minLat || 0.001;

  // Get normalized position of start point
  const startPoint = points[0];
  const normalizedX = (startPoint.lng - minLng) / lngRange;
  const normalizedZ = (startPoint.lat - minLat) / latRange;

  // Convert to mesh coordinates
  const x = (normalizedX - 0.5) * meshSize;
  const z = (normalizedZ - 0.5) * meshSize;

  // Calculate angle from center to start point
  // We want the start to be at positive Z (front), so we calculate angle and rotate
  const currentAngle = Math.atan2(x, z); // Angle from +Z axis

  // Return negative angle to rotate start to front
  return -currentAngle;
}

interface SculpturePreviewProps {
  routeData: RouteData | null;
  config: SculptureConfig;
}

/**
 * Placeholder mesh shown when no route is loaded
 */
function PlaceholderMesh() {
  return (
    <mesh>
      <boxGeometry args={[2, 0.5, 2]} />
      <meshStandardMaterial color="#6b7280" opacity={0.5} transparent />
    </mesh>
  );
}

/**
 * Empty state component shown when no route is loaded
 */
function EmptyState() {
  return (
    <group>
      <PlaceholderMesh />
    </group>
  );
}

/**
 * Loading fallback for Suspense
 */
function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#3b82f6" wireframe />
    </mesh>
  );
}

/**
 * Base platform component - renders circular or rectangular base
 */
function BasePlatform({ config }: { config: SculptureConfig }) {
  if (!config.showBase) return null;

  if (config.shape === 'circular') {
    return <CircularBase config={config} />;
  }
  return <RectangularBase config={config} />;
}

/**
 * Snap an angle (in radians) to the nearest 90° (0, 90, 180, 270)
 */
function snapTo90Degrees(angleRad: number): number {
  // Convert to degrees
  const angleDeg = (angleRad * 180) / Math.PI;
  // Normalize to 0-360 range
  const normalized = ((angleDeg % 360) + 360) % 360;
  // Find nearest 90° angle
  const snapped = Math.round(normalized / 90) * 90;
  // Convert back to radians
  return (snapped * Math.PI) / 180;
}

/**
 * The actual sculpture scene with terrain and route
 * The terrain + route + markers are rotated together so the start point faces front,
 * while the base and text stay fixed.
 */
function SculptureScene({
  routeData,
  config,
}: {
  routeData: RouteData;
  config: SculptureConfig;
}) {
  // Generate elevation grid from route data (supports route-based or terrain-rgb mode)
  const { grid: elevationGrid } = useElevationGrid(
    routeData,
    config.terrainResolution,
    config.terrainMode
  );

  // Calculate rotation to orient route start to front
  // If terrainRotation is -1 (auto), calculate based on start point position
  // For rectangular shapes, snap to nearest 90° to stay in bounds
  // Otherwise use the manual rotation value (in degrees, convert to radians)
  const meshSize = config.size / 10;
  const terrainRotation = config.terrainRotation ?? -1;
  const startRotation = useMemo(() => {
    if (terrainRotation === -1) {
      // Auto mode: calculate rotation to orient start point to front
      const autoRotation = calculateStartRotation(routeData, meshSize);
      // For rectangular shapes, snap to nearest 90° to prevent out-of-bounds
      if (config.shape === 'rectangular') {
        return snapTo90Degrees(autoRotation);
      }
      return autoRotation;
    }
    // Manual mode: convert degrees to radians
    return (terrainRotation * Math.PI) / 180;
  }, [routeData, meshSize, terrainRotation, config.shape]);

  return (
    <group>
      {/* Base platform (circular or rectangular) - stays fixed */}
      <BasePlatform config={config} />

      {/* Rotated group: terrain + route + markers rotate together so start faces front */}
      <group rotation={[0, startRotation, 0]}>
        {/* Terrain mesh with height displacement */}
        <TerrainMesh
          routeData={routeData}
          config={config}
          elevationGrid={elevationGrid ?? undefined}
        />

        {/* Route following the trail path - uses GPS elevation to match terrain clearance */}
        <RouteMesh routeData={routeData} config={config} />
      </group>

      {/* Engraved text on base - stays fixed at front */}
      <SimpleTextMesh config={config} />
    </group>
  );
}

/**
 * Turntable wrapper for auto-rotation animation.
 * Rotates children around Y axis at specified speed.
 */
function TurntableWrapper({
  children,
  enabled,
  speed = 0.3,
}: {
  children: React.ReactNode;
  enabled: boolean;
  speed?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (enabled && groupRef.current) {
      // Speed is rotations per 10 seconds, so convert to radians per frame
      // Full rotation = 2π radians, speed=0.3 means 0.3 rotations per 10s
      const rotationPerSecond = (speed * Math.PI * 2) / 10;
      groupRef.current.rotation.y += rotationPerSecond * delta;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

/**
 * 3D Sculpture Preview using React Three Fiber.
 * Displays terrain mesh with height mapping and route tube.
 *
 * Phase 4.1: Basic preview with terrain and route meshes.
 * Phase 4.2+: Will add materials, base platforms, and STL export.
 *
 * Exposes captureCanvas method via ref for thumbnail generation.
 */
export const SculpturePreview = forwardRef<SculpturePreviewHandle, SculpturePreviewProps>(
  function SculpturePreview({ routeData, config }, ref) {
    const canvasContainerRef = useRef<HTMLDivElement>(null);

    // Cleanup material textures when component unmounts
    useEffect(() => {
      return () => {
        cleanupMaterialTextures();
      };
    }, []);

    // Expose capture method via ref
    const captureCanvas = useCallback((): HTMLCanvasElement | null => {
      if (!canvasContainerRef.current) return null;
      const canvas = canvasContainerRef.current.querySelector('canvas');
      return canvas || null;
    }, []);

    useImperativeHandle(ref, () => ({
      captureCanvas,
    }), [captureCanvas]);

    // Visual enhancement settings
    // Future: These could be configurable via config.visualEnhancements
    const useEnhancedLighting = true;
    const environmentPreset = 'studio';
    const lightingPreset = 'studio';

    // Calculate mesh size for contact shadows positioning
    const meshSize = config.size / 10;
    const baseHeight = config.rimHeight > 0 ? config.rimHeight / 10 : 0.05;

    return (
      <div ref={canvasContainerRef} className="w-full h-full bg-neutral-900 rounded-lg overflow-hidden relative">
        {/* Empty state overlay */}
        {!routeData && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
              <p className="text-white/80 text-sm font-medium">Upload a GPX route</p>
              <p className="text-white/50 text-xs mt-1">to preview your 3D sculpture</p>
            </div>
          </div>
        )}

        <Canvas
          camera={{ position: [3.5, 0.8, 3.5], fov: 45 }}
          shadows
          dpr={[1, 2]}
          gl={{ preserveDrawingBuffer: true }}
        >
          <Suspense fallback={<LoadingFallback />}>
            {useEnhancedLighting ? (
              // Enhanced lighting mode: Studio 3-point lighting + HDRI environment
              <>
                {/* HDRI Environment for realistic reflections - significantly reduced */}
                <Environment
                  preset={environmentPreset}
                  background={false}
                  environmentIntensity={0.3}
                />

                {/* Professional 3-point studio lighting */}
                <StudioLighting
                  intensity={1.0}
                  preset={lightingPreset}
                />

                {/* Contact shadows for grounding */}
                <ContactShadows
                  position={[0, -baseHeight / 2, 0]}
                  opacity={0.65}
                  scale={meshSize * 2.5}
                  blur={2}
                  far={meshSize * 2}
                  resolution={512}
                  color="#000000"
                />

                {/* Sculpture scene with optional turntable animation */}
                <TurntableWrapper
                  enabled={config.turntableEnabled ?? false}
                  speed={config.turntableSpeed ?? 0.3}
                >
                  {routeData ? (
                    <SculptureScene routeData={routeData} config={config} />
                  ) : (
                    <EmptyState />
                  )}
                </TurntableWrapper>
              </>
            ) : (
              // Legacy mode: Use Stage component's auto-lighting
              <Stage
                adjustCamera={false}
                environment="city"
                intensity={0.5}
                shadows={{ type: 'contact', opacity: 0.4, blur: 2 }}
              >
                <TurntableWrapper
                  enabled={config.turntableEnabled ?? false}
                  speed={config.turntableSpeed ?? 0.3}
                >
                  {routeData ? (
                    <SculptureScene routeData={routeData} config={config} />
                  ) : (
                    <EmptyState />
                  )}
                </TurntableWrapper>
              </Stage>
            )}
          </Suspense>

          {/* Post-processing effects - SMAA only for anti-aliasing */}
          <PostProcessing
            enableSSAO={false}
            enableBloom={false}
            enableSMAA={true}
          />

          {/* Camera controls - target center of sculpture, frontal view */}
          <OrbitControls
            makeDefault
            target={[0, 0, 0]}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={8}
            minPolarAngle={Math.PI / 12}
            maxPolarAngle={Math.PI / 1.8}
          />

          {/* Reference grid */}
          <Grid
            infiniteGrid
            fadeDistance={25}
            fadeStrength={1}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#404040"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#606060"
          />
        </Canvas>
      </div>
    );
  }
);
