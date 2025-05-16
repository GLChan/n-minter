"use client"

import React, { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/app/_components/Navbar';
import { Footer } from '@/app/_components/Footer';
import { Button } from '@/app/_components/ui/Button';
import { NFTCard } from '@/app/_components/ui/NFTCard';
import { formatPrice } from '@/app/_lib/utils';
import { NFT } from '@/app/_lib/types';

// 模拟合集数据 - 实际应用中应从API获取
const mockCollections = [
  {
    id: '1',
    name: '抽象迷幻',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    creator: {
      name: '@abstractart',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces&q=80',
      verified: true
    },
    description: '一系列探索色彩和形状互动的抽象数字艺术品。这个系列通过数字艺术探索视觉感知的边界，结合了流动的形态和鲜明的色彩对比，创造出沉浸式的视觉体验。每件作品都是独一无二的，反映了创作者对现代数字艺术可能性的探索。',
    itemCount: 1280,
    volume: 8342000,
    floorPrice: 1250000,
    owners: 730,
    royalty: 7.5,
    created: '2023-06-15',
    category: '艺术'
  },
  {
    id: '2',
    name: '像素猫咪',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1200&auto=format&fit=crop&q=80',
    creator: {
      name: '@pixelpets',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&q=80',
      verified: true
    },
    description: '10,000只独特的像素猫咪，每一只都有不同的特征和稀有度。这个备受期待的系列由多种特征组合而成，创造出数千种可能的变体。每只猫咪都有独特的个性和外观，从普通到超级稀有不等。收集者可以参与社区活动和独家体验。',
    itemCount: 10000,
    volume: 6750000,
    floorPrice: 500000,
    owners: 4320,
    royalty: 5.0,
    created: '2023-08-22',
    category: '收藏品'
  }
];

// 模拟合集中的NFT数据
// const mockNFTs = [
//   {
//     id: '101',
//     title: '抽象波形 #42',
//     image: 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=400&auto=format&fit=crop&q=80',
//     creator: '@abstractart',
//     price: 2.5,
//     timeAgo: '3小时前',
//     collection: '抽象迷幻',
//     collectionImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80'
//   },
//   {
//     id: '102',
//     title: '量子片段 #18',
//     image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=400&auto=format&fit=crop&q=80',
//     creator: '@abstractart',
//     price: 1.8,
//     timeAgo: '1天前',
//     collection: '抽象迷幻',
//     collectionImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80'
//   },
//   {
//     id: '103',
//     title: '流光溢彩 #73',
//     image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
//     creator: '@abstractart',
//     price: 3.2,
//     timeAgo: '2天前',
//     collection: '抽象迷幻',
//     collectionImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80'
//   },
//   {
//     id: '104',
//     title: '扭曲空间 #29',
//     image: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&auto=format&fit=crop&q=80',
//     creator: '@abstractart',
//     price: 4.1,
//     timeAgo: '4小时前',
//     collection: '抽象迷幻',
//     collectionImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80'
//   },
//   {
//     id: '105',
//     title: '和谐振动 #56',
//     image: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=400&auto=format&fit=crop&q=80',
//     creator: '@abstractart',
//     price: 2.2,
//     timeAgo: '1天前',
//     collection: '抽象迷幻',
//     collectionImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80'
//   },
//   {
//     id: '106',
//     title: '未知边境 #64',
//     image: 'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?w=400&auto=format&fit=crop&q=80',
//     creator: '@abstractart',
//     price: 1.5,
//     timeAgo: '5天前',
//     collection: '抽象迷幻',
//     collectionImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80'
//   },
//   {
//     id: '201',
//     title: '灰猫 #127',
//     image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=80',
//     creator: '@pixelpets',
//     price: 0.6,
//     timeAgo: '2小时前',
//     collection: '像素猫咪',
//     collectionImage: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=100&auto=format&fit=crop&q=80'
//   },
//   {
//     id: '202',
//     title: '橘猫 #435',
//     image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&auto=format&fit=crop&q=80',
//     creator: '@pixelpets',
//     price: 0.8,
//     timeAgo: '1天前',
//     collection: '像素猫咪',
//     collectionImage: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=100&auto=format&fit=crop&q=80'
//   }
// ];

// 筛选选项
const filterOptions = [
  { label: '最近上市', value: 'recent_listed' },
  { label: '价格: 低到高', value: 'price_asc' },
  { label: '价格: 高到低', value: 'price_desc' },
  { label: '最近创建', value: 'recent_created' }
];

export default function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // 活动类型标签
  const [activeTab, setActiveTab] = useState('items');
  const [filterBy, setFilterBy] = useState('recent_listed');

  // 根据ID查找合集数据
  const collection = mockCollections.find(c => c.id === id);

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

  // 筛选当前合集的NFTs
  const collectionNFTs: NFT[] = []; // mockNFTs.filter(nft => nft.collection === collection.name);

  return (
    <>
      {/* 合集Banner */}
      < div className="w-full h-64 md:h-80 relative" >
        <Image
          src={collection.banner}
          alt={`${collection.name} banner`}
          fill
          className="object-cover"
          priority
        />
        {/* Banner遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background opacity-70"></div>
      </div >

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        {/* 合集Logo和头部信息 */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* 合集Logo */}
          <div className="w-40 h-40 rounded-xl overflow-hidden border-4 border-background bg-white shadow-xl">
            <div className="relative w-full h-full">
              <Image
                src={collection.image}
                alt={collection.name}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* 合集名称和创建者信息 */}
          <div className="flex-1 md:mt-20">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{collection.name}</h1>
              {collection.creator.verified && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-500">
                  <path d="M9 12L11 14L15 10M12 3L4 10V20H20V10L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-zinc-600 dark:text-zinc-400">创建者:</span>
              <div className="flex items-center gap-2">
                <div className="relative w-5 h-5 rounded-full overflow-hidden">
                  <Image
                    src={collection.creator.avatar}
                    alt={collection.creator.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="font-medium">{collection.creator.name}</span>
                {collection.creator.verified && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-500">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
          </div>
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
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">地板价</p>
            <p className="font-bold text-lg">${formatPrice(collection.floorPrice)}</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">总交易量</p>
            <p className="font-bold text-lg">${formatPrice(collection.volume)}</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">总数量</p>
            <p className="font-bold text-lg">{collection.itemCount.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">持有者</p>
            <p className="font-bold text-lg">{collection.owners.toLocaleString()}</p>
          </div>
        </div>

        {/* 标签选项卡 */}
        <div className="mb-6 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex gap-6">
            <button
              className={`py-3 px-1 font-medium text-sm relative ${activeTab === 'items'
                ? 'text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-zinc-300'
                }`}
              onClick={() => setActiveTab('items')}
            >
              物品
            </button>
            <button
              className={`py-3 px-1 font-medium text-sm relative ${activeTab === 'activity'
                ? 'text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-zinc-300'
                }`}
              onClick={() => setActiveTab('activity')}
            >
              活动
            </button>
            <button
              className={`py-3 px-1 font-medium text-sm relative ${activeTab === 'about'
                ? 'text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-zinc-300'
                }`}
              onClick={() => setActiveTab('about')}
            >
              详情
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        {activeTab === 'items' && (
          <>
            {/* 筛选器 */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{collectionNFTs.length} 个物品</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">排序:</span>
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
              {collectionNFTs.map((nft) => (
                <NFTCard
                  key={nft.id}
                  nft={nft}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 overflow-hidden">
            <div className="p-6">
              <h3 className="font-medium mb-4">最近活动</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-center gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-700 last:border-0">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                      <Image
                        src={`https://images.unsplash.com/photo-${1610000000000 + item * 10000}?w=96&h=96&fit=crop&q=80`}
                        alt="NFT"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">抽象波形 #{100 + item}</span>
                        <span className="text-sm font-medium">{(Math.random() * 5).toFixed(2)} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          购买者: 0x1a2...b3c4
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{item}小时前</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 overflow-hidden">
            <div className="p-6">
              <h3 className="font-medium mb-4">合集信息</h3>
              <div className="space-y-4">
                <div className="flex justify-between pb-4 border-b border-zinc-100 dark:border-zinc-700">
                  <span className="text-zinc-500 dark:text-zinc-400">合约地址</span>
                  <span className="font-medium">0xabc...123</span>
                </div>
                <div className="flex justify-between pb-4 border-b border-zinc-100 dark:border-zinc-700">
                  <span className="text-zinc-500 dark:text-zinc-400">代币标准</span>
                  <span className="font-medium">ERC-721</span>
                </div>
                <div className="flex justify-between pb-4 border-b border-zinc-100 dark:border-zinc-700">
                  <span className="text-zinc-500 dark:text-zinc-400">区块链</span>
                  <span className="font-medium">以太坊</span>
                </div>
                <div className="flex justify-between pb-4 border-b border-zinc-100 dark:border-zinc-700">
                  <span className="text-zinc-500 dark:text-zinc-400">创建日期</span>
                  <span className="font-medium">{collection.created}</span>
                </div>
                <div className="flex justify-between pb-4 border-b border-zinc-100 dark:border-zinc-700">
                  <span className="text-zinc-500 dark:text-zinc-400">创作者版税</span>
                  <span className="font-medium">{collection.royalty}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">分类</span>
                  <span className="font-medium">{collection.category}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 