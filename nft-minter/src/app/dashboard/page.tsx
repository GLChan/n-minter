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

  const profile: UserProfile = await getUserInfo()

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