"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/app/_components/ui/Button';
import { formatPrice } from '@/app/_lib/utils';

// 定义合集类型
interface Collection {
  id: string;
  name: string;
  image: string;
  banner?: string;
  creator: {
    name: string;
    avatar: string;
  };
  description: string;
  itemCount: number;
  volume: number;
  floorPrice: number;
  owners: number;
  category: string;
}

// 分类选项
const categories = [
  '全部',
  '艺术',
  '音乐',
  '收藏品',
  '摄影',
  '游戏',
  '公用事业',
  '虚拟世界'
];

// 排序选项
const sortOptions = [
  { label: '总交易量', value: 'volume' },
  { label: '地板价', value: 'floor' },
  { label: '新上线', value: 'newest' },
  { label: '最多持有者', value: 'owners' }
];

// 时间范围选项
const timeRanges = [
  { label: '24小时', value: '24h' },
  { label: '7天', value: '7d' },
  { label: '30天', value: '30d' },
  { label: '全部时间', value: 'all' }
];

// 模拟合集数据
const mockCollections: Collection[] = [
  {
    id: '1',
    name: '抽象迷幻',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    creator: {
      name: '@abstractart',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces&q=80'
    },
    description: '一系列探索色彩和形状互动的抽象数字艺术品',
    itemCount: 1280,
    volume: 8342000,
    floorPrice: 1250000,
    owners: 730,
    category: '艺术'
  },
  {
    id: '2',
    name: '像素猫咪',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1200&auto=format&fit=crop&q=80',
    creator: {
      name: '@pixelpets',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&q=80'
    },
    description: '10,000只独特的像素猫咪，每一只都有不同的特征和稀有度',
    itemCount: 10000,
    volume: 6750000,
    floorPrice: 500000,
    owners: 4320,
    category: '收藏品'
  },
  {
    id: '3',
    name: '赛博城市',
    image: 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?w=400&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?w=1200&auto=format&fit=crop&q=80',
    creator: {
      name: '@futuristic',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces&q=80'
    },
    description: '未来都市景观的数字艺术系列，探索科技与人类的关系',
    itemCount: 745,
    volume: 9875000,
    floorPrice: 2300000,
    owners: 425,
    category: '艺术'
  },
  {
    id: '4',
    name: '太空探索',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&auto=format&fit=crop&q=80',
    creator: {
      name: '@spaceart',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces&q=80'
    },
    description: '太空、行星和宇宙奇观的系列数字艺术',
    itemCount: 520,
    volume: 3450000,
    floorPrice: 670000,
    owners: 280,
    category: '艺术'
  },
  {
    id: '5',
    name: '音乐世界',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&auto=format&fit=crop&q=80',
    creator: {
      name: '@musicnft',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=faces&q=80'
    },
    description: '独家音乐收藏品，包含限量版原创音乐和专辑封面艺术',
    itemCount: 325,
    volume: 2580000,
    floorPrice: 780000,
    owners: 195,
    category: '音乐'
  },
  {
    id: '6',
    name: '虚拟地产',
    image: 'https://images.unsplash.com/photo-1524703808315-d44ec1eefd63?w=400&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=1200&auto=format&fit=crop&q=80',
    creator: {
      name: '@virtualestates',
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop&crop=faces&q=80'
    },
    description: '虚拟世界中的数字房地产，位于热门元宇宙平台',
    itemCount: 1500,
    volume: 12500000,
    floorPrice: 1800000,
    owners: 850,
    category: '虚拟世界'
  },
  {
    id: '7',
    name: '游戏资产',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80',
    creator: {
      name: '@gamenft',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80'
    },
    description: '游戏内物品、武器、皮肤和角色的NFT合集',
    itemCount: 2800,
    volume: 5670000,
    floorPrice: 320000,
    owners: 1250,
    category: '游戏'
  },
  {
    id: '8',
    name: '自然之美',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&auto=format&fit=crop&q=80',
    creator: {
      name: '@natureart',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&q=80'
    },
    description: '捕捉大自然壮丽景色的数字艺术作品集',
    itemCount: 420,
    volume: 1985000,
    floorPrice: 450000,
    owners: 210,
    category: '摄影'
  }
];

export default function CollectionsPage() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [activeTimeRange, setActiveTimeRange] = useState('24h');
  const [sortBy, setSortBy] = useState('volume');

  // 根据选择的分类筛选合集
  const filteredCollections = activeCategory === '全部'
    ? mockCollections
    : mockCollections.filter(collection => collection.category === activeCategory);

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
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full text-sm ${category === activeCategory
                  ? 'bg-foreground text-background hover:bg-zinc-800 dark:hover:bg-zinc-200'
                  : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* 时间和排序筛选 */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {timeRanges.map((range, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-full text-sm ${range.value === activeTimeRange
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                    : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                    }`}
                  onClick={() => setActiveTimeRange(range.value)}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">排序:</span>
              <select
                className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
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
          {filteredCollections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              className="bg-white dark:bg-zinc-800 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-700 transition-all hover:shadow-lg"
            >
              {/* 合集封面图 */}
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>

              {/* 合集信息 */}
              <div className="p-4">
                {/* 创作者头像和名称 */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative w-6 h-6 rounded-full overflow-hidden">
                    <Image
                      src={collection.creator.avatar}
                      alt={collection.creator.name}
                      fill
                      className="object-cover"
                      sizes="24px"
                    />
                  </div>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
                    {collection.creator.name}
                  </span>
                </div>

                {/* 合集名称 */}
                <h3 className="font-medium text-lg mb-2 truncate">{collection.name}</h3>

                {/* 合集描述 */}
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                  {collection.description}
                </p>

                {/* 合集统计数据 */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex flex-col">
                    <span className="text-zinc-500 dark:text-zinc-400">地板价</span>
                    <span className="font-medium">${formatPrice(collection.floorPrice)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-zinc-500 dark:text-zinc-400">总交易量</span>
                    <span className="font-medium">${formatPrice(collection.volume)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-zinc-500 dark:text-zinc-400">物品数量</span>
                    <span className="font-medium">{collection.itemCount.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-zinc-500 dark:text-zinc-400">持有者</span>
                    <span className="font-medium">{collection.owners.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 加载更多按钮 */}
        <div className="flex justify-center mt-12">
          <Button variant="secondary" size="lg">
            加载更多
          </Button>
        </div>
      </div>
    </>
  );
} 