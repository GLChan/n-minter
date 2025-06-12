import React, { Suspense } from "react";
import Image from "next/image";
import { UserProfile } from "../_lib/types";
import { getUserInfo } from "../_lib/actions";
import { formatDate } from "../_lib/utils";
import {
  CollectedNFTsTab,
  CreatedNFTsTab,
  ActivityTab,
  SettingsTab,
  CollectionsTab,
  OwnedNFTsTab,
  OffersTab,
  Tabs,
  CopyButton,
} from "./_components";
import Spinner from "../_components/Spinner";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

const TABS = [
  { name: "NFT", slug: "nft" },
  { name: "已收藏", slug: "collected" },
  { name: "已铸造", slug: "created" },
  { name: "合集", slug: "collections" },
  { name: "活动", slug: "activity" },
  { name: "出价", slug: "offers" },
  { name: "设置", slug: "settings" },
];

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const params = await searchParams;
  const pageParam = params.page ? parseInt(params.page) : 1;
  const tabParam = params.tab;

  const profile: UserProfile = await getUserInfo();

  const currentTab = tabParam || "nft"; // 默认标签页
  const currentPage = Number(pageParam) || 1;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-zinc-300 dark:border-zinc-700 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={profile.avatar_url || "/placeholder-avatar.png"}
            alt={`${profile.username} Avatar`}
            fill
            priority
            sizes="(max-width: 768px) 96px, 128px"
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            {profile.username}
          </h1>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400">
              {profile.wallet_address}
            </p>
            {/* Simple copy button example */}
            <CopyButton text={profile.wallet_address} />
          </div>
          <p className="text-zinc-700 dark:text-zinc-300 text-sm max-w-lg mb-3">
            {profile.bio}
          </p>
          <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-3">
            <span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {profile.followers_count || 0}
              </span>{" "}
              followers
            </span>
            <span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {profile.following_count || 0}
              </span>{" "}
              following
            </span>
          </div>
          {profile.website && (
            <Link
              href={`https://${profile.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              <ExternalLink size={14} />
              {profile.website}
            </Link>
          )}

          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
            {formatDate(profile.created_at)}
          </p>
        </div>
      </div>

      <Tabs currentTab={currentTab} tabs={TABS} />

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<Spinner />}>
          {currentTab === "nft" && (
            <OwnedNFTsTab profile={profile} page={currentPage} />
          )}
          {currentTab === "collected" && <CollectedNFTsTab />}
          {currentTab === "created" && <CreatedNFTsTab />}
          {currentTab === "collections" && <CollectionsTab profile={profile} />}
          {currentTab === "activity" && <ActivityTab profile={profile} />}
          {currentTab === "offers" && <OffersTab />}
          {currentTab === "settings" && <SettingsTab profile={profile} />}
        </Suspense>
      </div>
    </div>
  );
}
