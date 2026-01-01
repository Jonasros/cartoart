import { FeedClient } from '@/components/feed/FeedClient';
import { FeedHeader } from '@/components/feed/FeedHeader';
import type { TimeRange } from '@/lib/actions/feed';

export const metadata = {
  title: 'Browse Maps | CartoArt',
  description: 'Discover beautiful map posters created by the community',
};

interface FeedPageProps {
  searchParams: Promise<{ sort?: 'fresh' | 'top'; time?: TimeRange }>;
}

const VALID_TIME_RANGES: TimeRange[] = ['all', 'today', 'week', 'month', 'year'];

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const params = await searchParams;
  const sort = (params.sort || 'fresh') as 'fresh' | 'top';
  const timeRange: TimeRange = VALID_TIME_RANGES.includes(params.time as TimeRange)
    ? (params.time as TimeRange)
    : 'all';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <FeedHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Discover Maps
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore beautiful map posters created by the community
          </p>
        </div>

        <FeedClient initialSort={sort} initialTimeRange={timeRange} />
      </div>
    </div>
  );
}

