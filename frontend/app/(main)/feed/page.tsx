import { FeedClient } from '@/components/feed/FeedClient';
import { FeedHeader } from '@/components/feed/FeedHeader';
import type { TimeRange, ProductTypeFilter } from '@/lib/actions/feed';

export const metadata = {
  title: 'Browse Maps | Waymarker',
  description: 'Discover beautiful map posters created by the community',
};

interface FeedPageProps {
  searchParams: Promise<{ sort?: 'fresh' | 'top'; time?: TimeRange; type?: ProductTypeFilter }>;
}

const VALID_TIME_RANGES: TimeRange[] = ['all', 'today', 'week', 'month', 'year'];
const VALID_PRODUCT_TYPES: ProductTypeFilter[] = ['all', 'poster', 'sculpture'];

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const params = await searchParams;
  const sort = (params.sort || 'fresh') as 'fresh' | 'top';
  const timeRange: TimeRange = VALID_TIME_RANGES.includes(params.time as TimeRange)
    ? (params.time as TimeRange)
    : 'all';
  const productType: ProductTypeFilter = VALID_PRODUCT_TYPES.includes(params.type as ProductTypeFilter)
    ? (params.type as ProductTypeFilter)
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

        <FeedClient initialSort={sort} initialTimeRange={timeRange} initialProductType={productType} />
      </div>
    </div>
  );
}

