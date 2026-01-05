'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/control-components';
import { Clock, TrendingUp, Calendar, Box, ImageIcon } from 'lucide-react';
import type { TimeRange, ProductTypeFilter } from '@/lib/actions/feed';

interface FeedFiltersProps {
  currentSort: 'fresh' | 'top';
  currentTimeRange: TimeRange;
  currentProductType: ProductTypeFilter;
}

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
];

export function FeedFilters({ currentSort, currentTimeRange, currentProductType }: FeedFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (sort: 'fresh' | 'top') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sort);
    router.push(`/feed?${params.toString()}`);
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    const params = new URLSearchParams(searchParams.toString());
    if (range === 'all') {
      params.delete('time');
    } else {
      params.set('time', range);
    }
    router.push(`/feed?${params.toString()}`);
  };

  const handleProductTypeChange = (type: ProductTypeFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type === 'all') {
      params.delete('type');
    } else {
      params.set('type', type);
    }
    router.push(`/feed?${params.toString()}`);
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-4">
      <div className="flex gap-2">
        <Button
          variant={currentSort === 'fresh' ? 'default' : 'outline'}
          onClick={() => handleSortChange('fresh')}
        >
          <Clock className="w-4 h-4 mr-2" />
          Fresh
        </Button>
        <Button
          variant={currentSort === 'top' ? 'default' : 'outline'}
          onClick={() => handleSortChange('top')}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Top
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <select
          value={currentTimeRange}
          onChange={(e) => handleTimeRangeChange(e.target.value as TimeRange)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {TIME_RANGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Product Type Filter */}
      <div className="flex gap-2">
        <Button
          variant={currentProductType === 'all' ? 'default' : 'outline'}
          onClick={() => handleProductTypeChange('all')}
        >
          All
        </Button>
        <Button
          variant={currentProductType === 'poster' ? 'default' : 'outline'}
          onClick={() => handleProductTypeChange('poster')}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Posters
        </Button>
        <Button
          variant={currentProductType === 'sculpture' ? 'default' : 'outline'}
          onClick={() => handleProductTypeChange('sculpture')}
          className={currentProductType === 'sculpture' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
        >
          <Box className="w-4 h-4 mr-2" />
          3D Sculptures
        </Button>
      </div>
    </div>
  );
}

