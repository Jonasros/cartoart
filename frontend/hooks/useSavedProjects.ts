'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PosterConfig, SavedProject } from '@/types/poster';
import type { SculptureConfig, ProductMode } from '@/types/sculpture';
import { safeGetItem, safeSetItem } from '@/lib/storage/safeStorage';
import { logger } from '@/lib/logger';
import { saveMap, saveMapWithThumbnail, updateMap, updateMapThumbnail, updateMapSculptureThumbnail, deleteMap, getUserMaps } from '@/lib/actions/maps';
import { uploadThumbnail, uploadSculptureThumbnail } from '@/lib/actions/storage';
import { createClient } from '@/lib/supabase/client';

const STORAGE_KEY = 'carto-art-saved-projects';

/**
 * Hook for managing saved poster projects.
 * Uses Supabase server actions when authenticated, falls back to localStorage when not.
 * 
 * @returns Object containing:
 * - projects: Array of saved projects
 * - saveProject: Save a new project
 * - deleteProject: Delete a project by ID
 * - renameProject: Rename a project
 * - isLoaded: Whether projects have been loaded
 * - storageError: Error message if storage operations fail
 * - isAuthenticated: Whether user is authenticated
 * 
 * @example
 * ```tsx
 * const { projects, saveProject, deleteProject } = useSavedProjects();
 * saveProject('My Poster', currentConfig);
 * ```
 */
