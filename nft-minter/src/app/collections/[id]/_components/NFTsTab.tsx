import { NFTCard } from "@/app/_components/ui/NFTCard";
import { getNFTsByCollectionId } from "@/app/_lib/data-service";
import { NFTInfo } from "@/app/_lib/types";
import { SORT_OPTIONS } from "@/app/_lib/types/enums";
import { NFTSkeleton } from "./NFTSkeleton";
import React, { useEffect, useState } from "react";

const sortOptions = [
  { label: "最近上市", value: SORT_OPTIONS.RECENT_LISTED },
  { label: "价格: 低到高", value: SORT_OPTIONS.PRICE_ASC },
  { label: "价格: 高到低", value: SORT_OPTIONS.PRICE_DESC },
  { label: "最近创建", value: SORT_OPTIONS.RECENT_CREATED },
];

export default function NFTsTab({ collectionId }: { collectionId: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.RECENT_LISTED);
  const [collectionNFTs, setCollectionNFTs] = useState<NFTInfo[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true); // 开始加载
      setError(null);
      try {
        const newItems = await getNFTsByCollectionId(
          collectionId,
          page,
          10,
          sortBy
        );
        console.log("NFTsTab newItems", newItems);
        setCollectionNFTs((prevItems) =>
          page === 1 ? newItems : [...prevItems, ...newItems]
        ); // 如果是第一页则替换，否则追加
      } catch (err) {
        setError("加载数据失败，请稍后再试。");
        console.error(err);
      } finally {
        setIsLoading(false); // 加载完成
      }
    }
    loadData();
  }, [collectionId, page, sortBy]); // 当 page 变化时重新加载

  if (error) {
    // 初始加载就出错
    return <p style={{ color: "red" }}>{error}</p>;
  }

  // 初始加载且没有数据时显示主加载器
  if (isLoading && collectionNFTs.length === 0 && page === 0) {
    return <NFTSkeleton />;
  }

  return (
    <>
      {/* 筛选器 */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {collectionNFTs.length} 个物品
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            排序:
          </span>
          <select
            className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as SORT_OPTIONS);
              setPage(1); // 重置页码
            }}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* NFT网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
        {collectionNFTs.map((nft) => (
          <NFTCard key={nft.id} nft={nft} />
        ))}
      </div>
    </>
  );
}
