'use client';

import { useMemo, useCallback, useState } from 'react';
import { usePosterConfig } from '@/hooks/usePosterConfig';
import { useMapExport } from '@/hooks/useMapExport';
import { Maximize, Plus, Minus, Map as MapIcon, Palette, Type, Layers, Layout } from 'lucide-react';
import { MapPreview } from '@/components/map/MapPreview';
import { TextOverlay } from '@/components/map/TextOverlay';
import { LocationSearch } from '@/components/controls/LocationSearch';
import { StyleSelector } from '@/components/controls/StyleSelector';
import { ColorControls } from '@/components/controls/ColorControls';
import { TypographyControls } from '@/components/controls/TypographyControls';
import { LayerControls } from '@/components/controls/LayerControls';
import { FormatControls } from '@/components/controls/FormatControls';
import { ExportButton } from '@/components/controls/ExportButton';
import { applyPaletteToStyle } from '@/lib/styles/applyPalette';
import { throttle, cn } from '@/lib/utils';
import type MapLibreGL from 'maplibre-gl';
import type { PosterConfig } from '@/types/poster';

type Tab = 'location' | 'style' | 'text' | 'layers' | 'layout';

export function PosterEditor() {
  const [activeTab, setActiveTab] = useState<Tab>('location');
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { 
    config, 
    updateLocation, 
    updateStyle, 
    updatePalette, 
    updateTypography,
    updateFormat,
    updateLayers 
  } = usePosterConfig();
  const { isExporting, exportToPNG, setMapRef, fitToLocation, zoomIn, zoomOut } = useMapExport(config);

  const numericRatio = useMemo(() => {
    const { aspectRatio, orientation } = config.format;
    const ratios: Record<string, number> = {
      '2:3': 2/3,
      '3:4': 3/4,
      '4:5': 4/5,
      '1:1': 1,
      'ISO': 1/Math.sqrt(2)
    };
    const base = ratios[aspectRatio];
    return orientation === 'portrait' ? base : 1/base;
  }, [config.format.aspectRatio, config.format.orientation]);

  // Apply palette colors and visibility to the current map style
  const mapStyle = useMemo(() => {
    return applyPaletteToStyle(
      config.style.mapStyle, 
      config.palette, 
      config.layers, 
      config.style.layerToggles
    );
  }, [config.style.mapStyle, config.palette, config.layers, config.style.layerToggles]);

  const handleMapLoad = (map: MapLibreGL.Map) => {
    setMapRef(map);
  };

  // Throttle the location update to prevent excessive style re-renders
  const throttledUpdateLocation = useMemo(
    () => throttle((center: [number, number], zoom: number) => {
      updateLocation({ center, zoom });
    }, 60),
    [updateLocation]
  );

  const handleMapMove = useCallback((center: [number, number], zoom: number) => {
    throttledUpdateLocation(center, zoom);
  }, [throttledUpdateLocation]);

  // Helper function to convert aspect ratio string to CSS value
  function getAspectRatioCSS(aspectRatio: PosterConfig['format']['aspectRatio'], orientation: 'portrait' | 'landscape'): string {
    const ratios: Record<string, { portrait: string; landscape: string }> = {
      '2:3': { portrait: '2/3', landscape: '3/2' },
      '3:4': { portrait: '3/4', landscape: '4/3' },
      '4:5': { portrait: '4/5', landscape: '5/4' },
      '1:1': { portrait: '1/1', landscape: '1/1' },
      'ISO': { portrait: '1/1.414', landscape: '1.414/1' }, // ISO ratio is 1:√2
    };
    
    return ratios[aspectRatio][orientation];
  }

  const TabButton = ({ id, icon: Icon, label }: { id: Tab, icon: any, label: string }) => (
    <button
      onClick={() => {
        if (activeTab === id && isDrawerOpen) {
          setIsDrawerOpen(false);
        } else {
          setActiveTab(id);
          setIsDrawerOpen(true);
        }
      }}
      className={cn(
        "flex-1 md:w-full flex flex-col items-center justify-center py-2 md:py-4 px-2 space-y-1 transition-colors relative",
        activeTab === id && isDrawerOpen
          ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" 
          : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
      title={label}
    >
      <Icon className="w-5 h-5 md:w-6 md:h-6" />
      <span className="text-[10px] font-medium hidden md:block">{label}</span>
      {activeTab === id && isDrawerOpen && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-400 hidden md:block" />
          <div className="absolute left-0 right-0 top-0 h-1 bg-blue-600 dark:bg-blue-400 md:hidden" />
        </>
      )}
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg" />
          <span className="font-bold text-gray-900 dark:text-white">CartoArt</span>
        </div>
        <ExportButton onExport={exportToPNG} isExporting={isExporting} />
      </div>

      {/* Icon Rail / Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 md:relative md:h-full md:w-20 bg-white dark:bg-gray-800 border-t md:border-t-0 md:border-r border-gray-200 dark:border-gray-700 flex md:flex-col items-center z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:shadow-sm pb-safe md:pb-0">
        <div className="hidden md:flex h-16 items-center justify-center w-full border-b border-gray-100 dark:border-gray-700 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg" />
        </div>
        
        <div className="flex md:flex-col flex-1 md:flex-none md:w-full md:space-y-1">
          <TabButton id="location" icon={MapIcon} label="Location" />
          <TabButton id="style" icon={Palette} label="Style" />
          <TabButton id="text" icon={Type} label="Text" />
          <TabButton id="layers" icon={Layers} label="Layers" />
          <TabButton id="layout" icon={Layout} label="Layout" />
        </div>
      </nav>

      {/* Control Panel Drawer */}
      <aside className={cn(
        "fixed inset-x-0 bottom-16 md:relative md:bottom-auto md:w-80 bg-white dark:bg-gray-800 border-t md:border-t-0 md:border-r border-gray-200 dark:border-gray-700 overflow-y-auto flex flex-col z-30 transition-all duration-300 ease-in-out shadow-2xl md:shadow-none",
        isDrawerOpen ? "h-[50vh] md:h-full translate-y-0" : "h-0 md:h-full translate-y-full md:translate-y-0"
      )}>
        <div className="p-4 md:p-6 space-y-6">
          <div className="flex items-center justify-between md:hidden mb-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">{activeTab}</h2>
            <button 
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>
          {activeTab === 'location' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Location & Map</h2>
              <LocationSearch
                onLocationSelect={updateLocation}
                currentLocation={config.location}
              />
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                <p>Tip: Drag the map to fine-tune the position.</p>
              </div>
            </div>
          )}

          {activeTab === 'style' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Style & Colors</h2>
              <StyleSelector
                selectedStyleId={config.style.id}
                onStyleSelect={updateStyle}
              />
              <ColorControls
                palette={config.palette}
                presets={config.style.palettes}
                onPaletteChange={updatePalette}
              />
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Typography</h2>
              <TypographyControls
                config={config}
                onTypographyChange={updateTypography}
                onLocationChange={updateLocation}
              />
            </div>
          )}

          {activeTab === 'layers' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Map Layers</h2>
              <LayerControls
                layers={config.layers}
                onLayersChange={updateLayers}
                availableToggles={config.style.layerToggles}
              />
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Format & Layout</h2>
              <FormatControls
                format={config.format}
                onFormatChange={updateFormat}
              />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className="flex-1 relative bg-gray-100 dark:bg-gray-950 bg-grid-pattern flex flex-col overflow-hidden pb-16 md:pb-0"
        style={{ containerType: 'size' }}
      >
        {/* Top Actions Overlay - Desktop Only */}
        <div className="absolute top-6 right-8 z-50 pointer-events-auto hidden md:block">
          <ExportButton onExport={exportToPNG} isExporting={isExporting} />
        </div>

        {/* Map Canvas */}
        <div className="flex-1 relative flex items-center justify-center p-4 md:p-8">
          <div 
            className="relative shadow-2xl bg-white flex flex-col transition-all duration-300 ease-in-out ring-1 ring-black/5"
            style={{ 
              aspectRatio: getAspectRatioCSS(config.format.aspectRatio, config.format.orientation),
              backgroundColor: config.palette.background,
              width: `min(calc(100% - 2rem), calc((100cqh - 2rem) * ${numericRatio}))`,
              height: 'auto',
              maxHeight: 'calc(100cqh - 2rem)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              containerType: 'size',
            }}
          >
            {/* The Map Window */}
            <div 
              className="absolute overflow-hidden min-h-0 min-w-0"
              style={{
                top: `${config.format.margin}cqw`,
                left: `${config.format.margin}cqw`,
                right: `${config.format.margin}cqw`,
                bottom: `${config.format.margin}cqw`,
              }}
            >
              <MapPreview
                mapStyle={mapStyle}
                location={config.location}
                format={config.format}
                showMarker={config.layers.marker}
                markerColor={config.palette.primary}
                onMapLoad={handleMapLoad}
                onMove={handleMapMove}
                layers={config.layers}
                layerToggles={config.style.layerToggles}
              />
              
              {/* Floating Map Controls */}
              <div className="absolute bottom-4 right-4 flex flex-row gap-2 z-10">
                <button
                  onClick={zoomOut}
                  className="p-2 bg-white/90 hover:bg-white border border-gray-200 rounded-md shadow-sm transition-colors text-gray-600 hover:text-blue-600 pointer-events-auto"
                  title="Zoom Out"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  onClick={zoomIn}
                  className="p-2 bg-white/90 hover:bg-white border border-gray-200 rounded-md shadow-sm transition-colors text-gray-600 hover:text-blue-600 pointer-events-auto"
                  title="Zoom In"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={fitToLocation}
                  className="p-2 bg-white/90 hover:bg-white border border-gray-200 rounded-md shadow-sm transition-colors text-gray-600 hover:text-blue-600 pointer-events-auto"
                  title="Snap map to original bounds"
                >
                  <Maximize className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Text Overlay */}
            <TextOverlay config={config} />

            {/* Border Overlay - Now drawn AFTER TextOverlay to stay on top of gradients */}
            {config.format.borderStyle !== 'none' && (
              <div 
                className="absolute pointer-events-none z-30"
                style={{
                  top: `${config.format.margin}cqw`,
                  left: `${config.format.margin}cqw`,
                  right: `${config.format.margin}cqw`,
                  bottom: `${config.format.margin}cqw`,
                  padding: config.format.borderStyle === 'inset' ? '2cqw' : '0',
                }}
              >
                <div 
                  className="w-full h-full"
                  style={{
                    border: `${
                      config.format.borderStyle === 'thick' ? '1.5cqw' : '0.5cqw'
                    } solid ${config.palette.accent || config.palette.text}`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

