'use client';

import { EffectComposer, SSAO, SMAA, Bloom } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

interface PostProcessingProps {
  /** Enable SSAO (Screen Space Ambient Occlusion) for depth */
  enableSSAO?: boolean;
  /** Enable Bloom for subtle glow effects */
  enableBloom?: boolean;
  /** Enable SMAA anti-aliasing */
  enableSMAA?: boolean;
}

/**
 * SSAO effect component with conservative configuration
 * Uses NORMAL blend to avoid brightening/darkening issues
 */
function SSAOEffect() {
  return (
    <SSAO
      blendFunction={BlendFunction.NORMAL}
      samples={16}
      rings={4}
      radius={0.05}
      intensity={0.5}
      luminanceInfluence={0.6}
      worldDistanceThreshold={0.3}
      worldDistanceFalloff={0.1}
      worldProximityThreshold={0.3}
      worldProximityFalloff={0.1}
    />
  );
}

/**
 * Bloom effect component with very subtle configuration
 * Only affects extremely bright areas, very low intensity
 */
function BloomEffect() {
  return (
    <Bloom
      luminanceThreshold={0.98}
      luminanceSmoothing={0.01}
      intensity={0.05}
      mipmapBlur
    />
  );
}

/**
 * Post-processing effects for the sculpture preview.
 * Adds professional rendering effects:
 * - SSAO: Adds depth to crevices and edges
 * - Bloom: Subtle glow on bright areas (route highlights)
 * - SMAA: Anti-aliasing for smooth edges
 */
export function PostProcessing({
  enableSSAO = true,
  enableBloom = true,
  enableSMAA = true,
}: PostProcessingProps) {
  // If no effects are enabled, don't render the composer
  if (!enableSSAO && !enableBloom && !enableSMAA) {
    return null;
  }

  // Render different combinations based on what's enabled
  // This is needed because EffectComposer has strict typing
  if (enableSMAA && enableSSAO && enableBloom) {
    return (
      <EffectComposer multisampling={0}>
        <SMAA />
        <SSAOEffect />
        <BloomEffect />
      </EffectComposer>
    );
  }

  if (enableSMAA && enableSSAO) {
    return (
      <EffectComposer multisampling={0}>
        <SMAA />
        <SSAOEffect />
      </EffectComposer>
    );
  }

  if (enableSMAA && enableBloom) {
    return (
      <EffectComposer multisampling={0}>
        <SMAA />
        <BloomEffect />
      </EffectComposer>
    );
  }

  if (enableSSAO && enableBloom) {
    return (
      <EffectComposer multisampling={0}>
        <SSAOEffect />
        <BloomEffect />
      </EffectComposer>
    );
  }

  if (enableSMAA) {
    return (
      <EffectComposer multisampling={0}>
        <SMAA />
      </EffectComposer>
    );
  }

  if (enableSSAO) {
    return (
      <EffectComposer multisampling={0}>
        <SSAOEffect />
      </EffectComposer>
    );
  }

  if (enableBloom) {
    return (
      <EffectComposer multisampling={0}>
        <BloomEffect />
      </EffectComposer>
    );
  }

  return null;
}

export default PostProcessing;
