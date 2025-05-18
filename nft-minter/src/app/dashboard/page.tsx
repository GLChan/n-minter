import React, { Suspense } from 'react';
import OwnedNFTsTab from './_components/OwnedNFTsTab';
import { ActivityTab } from './_components/ActivityTab';
import { OffersTab } from './_components/OffersTab';
import { Tabs } from './_components/Tabs';
import Spinner from '../_components/Spinner';
import { UserProfile } from '../_lib/types';
import { getUserInfo } from '../_lib/actions';

export default async function DashboardPage({ searchParams }: { searchParams: { tab?: string; page?: string } }) {
  const params = await searchParams;
  const currentTab = params.tab || 'owned';
  const pageParam = params.page ? parseInt(params.page) : 1;

  const currentPage = pageParam;

  // 获取用户资料并确保所有数据都是可序列化的
  const userProfile = await getUserInfo();
  
  // 创建一个新的纯对象，避免可能包含Set或其他不可序列化的数据
  const profile: UserProfile = {
    id: userProfile.id,
    username: userProfile.username,
    bio: userProfile.bio,
    avatar_url: userProfile.avatar_url,
    wallet_address: userProfile.wallet_address,
    email: userProfile.email,
    created_at: userProfile.created_at,
    updated_at: userProfile.updated_at,
    website: userProfile.website
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs currentTab={currentTab} />

      <div>
        <Suspense fallback={<Spinner />}>
          {currentTab === 'owned' && <OwnedNFTsTab profile={profile} page={currentPage} />}
          {currentTab === 'activity' && <ActivityTab />}
          {currentTab === 'offers' && <OffersTab />}
        </Suspense>
      </div>
    </div>
  );
} 