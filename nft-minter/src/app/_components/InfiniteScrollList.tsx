import React from 'react';
import { useInfiniteScroll } from '../_lib/hooks/useInfiniteScroll';

interface InfiniteScrollListProps<T> {
  fetchFn: (page: number, pageSize: number) => Promise<T[]>;
  pageSize?: number;
  errorMessage?: string;
  container: (child: React.ReactNode) => React.ReactNode;
  renderItem: (item: T) => React.ReactNode;
  loadingPlaceholder?: React.ReactNode; // 自定义 loading 动画
  emptyPlaceholder?: React.ReactNode;
  noMoreCreateButton: (item: T) => React.ReactNode;
}

export function InfiniteScrollList<T>({
  fetchFn,
  pageSize = 20,
  renderItem,
  container = (child) => <>{child}</>,
  // errorMessage = '加载失败，请稍后再试。',
  loadingPlaceholder,
  emptyPlaceholder,
}: InfiniteScrollListProps<T>) {

  const {
    data,
    loading,
    hasMore,
    loaderRef,
    error,
  } = useInfiniteScroll({ fetchFn, pageSize });

  const showEmpty = !loading && data.length === 0 && !error;

  return (
    <div>
      {/* 显示错误信息 */}
      {error &&
        <MessagePlaceholder message="errorMessage"></MessagePlaceholder>
      }

      {/* 渲染数据项 */}
      {!showEmpty && container(data.map((item, index) => (
        <div key={index}>{renderItem(item)}</div>
      )))}

      {/* 加载中状态 */}
      {loading && (loadingPlaceholder ??
        <MessagePlaceholder message="加载中..."></MessagePlaceholder>)
      }

      {/* 没有更多数据 */}
      {!hasMore && !loading && data.length > 0 &&
        <MessagePlaceholder message="没有更多数据了"></MessagePlaceholder>
      }

      {/* 空数据提示 */}
      {showEmpty && (emptyPlaceholder ?? <MessagePlaceholder></MessagePlaceholder>)}


      {/* 滚动加载触发器 */}
      <div ref={loaderRef} />
    </div>
  );
}

interface MessagePlaceholderProps {
  message?: string;
  children?: React.ReactNode; // 可放图标或插图等
}

export function MessagePlaceholder({
  message = '暂无数据',
  children,
}: MessagePlaceholderProps) {
  return (
    <div className="text-center py-12">
      <p className="text-zinc-500 dark:text-zinc-400">{message}</p>
      {children && <div className="mb-4">{children}</div>}
    </div>
  );
}