import React from "react";
import {
  getCollectionCategories,
  getNftsByCollectionCategoryId,
} from "../_lib/data-service";
import CategoryButton from "../_components/CategoryButton";
import { NFTCard } from "../_components/ui/NFTCard";
import { SORT_OPTIONS } from "../_lib/types/enums";
import SortSelector from "./_components/SortSelector";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { tab?: string; page?: string; sortBy?: string };
}) {
  const params = searchParams;
  const pageParam = params.page ? parseInt(params.page) : 1;
  const tabParam = params.tab;
  const sortBy = params.sortBy || SORT_OPTIONS.RECENT_LISTED; // 默认排序方式
  const currentTab = tabParam || "0"; // 默认标签页
  const categories = await getCollectionCategories();

  const nfts = await getNftsByCollectionCategoryId({
    page: pageParam,
    pageSize: 10,
    categoryId: parseInt(currentTab),
    sortBy,
  });

  return (
    <>
      {/* 页面标题 */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">探索数字艺术品</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            发现独特的NFT作品，从艺术到收藏品，这里应有尽有
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 筛选器部分 */}
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-8">
          {/* 左侧分类 */}
          <div className="flex flex-wrap gap-2">
            <CategoryButton
              categoryId={0}
              categoryName={"全部"}
              currentTab={currentTab}
            />
            {categories.map((category) => (
              <CategoryButton
                key={category.id}
                categoryId={category.id}
                categoryName={category.name}
                currentTab={currentTab}
              />
            ))}
          </div>

          {/* 右侧排序和布局 */}
          <div className="flex items-center gap-4">
            <SortSelector currentSort={sortBy} />
            {/* <div className="flex bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
              <button className="p-2 bg-zinc-100 dark:bg-zinc-700">
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <button className="p-2">
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 5h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 6h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1zm0 6h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z"
                  />
                </svg>
              </button>
            </div> */}
          </div>
        </div>

        {/* NFT列表 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {nfts.map((nft) => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
        </div>

        {/* 加载更多按钮 */}
        {/* <div className="flex justify-center mt-12">
          <Button variant="secondary" size="lg">
            加载更多
          </Button>
        </div> */}
      </div>
    </>
  );
}
