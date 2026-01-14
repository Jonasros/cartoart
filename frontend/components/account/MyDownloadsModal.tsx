'use client';

import { useState, useEffect } from 'react';
import { X, Download, Loader2, Package, Image, Box } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Order } from '@/lib/actions/orders';
import type { ExportProduct } from '@/lib/stripe/products';

interface MyDownloadsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRODUCT_INFO: Record<
  ExportProduct,
  { name: string; icon: React.ReactNode; description: string }
> = {
  'poster-small': {
    name: 'Adventure Print - Small',
    icon: <Image className="w-5 h-5" />,
    description: '2400×3600px',
  },
  'poster-medium': {
    name: 'Adventure Print - Medium',
    icon: <Image className="w-5 h-5" />,
    description: '3600×5400px',
  },
  'poster-large': {
    name: 'Adventure Print - Large',
    icon: <Image className="w-5 h-5" />,
    description: '4800×7200px',
  },
  'sculpture-stl': {
    name: 'Journey Sculpture',
    icon: <Box className="w-5 h-5" />,
    description: '3D-printable STL',
  },
};

export function MyDownloadsModal({ isOpen, onClose }: MyDownloadsModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load your downloads');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (order: Order) => {
    if (order.download_count >= order.max_downloads) {
      return;
    }

    setDownloadingId(order.id);

    try {
      const response = await fetch(
        `/api/export/download?token=${order.download_token}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Download failed');
      }

      // The API returns export config, redirect to success page for actual download
      // In a full implementation, this would trigger the actual export generation
      const data = await response.json();

      // For now, show success and update the local count
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? { ...o, download_count: o.download_count + 1 }
            : o
        )
      );

      // Open success page in new tab for the actual download
      window.open(
        `/export/success?session_id=${order.stripe_session_id}`,
        '_blank'
      );
    } catch (err) {
      console.error('Download error:', err);
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloadingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                My Downloads
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your purchased exports
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-500 dark:text-red-400">{error}</p>
              <button
                onClick={fetchOrders}
                className="mt-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Try again
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-center">
              <Package className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No purchases yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Your purchased exports will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {orders.map((order) => {
                const productInfo = PRODUCT_INFO[order.product];
                const remainingDownloads =
                  order.max_downloads - order.download_count;
                const canDownload = remainingDownloads > 0;
                const isDownloading = downloadingId === order.id;

                return (
                  <div
                    key={order.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Product Icon */}
                      <div className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400">
                        {productInfo?.icon || <Package className="w-5 h-5" />}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {productInfo?.name || order.product}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {productInfo?.description}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Purchased{' '}
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Download Button */}
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => handleDownload(order)}
                          disabled={!canDownload || isDownloading}
                          className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all',
                            canDownload
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                          )}
                        >
                          {isDownloading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          Download
                        </button>
                        <span
                          className={cn(
                            'text-xs',
                            canDownload
                              ? 'text-gray-500 dark:text-gray-400'
                              : 'text-red-500 dark:text-red-400'
                          )}
                        >
                          {canDownload
                            ? `${remainingDownloads} download${remainingDownloads !== 1 ? 's' : ''} left`
                            : 'No downloads remaining'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Each purchase includes up to 5 downloads
          </p>
        </div>
      </div>
    </div>
  );
}