export function useSavedProjects() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication and load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const authenticated = !!user;

        setIsAuthenticated(authenticated);

        if (authenticated) {
          // Load from Supabase
          try {
            const maps = await getUserMaps();
            setProjects(maps.map(map => ({
              id: map.id,
              name: map.title,
              config: map.config,
              updatedAt: new Date(map.updated_at).getTime(),
              productType: map.product_type,
              sculptureConfig: map.sculpture_config,
              sculptureThumbnailUrl: map.sculpture_thumbnail_url,
            })));
            setStorageError(null);
          } catch (error) {
            logger.error('Failed to load maps from server', error);
            setStorageError('Failed to load maps. Using local storage.');
            // Fallback to localStorage
            const stored = safeGetItem(STORAGE_KEY);
            if (stored) {
              try {
                setProjects(JSON.parse(stored));
              } catch (e) {
                logger.error('Failed to parse saved projects', e);
              }
            }
          }
        } else {
          // Load from localStorage
          const stored = safeGetItem(STORAGE_KEY);
          if (stored) {
            try {
              setProjects(JSON.parse(stored));
            } catch (e) {
              logger.error('Failed to parse saved projects', e);
              setStorageError('Failed to load saved projects');
            }
          }
        }
      } catch (error) {
        logger.error('Failed to initialize projects', error);
        // Fallback to localStorage
        const stored = safeGetItem(STORAGE_KEY);
        if (stored) {
          try {
            setProjects(JSON.parse(stored));
          } catch (e) {
            logger.error('Failed to parse saved projects', e);
          }
        }
      } finally {
        setIsLoaded(true);
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Save to localStorage as fallback (only when not authenticated)
  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      const success = safeSetItem(STORAGE_KEY, JSON.stringify(projects));
      if (!success) {
        setStorageError('Failed to save projects. Storage may be full or unavailable.');
      } else {
        setStorageError(null);
      }
    }
  }, [projects, isLoaded, isAuthenticated]);

  const saveProject = useCallback(async (
    name: string,
    config: PosterConfig,
    thumbnailBlob?: Blob,
    options?: {
      productType?: ProductMode;
      sculptureConfig?: SculptureConfig;
      sculptureThumbnailBlob?: Blob;
    }
  ): Promise<SavedProject> => {
    if (isAuthenticated) {
      // Save to Supabase
      try {
        let savedMap;
        const sculptureOptions = options?.productType || options?.sculptureConfig
          ? { productType: options.productType, sculptureConfig: options.sculptureConfig }
          : undefined;

        // First save the map to get an ID
        const tempMap = await saveMap(config, name, sculptureOptions);
        savedMap = tempMap;

        // Get current user for thumbnail uploads
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Upload poster thumbnail if provided
          if (thumbnailBlob) {
            try {
              const thumbnailUrl = await uploadThumbnail(tempMap.id, user.id, thumbnailBlob);
              savedMap = await updateMapThumbnail(tempMap.id, thumbnailUrl);
            } catch (thumbnailError) {
              logger.error('Failed to upload poster thumbnail:', thumbnailError);
              // Continue without poster thumbnail
            }
          }

          // Upload sculpture thumbnail if provided
          if (options?.sculptureThumbnailBlob) {
            try {
              const sculptureThumbnailUrl = await uploadSculptureThumbnail(tempMap.id, user.id, options.sculptureThumbnailBlob);
              savedMap = await updateMapSculptureThumbnail(tempMap.id, sculptureThumbnailUrl);
            } catch (sculptureThumbnailError) {
              logger.error('Failed to upload sculpture thumbnail:', sculptureThumbnailError);
              // Continue without sculpture thumbnail
            }
          }
        }

        const savedProject: SavedProject = {
          id: savedMap.id,
          name: savedMap.title,
          config: savedMap.config,
          updatedAt: new Date(savedMap.created_at).getTime(),
          productType: savedMap.product_type,
          sculptureConfig: savedMap.sculpture_config,
          sculptureThumbnailUrl: savedMap.sculpture_thumbnail_url,
        };

        setProjects(prev => [savedProject, ...prev]);
        setStorageError(null);
        return savedProject;
      } catch (error) {
        logger.error('Failed to save map to server', error);
        setStorageError('Failed to save map. Please try again.');
        throw error;
      }
    } else {
      // Save to localStorage
      const newProject: SavedProject = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
        name,
        config,
        updatedAt: Date.now(),
        productType: options?.productType,
        sculptureConfig: options?.sculptureConfig,
      };
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    }
  }, [isAuthenticated]);

  const deleteProject = useCallback(async (id: string) => {
    if (isAuthenticated) {
      try {
        await deleteMap(id);
        setProjects(prev => prev.filter(p => p.id !== id));
        setStorageError(null);
      } catch (error) {
        logger.error('Failed to delete map from server', error);
        setStorageError('Failed to delete map. Please try again.');
        throw error;
      }
    } else {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  }, [isAuthenticated]);

  const renameProject = useCallback(async (id: string, name: string) => {
    if (isAuthenticated) {
      try {
        await updateMap(id, projects.find(p => p.id === id)!.config, name);
        setProjects(prev => prev.map(p =>
          p.id === id ? { ...p, name, updatedAt: Date.now() } : p
        ));
        setStorageError(null);
      } catch (error) {
        logger.error('Failed to rename map on server', error);
        setStorageError('Failed to rename map. Please try again.');
        throw error;
      }
    } else {
      setProjects(prev => prev.map(p =>
        p.id === id ? { ...p, name, updatedAt: Date.now() } : p
      ));
    }
  }, [isAuthenticated, projects]);

  const updateProject = useCallback(async (
    id: string,
    config: PosterConfig,
    thumbnailBlob?: Blob,
    options?: {
      productType?: ProductMode;
      sculptureConfig?: SculptureConfig;
      sculptureThumbnailBlob?: Blob;
    }
  ): Promise<SavedProject> => {
    if (isAuthenticated) {
      try {
        // Build sculpture options for update
        const sculptureOptions = options?.productType || options?.sculptureConfig
          ? { productType: options.productType, sculptureConfig: options.sculptureConfig }
          : undefined;

        // Update the map config
        let updatedMap = await updateMap(id, config, undefined, sculptureOptions);

        // Get current user for thumbnail uploads
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Update poster thumbnail if provided
          if (thumbnailBlob) {
            try {
              const thumbnailUrl = await uploadThumbnail(id, user.id, thumbnailBlob);
              updatedMap = await updateMapThumbnail(id, thumbnailUrl);
            } catch (thumbnailError) {
              logger.error('Failed to upload poster thumbnail:', thumbnailError);
              // Continue without poster thumbnail update
            }
          }

          // Update sculpture thumbnail if provided
          if (options?.sculptureThumbnailBlob) {
            try {
              const sculptureThumbnailUrl = await uploadSculptureThumbnail(id, user.id, options.sculptureThumbnailBlob);
              updatedMap = await updateMapSculptureThumbnail(id, sculptureThumbnailUrl);
            } catch (sculptureThumbnailError) {
              logger.error('Failed to upload sculpture thumbnail:', sculptureThumbnailError);
              // Continue without sculpture thumbnail update
            }
          }
        }

        const savedProject: SavedProject = {
          id: updatedMap.id,
          name: updatedMap.title,
          config: updatedMap.config,
          updatedAt: new Date(updatedMap.updated_at).getTime(),
          productType: updatedMap.product_type,
          sculptureConfig: updatedMap.sculpture_config,
          sculptureThumbnailUrl: updatedMap.sculpture_thumbnail_url,
        };

        setProjects(prev => prev.map(p => p.id === id ? savedProject : p));
        setStorageError(null);
        return savedProject;
      } catch (error) {
        logger.error('Failed to update map on server', error);
        setStorageError('Failed to update map. Please try again.');
        throw error;
      }
    } else {
      // Update in localStorage
      const existingProject = projects.find(p => p.id === id);
      if (!existingProject) {
        throw new Error('Project not found');
      }
      const updatedProject: SavedProject = {
        ...existingProject,
        config,
        updatedAt: Date.now(),
        productType: options?.productType ?? existingProject.productType,
        sculptureConfig: options?.sculptureConfig ?? existingProject.sculptureConfig,
      };
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      return updatedProject;
    }
  }, [isAuthenticated, projects]);

  return {
    projects,
    saveProject,
    updateProject,
    deleteProject,
    renameProject,
    isLoaded,
    storageError,
    isAuthenticated: isAuthenticated ?? false,
    isLoading,
  };
}

