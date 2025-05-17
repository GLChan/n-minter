"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React from 'react';

interface Tab {
  name: string;
  slug: string;
}

const TABS: Tab[] = [
  { name: '拥有的', slug: 'owned' },
  { name: '活动', slug: 'activity' },
  { name: '收到的报价', slug: 'offers' },
];

export function Tabs({ currentTab }: { currentTab: string }) {
  const pathname = usePathname();

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 mb-8">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {TABS.map((tab) => (
          <Link
            key={tab.slug}
            href={`${pathname}?tab=${tab.slug}`}
            scroll={false}
            className={`px-4 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none ${
              currentTab === tab.slug
                ? 'text-primary border-b-2 border-primary'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            {tab.name}
          </Link>
        ))}
      </nav>
    </div>
  );
} 