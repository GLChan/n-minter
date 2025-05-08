import React from 'react';

// 活动记录接口定义
interface Activity {
  id: string;
  description: string;
  timestamp: string;
}

interface ActivityTabProps {
  activities: Activity[];
}

export function ActivityTab({ activities }: ActivityTabProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">活动记录</h2>
      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800"
            >
              <p 
                className="text-sm text-zinc-700 dark:text-zinc-300" 
                dangerouslySetInnerHTML={{ __html: activity.description }}
              ></p>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 flex-shrink-0 ml-4">
                {activity.timestamp}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400 mt-6">暂无活动记录。</p>
      )}
    </div>
  );
} 