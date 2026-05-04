import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchTweetsPage } from '../features/feed/services/feedService';

export function useTimeline() {
  return useInfiniteQuery({
    queryKey: ['tweets', 'timeline'],
    queryFn: ({ pageParam = 0 }) => fetchTweetsPage(pageParam),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 20 ? allPages.length * 20 : undefined,
    initialPageParam: 0,
  });
}
