"use client";

import React, { useState } from "react";
import Image from "next/image";
import { NFTCard } from "@/app/_components/ui/NFTCard";
import { NFTInfo } from "@/app/_lib/types";

const filterOptions = [
  { label: "最近上市", value: "recent_listed" },
  { label: "价格: 低到高", value: "price_asc" },
  { label: "价格: 高到低", value: "price_desc" },
  { label: "最近创建", value: "recent_created" },
];

export function CollectionTabs({}) {
  const [activeTab, setActiveTab] = useState("items");
  const [filterBy, setFilterBy] = useState("recent_listed");

  return (
    <>
      {/* 标签选项卡 */}
      <div className="mb-6 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex gap-6">
          <button
            className={`py-3 px-1 font-medium text-sm relative ${
              activeTab === "items"
                ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground"
                : "text-zinc-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-zinc-300"
            }`}
            onClick={() => setActiveTab("items")}
          >
            物品
          </button>
          <button
            className={`py-3 px-1 font-medium text-sm relative ${
              activeTab === "activity"
                ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground"
                : "text-zinc-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-zinc-300"
            }`}
            onClick={() => setActiveTab("activity")}
          >
            活动
          </button>
          <button
            className={`py-3 px-1 font-medium text-sm relative ${
              activeTab === "about"
                ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground"
                : "text-zinc-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-zinc-300"
            }`}
            onClick={() => setActiveTab("about")}
          >
            详情
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      {activeTab === "items" && (
        <>
          {/* 筛选器 */}
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                0 个物品
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                排序:
              </span>
              <select
                className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* NFT网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
            {/* {collectionNFTs.map((nft) => (
              <NFTCard
                key={nft.id}
                nft={nft}
              />
            ))} */}
          </div>
        </>
      )}

      {activeTab === "activity" && (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 overflow-hidden">
          <div className="p-6">
            <h3 className="font-medium mb-4">最近活动</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-700 last:border-0"
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                    <Image
                      src={`https://images.unsplash.com/photo-${
                        1610000000000 + item * 10000
                      }?w=96&h=96&fit=crop&q=80`}
                      alt="NFT"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">
                        抽象波形 #{100 + item}
                      </span>
                      <span className="text-sm font-medium">
                        {(Math.random() * 5).toFixed(2)} ETH
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        购买者: 0x1a2...b3c4
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {item}小时前
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "about" && (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 overflow-hidden">
          <div className="p-6">
            <h3 className="font-medium mb-4">合集信息</h3>
            <div className="space-y-4">
              <div className="flex justify-between pb-4 border-b border-zinc-100 dark:border-zinc-700">
                <span className="text-zinc-500 dark:text-zinc-400">
                  合约地址
                </span>
                <span className="font-medium">0xabc...123</span>
              </div>
              <div className="flex justify-between pb-4 border-b border-zinc-100 dark:border-zinc-700">
                <span className="text-zinc-500 dark:text-zinc-400">
                  代币标准
                </span>
                <span className="font-medium">ERC-721</span>
              </div>
              <div className="flex justify-between pb-4 border-b border-zinc-100 dark:border-zinc-700">
                <span className="text-zinc-500 dark:text-zinc-400">区块链</span>
                <span className="font-medium">以太坊</span>
              </div>
              <div className="flex justify-between pb-4 border-b border-zinc-100 dark:border-zinc-700">
                <span className="text-zinc-500 dark:text-zinc-400">
                  创建日期
                </span>
                <span className="font-medium">2025</span>
              </div>
              <div className="flex justify-between pb-4 border-b border-zinc-100 dark:border-zinc-700">
                <span className="text-zinc-500 dark:text-zinc-400">
                  创作者版税
                </span>
                <span className="font-medium">0.06%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">分类</span>
                <span className="font-medium">12342</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
