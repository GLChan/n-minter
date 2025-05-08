import React from 'react';

export function NFTSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-700 animate-pulse">
      {/* 图片占位区域 */}
      <div className="relative aspect-square w-full bg-zinc-200 dark:bg-zinc-700" />
      
      {/* 内容占位区域 */}
      <div className="p-4">
        {/* 标题 */}
        <div className="flex justify-between mb-2">
          <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3" />
          <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-6" />
        </div>
        
        {/* 创作者信息 */}
        <div className="flex justify-between items-center mb-3">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-16" />
        </div>
        
        {/* 底部信息 */}
        <div className="flex justify-between items-center">
          <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-14" />
          <div className="h-7 bg-zinc-200 dark:bg-zinc-700 rounded-full w-20" />
        </div>
      </div>
    </div>
  );
} 