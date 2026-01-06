'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/control-components';
import { Clock, Heart, MessageCircle, Calendar, Box, ImageIcon } from 'lucide-react';
import type { TimeRange, ProductTypeFilter, SortOption } from '@/lib/actions/feed';

interface FeedFiltersProps {
  currentSort: SortOption;
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

  const handleSortChange = (sort: SortOption) => {
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
          title="Sort by newest first"
        >
          <Clock className="w-4 h-4 mr-2" />
          Newest
        </Button>
        <Button
          variant={currentSort === 'top' ? 'default' : 'outline'}
          onClick={() => handleSortChange('top')}
          title="Sort by most likes"
        >
          <Heart className="w-4 h-4 mr-2" />
          Most Liked
        </Button>
        <Button
          variant={currentSort === 'discussed' ? 'default' : 'outline'}
          onClick={() => handleSortChange('discussed')}
          title="Sort by most comments"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Most Discussed
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <select
          value={currentTimeRange}
          onChange={(e) => handleTimeRangeChange(e.target.value as TimeRange)}
          className="px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
          className={currentProductType === 'poster' ? 'bg-adventure-print hover:bg-adventure-print/90' : ''}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Prints
        </Button>
        <Button
          variant={currentProductType === 'sculpture' ? 'default' : 'outline'}
          onClick={() => handleProductTypeChange('sculpture')}
          className={currentProductType === 'sculpture' ? 'bg-journey-sculpture hover:bg-journey-sculpture/90' : ''}
        >
          <Box className="w-4 h-4 mr-2" />
          Sculptures
        </Button>
      </div>
    </div>
  );
}

