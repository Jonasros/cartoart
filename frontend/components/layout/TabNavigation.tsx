'use client';

import { Map as MapIcon, Type, Layout, Sparkles, Palette, User, Compass, Box } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ModeToggle } from '@/components/controls/ModeToggle';
import type { ProductMode } from '@/types/sculpture';

export type Tab = 'library' | 'location' | 'style' | 'text' | 'frame' | 'sculpture' | 'account';

// Tabs available for each mode
const posterTabs: Tab[] = ['library', 'location', 'style', 'text', 'frame'];
const sculptureTabs: Tab[] = ['library', 'location', 'style', 'sculpture'];

interface TabNavigationProps {
  activeTab: Tab;
  isDrawerOpen: boolean;
  onTabChange: (tab: Tab) => void;
  onToggleDrawer: (open: boolean) => void;
  onOpenExplore?: () => void;
  productMode: ProductMode;
  onModeChange: (mode: ProductMode) => void;
  hasRoute: boolean;
}

export function TabNavigation({
  activeTab,
  isDrawerOpen,
  onTabChange,
  onToggleDrawer,
  onOpenExplore,
  productMode,
  onModeChange,
  hasRoute,
}: TabNavigationProps) {
  // Get tabs based on current mode
  const currentTabs = productMode === 'poster' ? posterTabs : sculptureTabs;

  const handleTabClick = (id: Tab) => {
    if (activeTab === id && isDrawerOpen) {
      onToggleDrawer(false);
    } else {
      onTabChange(id);
      onToggleDrawer(true);
    }
  };

  // When mode changes, reset to first appropriate tab if current tab isn't available
  const handleModeChange = (mode: ProductMode) => {
    onModeChange(mode);
    const newTabs = mode === 'poster' ? posterTabs : sculptureTabs;
    if (!newTabs.includes(activeTab) && activeTab !== 'account') {
      onTabChange(newTabs[1]); // Default to 'location' tab
    }
  };

  const TabButton = ({ id, icon: Icon, label }: { id: Tab, icon: any, label: string }) => (
    <button
      onClick={() => handleTabClick(id)}
      className={cn(
        "flex-1 md:w-full flex flex-col items-center justify-center py-2.5 md:py-5 px-3 space-y-1.5 transition-colors relative",
        activeTab === id && isDrawerOpen
          ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" 
          : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
      title={label}
    >
      <Icon className="w-5 h-5 md:w-6 md:h-6" />
      <span className="text-[11px] font-medium hidden md:block">{label}</span>
      {activeTab === id && isDrawerOpen && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-400 hidden md:block" />
          <div className="absolute left-0 right-0 top-0 h-1 bg-blue-600 dark:bg-blue-400 md:hidden" />
        </>
      )}
    </button>
  );

  // Tab configuration with icons
  const tabConfig: Record<Tab, { icon: typeof MapIcon; label: string }> = {
    library: { icon: Sparkles, label: 'Library' },
    location: { icon: MapIcon, label: 'Location' },
    style: { icon: Palette, label: 'Style' },
    text: { icon: Type, label: 'Text' },
    frame: { icon: Layout, label: 'Frame' },
    sculpture: { icon: Box, label: 'Sculpture' },
    account: { icon: User, label: 'Account' },
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 md:relative md:h-full md:w-24 bg-white dark:bg-gray-800 border-t md:border-t-0 md:border-r border-gray-200 dark:border-gray-700 flex md:flex-col items-center z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:shadow-sm pb-safe md:pb-0">
      <div className="hidden md:flex h-16 items-center justify-center w-full border-b border-gray-100 dark:border-gray-700 mb-2">
        <Link href="/" className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg" />
      </div>

      {/* Mode Toggle - Desktop only, below logo */}
      <div className="hidden md:block w-full">
        <ModeToggle
          mode={productMode}
          onModeChange={handleModeChange}
          hasRoute={hasRoute}
        />
      </div>

      <div className="flex md:flex-col flex-1 md:flex-none md:w-full md:space-y-1">
        {currentTabs.map((tabId) => {
          const { icon, label } = tabConfig[tabId];
          return <TabButton key={tabId} id={tabId} icon={icon} label={label} />;
        })}
        {/* Account tab on mobile - shows in bottom nav with others */}
        <div className="md:hidden flex-1">
          <TabButton id="account" icon={User} label="Account" />
        </div>
      </div>

      {/* Explore and Account tabs on desktop - shows at bottom of sidenav */}
      <div className="hidden md:flex md:flex-col md:w-full md:space-y-1 md:mt-auto md:mb-2 md:border-t md:border-gray-200 dark:md:border-gray-700 md:pt-2">
        {onOpenExplore && (
          <button
            onClick={onOpenExplore}
            className="w-full flex flex-col items-center justify-center py-5 px-3 space-y-1.5 transition-colors text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Explore Community Maps"
          >
            <Compass className="w-6 h-6" />
            <span className="text-[11px] font-medium">Explore</span>
          </button>
        )}
        <TabButton id="account" icon={User} label="Account" />
      </div>
    </nav>
  );
}

