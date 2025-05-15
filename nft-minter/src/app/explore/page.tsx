import React from 'react';
import { Navbar } from '@/app/_components/Navbar';
import { Footer } from '@/app/_components/Footer';
import { Button } from '@/app/_components/ui/Button';

// 模拟NFT数据
// const mockNFTs = [
//   {
//     id: '1',
//     title: '抽象波浪 #42',
//     image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1074&auto=format&fit=crop',
//     creator: '@digitalartist',
//     price: 2.5,
//     timeAgo: '3小时前',
//     collection: '抽象艺术',
//     collectionImage: 'https://images.unsplash.com/photo-1536924430914-91f9e2041b83?q=80&w=100&auto=format&fit=crop'
//   },
//   {
//     id: '2',
//     title: '数字生活 #457',
//     image: 'https://images.unsplash.com/photo-1583160247711-2191776b4b91?q=80&w=1074&auto=format&fit=crop',
//     creator: '@pixelmaster',
//     price: 1.8,
//     timeAgo: '1天前',
//     collection: '数字生活',
//     collectionImage: 'https://images.unsplash.com/photo-1612487528505-d2338264c821?q=80&w=100&auto=format&fit=crop'
//   },
//   {
//     id: '3',
//     title: '像素猫咪 #13',
//     image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=1074&auto=format&fit=crop',
//     creator: '@catartist',
//     price: 0.5,
//     timeAgo: '2天前'
//   },
//   {
//     id: '4',
//     title: '未来都市 #78',
//     image: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1074&auto=format&fit=crop',
//     creator: '@futurevisionary',
//     price: 3.2,
//     timeAgo: '5小时前',
//     collection: '未来派',
//     collectionImage: 'https://images.unsplash.com/photo-1451187863213-d1bcbaae3fa3?q=80&w=100&auto=format&fit=crop'
//   },
//   {
//     id: '5',
//     title: '宇宙探索 #29',
//     image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1074&auto=format&fit=crop',
//     creator: '@spaceart',
//     price: 4.0,
//     timeAgo: '1小时前',
//     collection: '宇宙系列',
//     collectionImage: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?q=80&w=100&auto=format&fit=crop'
//   },
//   {
//     id: '6',
//     title: '自然之美 #102',
//     image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1074&auto=format&fit=crop',
//     creator: '@naturelover',
//     price: 1.2,
//     timeAgo: '12小时前'
//   },
//   {
//     id: '7',
//     title: '极简主义 #56',
//     image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=1074&auto=format&fit=crop',
//     creator: '@minimalart',
//     price: 0.8,
//     timeAgo: '2天前',
//     collection: '极简',
//     collectionImage: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=100&auto=format&fit=crop'
//   },
//   {
//     id: '8',
//     title: '赛博朋克 #33',
//     image: 'https://images.unsplash.com/photo-1573455494060-c5595004fb6c?q=80&w=1074&auto=format&fit=crop',
//     creator: '@cyberpunk',
//     price: 2.3,
//     timeAgo: '1天前',
//     collection: '赛博朋克',
//     collectionImage: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=100&auto=format&fit=crop'
//   }
// ];

// 分类选项
const categories = [
  '全部',
  '艺术',
  '音乐',
  '收藏品',
  '摄影',
  '游戏',
  '虚拟世界',
  '域名'
];

// 排序选项
const sortOptions = [
  { label: '最近铸造', value: 'recent' },
  { label: '价格: 低到高', value: 'price_asc' },
  { label: '价格: 高到低', value: 'price_desc' },
  { label: '最热门', value: 'popularity' }
];

export default function ExplorePage() {



  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
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
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-full text-sm ${
                    index === 0
                      ? 'bg-foreground text-background hover:bg-zinc-800 dark:hover:bg-zinc-200'
                      : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* 右侧排序和布局 */}
            <div className="flex items-center gap-4">
              <select
                className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <div className="flex bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                <button className="p-2 bg-zinc-100 dark:bg-zinc-700">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button className="p-2">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 6h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1zm0 6h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* NFT列表 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* {mockNFTs.map((nft) => (
              <NFTCard
                key={nft.id}
                id={nft.id}
                title={nft.title}
                image={nft.image}
                creator={nft.creator}
                price={nft.price}
                timeAgo={nft.timeAgo}
                collection={nft.collection}
                collectionImage={nft.collectionImage}
              />
            ))} */}
          </div>
          
          {/* 加载更多按钮 */}
          <div className="flex justify-center mt-12">
            <Button variant="secondary" size="lg">
              加载更多
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 