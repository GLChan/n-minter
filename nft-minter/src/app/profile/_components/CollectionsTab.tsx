import React from "react";
import { getUserCollections } from "@/app/_lib/actions";
import { UserProfile } from "@/app/_lib/types";

export async function CollectionsTab({profile} : { profile: UserProfile }) {
  const collections = await getUserCollections(profile.id);
  console.log('collections', collections);
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">我的合集</h2>
      <p>这里将展示用户的 NFT 合集。</p>
      {/* TODO: 添加创建合集的按钮和逻辑 */}
    
    </div>
  );
}
