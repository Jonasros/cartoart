'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Grid } from '@react-three/drei';
import type { RouteData } from '@/types/poster';
import type { SculptureConfig } from '@/types/sculpture';
import { TerrainMesh } from './TerrainMesh';
import { RouteMesh, RouteStartMarker, RouteEndMarker } from './RouteMesh';
import { CircularBase } from './CircularBase';
import { RectangularBase } from './RectangularBase';
import { useElevationGrid } from '@/hooks/useElevationGrid';

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
 * The actual sculpture scene with terrain and route
 */
function SculptureScene({
  routeData,
  config,
}: {
  routeData: RouteData;
  config: SculptureConfig;
}) {
  // Generate elevation grid from route data
  const { grid: elevationGrid } = useElevationGrid(routeData, config.terrainResolution);

  return (
    <group>
      {/* Base platform (circular or rectangular) */}
      <BasePlatform config={config} />

      {/* Terrain mesh with height displacement */}
      <TerrainMesh
        routeData={routeData}
        config={config}
        elevationGrid={elevationGrid ?? undefined}
      />

      {/* Route tube following the trail path */}
      <RouteMesh routeData={routeData} config={config} />

      {/* Start/End markers */}
      <RouteStartMarker routeData={routeData} config={config} />
      <RouteEndMarker routeData={routeData} config={config} />
    </group>
  );
}

/**
 * 3D Sculpture Preview using React Three Fiber.
 * Displays terrain mesh with height mapping and route tube.
 *
 * Phase 4.1: Basic preview with terrain and route meshes.
 * Phase 4.2+: Will add materials, base platforms, and STL export.
 */
export function SculpturePreview({ routeData, config }: SculpturePreviewProps) {
  return (
    <div className="w-full h-full bg-neutral-900 rounded-lg overflow-hidden relative">
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
        camera={{ position: [10, 8, 10], fov: 50 }}
        shadows
        dpr={[1, 2]}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Stage
            environment="city"
            intensity={0.5}
            shadows={{ type: 'contact', opacity: 0.4, blur: 2 }}
          >
            {routeData ? (
              <SculptureScene routeData={routeData} config={config} />
            ) : (
              <EmptyState />
            )}
          </Stage>
        </Suspense>

        {/* Camera controls */}
        <OrbitControls
          makeDefault
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={30}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
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
