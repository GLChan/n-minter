"use client";

import React, { useState } from "react";
import Image from "next/image";
import { NFTCard } from "@/app/_components/ui/NFTCard";
import { CollectionInfo, NFTInfo } from "@/app/_lib/types";
import CollectionDetail from "./CollectionDetail";
import ActivityTab from "./ActivityTab";
import NFTsTab from "./NFTsTab";

const DEFAULT_TAB_ID = "items";
export function CollectionTabs({id, collection} : { id: string, collection: CollectionInfo }) {

  const [activeTab, setActiveTab] = useState(DEFAULT_TAB_ID);

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
        <NFTsTab collectionId={id} />
      )}

      {activeTab === "activity" && (
        <ActivityTab collectionId={id} />
      )}

      {activeTab === "about" && (
        <CollectionDetail collection={collection} />
      )}
    </>
  );
}
