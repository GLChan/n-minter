import Link from "next/link";
import { Button } from "@/app/_components/ui/Button";
import CategoryButton from "../_components/CategoryButton";
import { SORT_OPTIONS } from "../_lib/types/enums";
import {
  fetchCollectionsWithFilters,
  getCollectionCategories,
} from "../_lib/data-service";
import TimeRangeButton from "./_components/TimeRangeButton";
import CollectionCard from "../_components/CollectionCard";
import { CollectionListItem } from "../_lib/types";

// 排序选项
const sortOptions = [
  { label: "总交易量", value: "volume" },
  { label: "地板价", value: "floor" },
  { label: "新上线", value: "newest" },
  { label: "最多持有者", value: "owners" },
];

// 时间范围选项
const timeRanges = [
  { label: "24小时", value: "24h" },
  { label: "7天", value: "7d" },
  { label: "30天", value: "30d" },
  { label: "全部", value: "all" },
];

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    page?: string;
    sortBy?: string;
    time?: string;
  }>;
}) {
  const params = await searchParams;
  const pageParam = params.page ? parseInt(params.page) : 1;
  const tabParam = params.tab;
  const sortBy = params.sortBy || SORT_OPTIONS.RECENT_LISTED; // 默认排序方式
  const timeRange = params.time || "24h"; // 默认时间范围
  const currentTab = tabParam || "0"; // 默认标签页
  const categories = await getCollectionCategories();
  const collections = await fetchCollectionsWithFilters({
    page: pageParam,
    pageSize: 10,
    categoryId: currentTab === "0" ? undefined : currentTab,
    sortBy,
  });

  return (
    <>
      {/* 页面标题 */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">探索NFT合集</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            发现最热门的NFT合集，从艺术到游戏，这里有各种类型的数字资产
          </p>
          <Link href="/create-collection">
            <Button>创建新合集</Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 筛选器部分 */}
        <div className="flex flex-col space-y-6 mb-8">
          {/* 分类筛选 */}
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

          {/* 时间和排序筛选 */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {timeRanges.map((range, index) => (
                <TimeRangeButton
                  key={index}
                  range={range.value}
                  label={range.label}
                  currentTimeRange={timeRange}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                排序:
              </span>
              <select
                className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                defaultValue={sortBy || SORT_OPTIONS.RECENT_LISTED}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 合集列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collections.map((collection: CollectionListItem) => (
            <CollectionCard key={collection.id} collection={collection} />
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
