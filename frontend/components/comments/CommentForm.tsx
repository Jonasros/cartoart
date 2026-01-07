'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/control-components';
import { useToast } from '@/components/ui/Toast';
import { addComment } from '@/lib/actions/comments';
import { LogIn } from 'lucide-react';
import type { Comment } from '@/lib/actions/comments';

interface CommentFormProps {
  mapId: string;
  onCommentAdded: (comment: Comment) => void;
  isAuthenticated?: boolean;
}

export function CommentForm({ mapId, onCommentAdded, isAuthenticated = false }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();
  const { showError } = useToast();
  const pathname = usePathname();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    const commentText = content.trim();
    setContent('');

    startTransition(async () => {
      try {
        const newComment = await addComment(mapId, commentText);
        onCommentAdded(newComment);
      } catch (error) {
        console.error('Failed to add comment:', error);
        showError('Failed to add comment. Please try again.');
        setContent(commentText); // Restore content on error
      }
    });
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Sign in to join the conversation
        </p>
        <Link href={`/login?redirect=${encodeURIComponent(pathname)}`}>
          <Button variant="outline" size="sm" className="gap-2">
            <LogIn className="w-4 h-4" />
            Sign in to comment
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        disabled={isPending}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!content.trim() || isPending}
          size="sm"
        >
          {isPending ? 'Posting...' : 'Post Comment'}
        </Button>
      </div>
    </form>
  );
}
