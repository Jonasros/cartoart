'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Edit, Eye, EyeOff, Calendar, TrendingUp, Image as ImageIcon, Box, MapPin, Compass } from 'lucide-react';
import { Button } from '@/components/ui/control-components';
import { PublishModal } from './PublishModal';
import type { SavedMap } from '@/lib/actions/maps';

interface MyMapsListProps {
  maps: SavedMap[];
  onDelete: (id: string) => Promise<void>;
  onPublish: (id: string, subtitle?: string) => Promise<SavedMap>;
  onUnpublish: (id: string) => Promise<SavedMap>;
}

export function MyMapsList({ maps, onDelete, onPublish, onUnpublish }: MyMapsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishModalMap, setPublishModalMap] = useState<SavedMap | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this map?')) return;
    
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (error) {
      console.error('Failed to delete map:', error);
      alert('Failed to delete map. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePublishClick = (map: SavedMap) => {
    setPublishModalMap(map);
  };

  const handlePublishConfirm = async (subtitle?: string) => {
    if (!publishModalMap) return;
    
    setPublishingId(publishModalMap.id);
    try {
      await onPublish(publishModalMap.id, subtitle);
      setPublishModalMap(null);
    } catch (error) {
      console.error('Failed to publish map:', error);
      // Error is handled by modal
      throw error;
    } finally {
      setPublishingId(null);
    }
  };

  const handleUnpublish = async (id: string) => {
    setPublishingId(id);
    try {
      await onUnpublish(id);
    } catch (error) {
      console.error('Failed to unpublish map:', error);
      alert('Failed to unpublish map. Please try again.');
    } finally {
      setPublishingId(null);
    }
  };

  if (maps.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No adventures yet
        </h3>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          Create your first adventure print or explore the community for inspiration.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/create">
            <Button className="gap-2">
              <MapPin className="w-4 h-4" />
              Create Your First Adventure
            </Button>
          </Link>
          <Link href="/feed">
            <Button variant="outline" className="gap-2">
              <Compass className="w-4 h-4" />
              Explore the Community
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {maps.map((map) => (
        <div
          key={map.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
        >
          <Link href={`/map/${map.id}`}>
            <div className="aspect-[2/3] relative bg-gray-100 dark:bg-gray-700">
              {/* Product Type Badge */}
              <div className="absolute top-2 left-2 z-10">
                {map.product_type === 'sculpture' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-journey-sculpture text-white shadow-sm backdrop-blur-sm">
                    <Box className="w-3 h-3" />
                    Sculpture
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-adventure-print text-white shadow-sm backdrop-blur-sm">
                    <ImageIcon className="w-3 h-3" />
                    Print
                  </span>
                )}
              </div>

              {/* Thumbnail Image */}
              {(map.product_type === 'sculpture' ? map.sculpture_thumbnail_url : map.thumbnail_url) ? (
                <Image
                  src={(map.product_type === 'sculpture' ? map.sculpture_thumbnail_url : map.thumbnail_url) as string}
                  alt={map.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-400 dark:text-gray-500 text-sm">No thumbnail</p>
                </div>
              )}
            </div>
          </Link>
          
          <div className="p-4">
            <Link href={`/map/${map.id}`}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 hover:text-primary dark:hover:text-primary">
                {map.title}
              </h3>
            </Link>
            {map.subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {map.subtitle}
              </p>
            )}
            
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(map.updated_at).toLocaleDateString()}
              </span>
              {map.is_published && (
                <>
                  <TrendingUp className="w-3 h-3 ml-2" />
                  <span>{map.vote_score} votes</span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {map.is_published ? (
                <>
                  <Link href={`/map/${map.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnpublish(map.id)}
                    disabled={publishingId === map.id}
                  >
                    <EyeOff className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Link href={`/?mapId=${map.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handlePublishClick(map)}
                    disabled={publishingId === map.id}
                  >
                    {publishingId === map.id ? 'Publishing...' : 'Publish'}
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(map.id)}
                disabled={deletingId === map.id}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
      
      {publishModalMap && (
        <PublishModal
          isOpen={!!publishModalMap}
          onClose={() => setPublishModalMap(null)}
          mapTitle={publishModalMap.title}
          currentSubtitle={publishModalMap.subtitle}
          onPublish={handlePublishConfirm}
        />
      )}
    </div>
  );
}

