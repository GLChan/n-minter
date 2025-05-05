"use client"

import React from 'react';
import { Navbar } from '@/app/_components/Navbar';
import { Footer } from '@/app/_components/Footer';
import { NFTCard } from '@/app/_components/ui/NFTCard';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/app/_components/ui/Button';

// Placeholder for Tab Component
interface TabButtonProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  hasNotification?: boolean;
}

const TabButton = ({ children, active, onClick, hasNotification }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors
      ${active
        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 hover:text-zinc-700 dark:hover:text-zinc-200'}\
    `}
  >
    {children}
    {hasNotification && (
      <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950" />
    )}
  </button>
);

// --- Mock Data ---
const ownedNFTs = [
  {
    id: 'nft-1',
    title: '抽象旋涡 #3',
    image: 'https://images.unsplash.com/photo-1501535033-a594139be346?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGFic3RyYWN0fGVufDB8fHx8MTY3OTA1OTgyOA&ixlib=rb-4.0.3&q=80&w=400',
    creator: '艺术家A',
    price: 0.5,
    timeAgo: '1天前',
    collection: '抽象宇宙',
    collectionImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=40&h=40&fit=crop',
  },
  {
    id: 'nft-2',
    title: '数字脉冲',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDEyfHxkaWdpdGFsJTIwYXJ0fGVufDB8fHx8MTY3OTA1OTg1NQ&ixlib=rb-4.0.3&q=80&w=400',
    creator: '工作室B',
    price: 1.2,
    timeAgo: '3小时前',
  },
  {
    id: 'nft-3',
    title: '宁静森林',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDR8fGZvcmVzdHxlbnwwfHx8fDE2NzkwNTk4ODI&ixlib=rb-4.0.3&q=80&w=400',
    creator: '摄影师C',
    price: 0.8,
    timeAgo: '5天前',
    collection: '自然之美',
    collectionImage: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=40&h=40&fit=crop',
  },
  {
    id: 'nft-4',
    title: '赛博朋克都市',
    image: 'https://images.unsplash.com/photo-1519677100203-a7e5e89c14b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGN5YmVycHVua3xlbnwwfHx8fDE2NzkwNTk5MDQ&ixlib=rb-4.0.3&q=80&w=400',
    creator: '匿名艺术家',
    price: 2.1,
    timeAgo: '刚刚',
  },
  {
    id: 'nft-5',
    title: '几何幻想',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDR8fGZvcmVzdHxlbnwwfHx8fDE2NzkwNTk4ODI&ixlib=rb-4.0.3&q=80&w=400',
    creator: '设计师D',
    price: 0.3,
    timeAgo: '2周前',
    collection: '形状世界',
    collectionImage: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=40&h=40&fit=crop',
  },
];

const activities = [
  { id: 'act-1', description: '您成功购买了 <span class="font-medium text-primary">抽象旋涡 #3</span>', timestamp: '2 小时前' },
  { id: 'act-2', description: '收到了来自 <span class="font-mono text-xs">0xabcd...efgh</span> 对 <span class="font-medium text-primary">数字脉冲</span> 的 1.5 ETH 报价', timestamp: '1 天前' },
  { id: 'act-3', description: '您将 <span class="font-medium text-primary">宁静森林</span> 挂单出售，价格 1.0 ETH', timestamp: '3 天前' },
];

const receivedOffers = [
  {
    id: 'offer-1',
    nftId: 'nft-2', // Matches an NFT the user owns (Digital Pulse)
    nftTitle: '数字脉冲',
    nftImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDEyfHxkaWdpdGFsJTIwYXJ0fGVufDB8fHx8MTY3OTA1OTg1NQ&ixlib=rb-4.0.3&q=80&w=100&h=100', // Smaller size for thumbnail
    offerAmount: 1.5,
    offerFromAddress: '0xabcd...efgh',
    timestamp: '1 天前',
  },
  {
    id: 'offer-2',
    nftId: 'nft-4', // Matches Cyberpunk City
    nftTitle: '赛博朋克都市',
    nftImage: 'https://images.unsplash.com/photo-1519677100203-a7e5e89c14b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGN5YmVycHVua3xlbnwwfHx8fDE2NzkwNTk5MDQ&ixlib=rb-4.0.3&q=80&w=100&h=100',
    offerAmount: 2.0,
    offerFromAddress: '0x1234...5678',
    timestamp: '5 小时前',
  },
];
// --- End Mock Data ---

export default function DashboardPage() {
  const [activeTab, setActiveTab] = React.useState('owned');

  // Determine if there are offers to show notification
  const hasNewOffers = receivedOffers.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">仪表盘</h1>

          {/* Tab Navigation */}
          <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800">
            <nav className="flex space-x-2" aria-label="Tabs">
              <TabButton active={activeTab === 'owned'} onClick={() => setActiveTab('owned')}>拥有的 NFT</TabButton>
              <TabButton active={activeTab === 'activity'} onClick={() => setActiveTab('activity')}>活动记录</TabButton>
              <TabButton 
                active={activeTab === 'offers'} 
                onClick={() => setActiveTab('offers')} 
                hasNotification={hasNewOffers}
              >
                收到的报价
              </TabButton>
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'owned' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 sr-only">我拥有的 NFT</h2>
                {ownedNFTs.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {ownedNFTs.map((nft) => (
                      <NFTCard key={nft.id} {...nft} />
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 dark:text-zinc-400 mt-6">您目前还没有任何 NFT。</p>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">最近活动</h2>
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                       <div key={activity.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                         <p className="text-sm text-zinc-700 dark:text-zinc-300" dangerouslySetInnerHTML={{ __html: activity.description }}></p>
                         <span className="text-xs text-zinc-400 dark:text-zinc-500 flex-shrink-0 ml-4">{activity.timestamp}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                   <p className="text-zinc-500 dark:text-zinc-400 mt-6">暂无活动记录。</p>
                )}
              </div>
            )}

            {activeTab === 'offers' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">收到的报价</h2>
                {receivedOffers.length > 0 ? (
                  <div className="space-y-4">
                    {receivedOffers.map((offer) => (
                      <div key={offer.id} className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                        {/* NFT Thumbnail */}
                        <Link href={`/nft/${offer.nftId}`} className="flex-shrink-0">
                           <Image 
                             src={offer.nftImage}
                             alt={offer.nftTitle}
                             width={64} // Explicit width
                             height={64} // Explicit height
                             className="rounded-md object-cover w-16 h-16"
                           />
                        </Link>
                        {/* Offer Details */}
                        <div className="flex-grow">
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">收到对 <Link href={`/nft/${offer.nftId}`} className="font-medium text-primary hover:underline">{offer.nftTitle}</Link> 的报价</p>
                          <p className="text-lg font-semibold my-1">{offer.offerAmount} ETH</p>
                          <p className="text-xs text-zinc-400 dark:text-zinc-500">
                            来自 <span className="font-mono">{offer.offerFromAddress}</span> • {offer.timestamp}
                          </p>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                          <Button variant="secondary" size="sm">拒绝</Button>
                          <Button size="sm">接受</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 dark:text-zinc-400 mt-6">您目前没有收到任何报价。</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 