"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function CategoryButton({
  categoryId,
  categoryName,
  currentTab,
}: {
  categoryId: number;
  categoryName: string;
  currentTab: string;
}) {
  const pathname = usePathname();
  return (
    <Link href={`${pathname}?tab=${categoryId}`}>
      <button
        className={`px-4 py-2 rounded-full text-sm cursor-pointer ${
          currentTab === categoryId + ""
            ? "bg-foreground text-background hover:bg-zinc-800 dark:hover:bg-zinc-200"
            : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
        }`}
      >
        {categoryName}
      </button>
    </Link>
  );
}
