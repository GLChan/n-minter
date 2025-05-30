import ActivityLogInfo from "@/app/_components/ActivityLogInfo";
import { getUserActivityLog } from "@/app/_lib/data-service";
import { ActivityLogItem, UserProfile } from "@/app/_lib/types";
import React from "react";

// 活动记录接口定义
// interface Activity {
//   id: string;
//   description: string;
//   timestamp: string;
// }

// const activities = [
//   { id: 'pact-1', description: `收藏了 <span class="font-medium text-primary">星际漫游者</span> 来自 <span class="font-medium">宇宙画家</span>`, timestamp: '3 天前' },
//   { id: 'pact-2', description: `创建了新的 NFT <span class="font-medium text-primary">生成线条 #08</span>`, timestamp: '1 周前' },
//   { id: 'pact-3', description: `更新了个人简介`, timestamp: '2 周前' },
// ];

export async function ActivityTab({ profile }: { profile: UserProfile }) {
  const activities: ActivityLogItem[] = await getUserActivityLog(profile.id, 1, 10);

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
              >
                <ActivityLogInfo activity={activity} />

              </p>
              {/* <span className="text-xs text-zinc-400 dark:text-zinc-500 flex-shrink-0 ml-4">
                {formatDate(activity.created_at)}
              </span> */}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400 mt-6">暂无活动记录。</p>
      )}
    </div>
  );
}
