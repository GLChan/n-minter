import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getProfileByUserId } from "@/app/_lib/data-service";
import { Tabs } from "@/app/profile/_components/Tabs";
import Posts from "./_components/Posts";
import Holdings from "./_components/Holdings";
import FollowButton from "./_components/FollowButton";

const TABS = [
  { name: "Posts", slug: "posts" },
  { name: "Holdings", slug: "holdings" },
];

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const urlParams = await searchParams;

  const pageParam = urlParams.page ? parseInt(urlParams.page) : 1;
  const tabParam = urlParams.tab;

  const currentTab = tabParam || "posts"; // 默认标签页 holdings
  const currentPage = Number(pageParam) || 1;

  const { userId } = await params;
  const user = await getProfileByUserId(userId);
  if (!user) {
    return <p className="text-red-500">用户不存在或已被删除。</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header -参考图片布局 */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
        {/* Avatar */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-zinc-300 dark:border-zinc-700 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 mx-auto sm:mx-0">
          <Image
            src={user.avatar_url || ""}
            alt={`${user.username} Avatar`}
            fill
            sizes="(max-width: 640px) 96px, 128px"
            className="object-cover"
          />
        </div>
        {/* User Info & Follow Button */}
        <div className="flex-1 flex flex-col sm:flex-row items-start w-full">
          <div className="flex-1 mb-4 sm:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              {user.username}
              {/* {user.verified && (
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              )} */}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mb-2">@{userId}</p>{" "}
            {/* Displaying route param */}
            <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3 max-w-lg">
              {user.bio}
            </p>
            <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-3">
              <span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {user.followers_count}
                </span>{" "}
                followers
              </span>
              <span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {user.following_count}
                </span>{" "}
                following
              </span>
            </div>
            {user.website && (
              <Link
                href={`https://${user.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                <ExternalLink size={14} />
                {user.website}
              </Link>
            )}
          </div>
          <div className="flex-shrink-0 ml-auto">
            <FollowButton userId={user.id}/>
          </div>
        </div>
      </div>

      <Tabs currentTab={currentTab} tabs={TABS} />

      <div>
        {currentTab === "posts" && (
          <Posts user={user} currentPage={currentPage} />
        )}

        {currentTab === "holdings" && (
          <Holdings user={user} currentPage={currentPage} />
        )}
      </div>
    </div>
  );
}
