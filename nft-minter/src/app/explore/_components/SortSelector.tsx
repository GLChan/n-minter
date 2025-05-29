"use client";
import { SORT_OPTIONS } from "@/app/_lib/types/enums";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import React from "react";

// 排序选项
const sortOptions = [
  { label: "最近上市", value: SORT_OPTIONS.RECENT_LISTED },
  { label: "价格: 低到高", value: SORT_OPTIONS.PRICE_ASC },
  { label: "价格: 高到低", value: SORT_OPTIONS.PRICE_DESC },
  { label: "最近创建", value: SORT_OPTIONS.RECENT_CREATED },
];
export default function SortSelector({
  currentSort,
}: {
  currentSort?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (newSortByValue: string) => {
    // 1. 创建一个新的 URLSearchParams 实例，基于当前的查询参数
    // 这样可以保留其他可能存在的查询参数（例如 filterBy, page 等）
    const currentQuery = new URLSearchParams(
      Array.from(searchParams.entries())
    );

    // 2. 设置或更新 sortBy 参数
    if (newSortByValue && newSortByValue !== "") {
      currentQuery.set("sortBy", newSortByValue);
    } else {
      // 如果 newSortByValue 为空或某个 "默认" 值，则从 URL 中移除 sortBy 参数
      currentQuery.delete("sortBy");
    }

    // 3. 构建新的查询字符串
    const newSearchQueryString = currentQuery.toString();

    // 4. 构建新的 URL
    // 如果 newSearchQueryString 为空，则不添加 '?'
    const newUrl = `${pathname}${
      newSearchQueryString ? `?${newSearchQueryString}` : ""
    }`;

    // 5. 使用 router.push() 更新 URL
    // 在 App Router 中，仅更改搜索参数通常不会导致整个页面硬刷新，
    // 而是会重新渲染读取这些参数的 Server Components 和使用 useSearchParams() 的 Client Components。
    // { scroll: false } 选项会阻止页面滚动到顶部。
    router.push(newUrl);

    console.log(`Sort by changed to: ${newSortByValue}, new URL: ${newUrl}`);
  };

  return (
    <select
      value={currentSort}
      className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      onChange={(e) => handleSortChange(e.target.value)}
    >
      {sortOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
