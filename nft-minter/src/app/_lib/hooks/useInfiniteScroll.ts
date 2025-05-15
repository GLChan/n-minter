import { useEffect, useRef, useState, useCallback } from 'react';

interface UseInfiniteScrollOptions<T> {
  fetchFn: (page: number, pageSize: number) => Promise<T[]>;
  pageSize?: number;
}

export function useInfiniteScroll<T>({
  fetchFn,
  pageSize = 20,
}: UseInfiniteScrollOptions<T>) {

  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null); // Add error state
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null); // Reset error before new request
    try {
      const newData = await fetchFn(page, pageSize);
      setData(prev => [...prev, ...newData]);
      setPage(prev => prev + 1);
      if (newData.length < pageSize) setHasMore(false);
    } catch (e) {
      console.error('Error loading data:', e);
      setError('数据加载失败，请稍后再试'); // Set error message
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, loading, hasMore, fetchFn]);

  // Intersection Observer
  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !loading) {
          // console.log('👀 loadMore 触发');
          loadMore();
        }
      },
      {
        rootMargin: '200px',
      }
    );

    const target = loaderRef.current;
    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [loadMore, hasMore, loading]);

  return { data, loading, hasMore, loaderRef, error }; // Return error
}
