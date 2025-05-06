'use client';

import React from 'react';

// Mock data for activities (can be replaced with props or state later)
const activities = [
  { id: 'act-1', description: '您成功购买了 <span class="font-medium text-primary">抽象旋涡 #3</span>', timestamp: '2 小时前' },
  { id: 'act-2', description: '收到了来自 <span class="font-mono text-xs">0xabcd...efgh</span> 对 <span class="font-medium text-primary">数字脉冲</span> 的 1.5 ETH 报价', timestamp: '1 天前' },
  { id: 'act-3', description: '您将 <span class="font-medium text-primary">宁静森林</span> 挂单出售，价格 1.0 ETH', timestamp: '3 天前' },
];

export function ActivityTab() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">最近活动</h2>
      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
              <p className="text-sm text-zinc-700 dark:text-zinc-300" dangerouslySetInnerHTML={{ __html: activity.description }}></p>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 flex-shrink-0 ml-4">{activity.timestamp}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400 mt-6 text-center">暂无活动记录。</p>
      )}
    </div>
  );
} 