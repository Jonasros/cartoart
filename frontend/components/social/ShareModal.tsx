'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import {
  X,
  Link2,
  Check,
  Twitter,
  Facebook,
  Share2,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/control-components';

// Pinterest icon (not in lucide)
function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  map: {
    id: string;
    title: string;
    subtitle?: string;
    thumbnail_url?: string | null;
  };
}

type SharePlatform = 'copy' | 'native' | 'twitter' | 'facebook' | 'pinterest' | 'whatsapp';

export function ShareModal({ isOpen, onClose, map }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [supportsNativeShare, setSupportsNativeShare] = useState(false);

  // Check for native share support
  useEffect(() => {
    setSupportsNativeShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  // Generate share URL
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/map/${map.id}`
    : `/map/${map.id}`;

  // Share text
  const shareText = map.subtitle
    ? `${map.title} - ${map.subtitle}`
    : map.title;

  // Handle copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [shareUrl]);

  // Handle native share
  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: map.title,
          text: shareText,
          url: shareUrl,
        });
        onClose();
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  }, [map.title, shareText, shareUrl, onClose]);

  // Handle platform share
  const handlePlatformShare = useCallback((platform: SharePlatform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    const encodedTitle = encodeURIComponent(map.title);

    let platformUrl = '';

    switch (platform) {
      case 'twitter':
        platformUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        platformUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'pinterest':
        const imageUrl = map.thumbnail_url ? encodeURIComponent(map.thumbnail_url) : '';
        platformUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${imageUrl}&description=${encodedText}`;
        break;
      case 'whatsapp':
        platformUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      default:
        return;
    }

    window.open(platformUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  }, [shareUrl, shareText, map.title, map.thumbnail_url]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-xl shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 id="share-modal-title" className="text-lg font-semibold text-foreground">
            Share Adventure
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Map Preview */}
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            {map.thumbnail_url && (
              <img
                src={map.thumbnail_url}
                alt={map.title}
                className="w-16 h-16 rounded-md object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate">{map.title}</h3>
              {map.subtitle && (
                <p className="text-sm text-muted-foreground truncate">{map.subtitle}</p>
              )}
            </div>
          </div>

          {/* Copy Link */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Share link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className={cn(
                  'flex-1 px-3 py-2 text-sm rounded-lg border',
                  'bg-secondary/50 border-border text-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50'
                )}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                variant={copied ? 'default' : 'outline'}
                size="sm"
                onClick={handleCopy}
                className={cn(
                  'min-w-[80px]',
                  copied && 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Share Options */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Share to
            </label>
            <div className="grid grid-cols-4 gap-2">
              {/* Native Share (if supported) */}
              {supportsNativeShare && (
                <button
                  onClick={handleNativeShare}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg',
                    'bg-secondary/50 hover:bg-secondary transition-colors',
                    'text-foreground'
                  )}
                  aria-label="Share via device"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-xs">Share</span>
                </button>
              )}

              {/* Twitter/X */}
              <button
                onClick={() => handlePlatformShare('twitter')}
                className={cn(
                  'flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg',
                  'bg-secondary/50 hover:bg-[#1DA1F2]/10 transition-colors',
                  'text-foreground hover:text-[#1DA1F2]'
                )}
                aria-label="Share on Twitter"
              >
                <Twitter className="w-5 h-5" />
                <span className="text-xs">Twitter</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => handlePlatformShare('facebook')}
                className={cn(
                  'flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg',
                  'bg-secondary/50 hover:bg-[#4267B2]/10 transition-colors',
                  'text-foreground hover:text-[#4267B2]'
                )}
                aria-label="Share on Facebook"
              >
                <Facebook className="w-5 h-5" />
                <span className="text-xs">Facebook</span>
              </button>

              {/* Pinterest */}
              <button
                onClick={() => handlePlatformShare('pinterest')}
                className={cn(
                  'flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg',
                  'bg-secondary/50 hover:bg-[#E60023]/10 transition-colors',
                  'text-foreground hover:text-[#E60023]'
                )}
                aria-label="Share on Pinterest"
              >
                <PinterestIcon className="w-5 h-5" />
                <span className="text-xs">Pinterest</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => handlePlatformShare('whatsapp')}
                className={cn(
                  'flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg',
                  'bg-secondary/50 hover:bg-[#25D366]/10 transition-colors',
                  'text-foreground hover:text-[#25D366]'
                )}
                aria-label="Share on WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-xs">WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render at document root
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
