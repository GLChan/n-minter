import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/_components/ui/Button";

import { formatPrice } from "@/app/_lib/utils";
import { CollectionTabs } from "@/app/collections/[id]/_components/CollectionTabs";
import {
  getCollectionById,
  getCollectionStatsById,
} from "@/app/_lib/data-service";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const collection = await getCollectionById(id);

  const collectionStats = await getCollectionStatsById(id);

  // 如果找不到合集数据，显示错误信息
  if (!collection) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">未找到合集</h1>
        <p className="mb-6">抱歉，我们找不到您请求的合集信息。</p>
        <Link href="/collections">
          <Button>返回合集列表</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* 合集Banner */}
      <div className="w-full h-64 md:h-80 relative">
        <Image
          src={collection.banner_image_url || ""}
          alt={`${collection.name} banner`}
          fill
          className="object-cover"
          priority
        />
        {/* Banner遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background opacity-70"></div>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        {/* 合集Logo和头部信息 */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* 合集Logo */}
          <div className="w-40 h-40 rounded-xl overflow-hidden border-4 border-background bg-white shadow-xl">
            <div className="relative w-full h-full">
              <Image
                src={collection.logo_image_url || ""}
                alt={collection.name}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* 合集名称和创建者信息 */}
          {collection.creator && (
            <div className="flex-1 md:mt-20">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{collection.name}</h1>
                {/* {collection.creator.verified && (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-blue-500"
                  >
                    <path
                      d="M9 12L11 14L15 10M12 3L4 10V20H20V10L12 3Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )} */}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-zinc-600 dark:text-zinc-400">
                  创建者:
                </span>
                <div className="flex items-center gap-2">
                  <div className="relative w-5 h-5 rounded-full overflow-hidden">
                    <Image
                      src={collection.creator.avatar_url || ""}
                      alt={collection.creator.username || ""}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="font-medium">
                    {collection.creator.username}
                  </span>
                  {/* {collection.creator.verified && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-blue-500"
                    >
                      <path
                        d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )} */}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 合集描述 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">关于合集</h2>
          <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-line">
            {collection.description}
          </p>
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">
              地板价
            </p>
            <p className="font-bold text-lg">
              ${formatPrice(collectionStats?.floorPrice || 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">
              总交易量
            </p>
            <p className="font-bold text-lg">
              ${formatPrice(collectionStats?.volume || 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">
              总数量
            </p>
            <p className="font-bold text-lg">
              {collectionStats?.itemCount || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">
              持有者
            </p>
            <p className="font-bold text-lg">
              {collectionStats?.ownerCount || 0}
            </p>
          </div>
        </div>

        <CollectionTabs id={id} collection={collection} />
      </div>
    </>
  );
}
