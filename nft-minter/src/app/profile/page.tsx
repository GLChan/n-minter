"use client"
import React from 'react';
import Image from 'next/image';
import { Navbar } from '@/app/_components/Navbar';
import { Footer } from '@/app/_components/Footer';
import { Button } from '@/app/_components/ui/Button';
import { NFTCard } from '@/app/_components/ui/NFTCard';

// Reusing TabButton and PlaceholderNFTCard from Dashboard example (or import if refactored)
interface TabButtonProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

const TabButton = ({ children, active, onClick }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors 
      ${active
        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 hover:text-zinc-700 dark:hover:text-zinc-200'}
    `}
  >
    {children}
  </button>
);

const PlaceholderNFTCard = ({ id }: { id: number }) => (
  <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
    <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 animate-pulse"></div>
    <div className="p-3">
      <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-2 animate-pulse"></div>
      <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2 animate-pulse"></div>
    </div>
  </div>
);

// Placeholder for form inputs (you'd likely use a form library)
const InputField = ({ label, id, ...props }: { label: string; id: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
      {label}
    </label>
    <input
      id={id}
      className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      {...props}
    />
  </div>
);

// --- Mock Data ---
const user = {
  address: '0x7E3a...f9B2',
  username: '数字艺术收藏家',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDh8fGF2YXRhcnxlbnwwfHx8fDE2NzkwNjAwMzA&ixlib=rb-4.0.3&q=80&w=128&h=128', // images.unsplash.com URL
  bio: '探索区块链上的艺术边界。专注于生成艺术和虚拟现实体验。欢迎交流！',
  joinedDate: '2023年10月加入'
};

const collectedNFTs = [
  {
    id: 'nft-c1',
    title: '未来都市 #001',
    image: 'https://images.unsplash.com/photo-1517757910079-f57fd7f49a94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDl8fGZ1dHVyZSUyMGNpdHl8ZW58MHx8fHwxNjc5MDYwMDY0&ixlib=rb-4.0.3&q=80&w=400',
    creator: '未来主义者',
    price: 1.8,
    timeAgo: '2周前购买',
    collection: '未来蓝图'
  },
  {
    id: 'nft-c2',
    title: '深海迷踪',
    image: 'https://images.unsplash.com/photo-1528795259995-96146f681353?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDV8fGRlZXAlMjBzZWF8ZW58MHx8fHwxNjc5MDYwMDg0&ixlib=rb-4.0.3&q=80&w=400',
    creator: '海洋探索者',
    price: 0.9,
    timeAgo: '1个月前购买',
  },
  {
    id: 'nft-c3',
    title: '星际漫游者',
    image: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDN8fHNwYWNlfGVufDB8fHx8MTY3OTA2MDEwMw&ixlib=rb-4.0.3&q=80&w=400',
    creator: '宇宙画家',
    price: 3.5,
    timeAgo: '3天前购买',
    collection: '银河画卷',
    collectionImage: 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?w=40&h=40&fit=crop',
  },
  {
    id: 'nft-c4', // Added one more to potentially fill a row
    title: '霓虹之夜',
    image: 'https://images.unsplash.com/photo-1531591022136-eb8b0da1e6d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDEwfHxuZW9ufGVufDB8fHx8MTY3OTA2MDEyNQ&ixlib=rb-4.0.3&q=80&w=400',
    creator: '光影师',
    price: 1.1,
    timeAgo: '刚刚购买',
  },
];

const createdNFTs = [
  {
    id: 'nft-cr1',
    title: '生成线条 #08',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDEwfHxnZW5lcmF0aXZlJTIwYXJ0fGVufDB8fHx8MTY3OTA2MDE1Mg&ixlib=rb-4.0.3&q=80&w=400',
    creator: user.username,
    price: 0.7,
    timeAgo: '1周前创建',
    collection: '代码之笔',
  },
  // Add more created NFTs if desired
];

const profileActivities = [
  { id: 'pact-1', description: `收藏了 <span class="font-medium text-primary">星际漫游者</span> 来自 <span class="font-medium">宇宙画家</span>`, timestamp: '3 天前' },
  { id: 'pact-2', description: `创建了新的 NFT <span class="font-medium text-primary">生成线条 #08</span>`, timestamp: '1 周前' },
  { id: 'pact-3', description: `更新了个人简介`, timestamp: '2 周前' },
];
// --- End Mock Data ---

export default function ProfilePage() {
  const [activeTab, setActiveTab] = React.useState('collected'); // Example state

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-zinc-300 dark:border-zinc-700 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800">
              <Image
                src={user.avatar}
                alt={`${user.username} Avatar`}
                fill
                sizes="(max-width: 768px) 96px, 128px"
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-1">{user.username}</h1>
              <div className="flex items-center gap-2 mb-2">
                 <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400">{user.address}</p>
                 {/* Simple copy button example */}
                 <button title="复制地址" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                   </svg>
                 </button>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 text-sm max-w-lg mb-3">{user.bio}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">{user.joinedDate}</p>
              {/* Add social links or other info here */}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800">
            <nav className="flex space-x-2 overflow-x-auto pb-px" aria-label="Tabs">
              <TabButton active={activeTab === 'collected'} onClick={() => setActiveTab('collected')}>收藏的 ({collectedNFTs.length})</TabButton>
              <TabButton active={activeTab === 'created'} onClick={() => setActiveTab('created')}>创建的 ({createdNFTs.length})</TabButton>
              <TabButton active={activeTab === 'activity'} onClick={() => setActiveTab('activity')}>活动</TabButton>
              <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>设置</TabButton>
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'collected' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 sr-only">收藏的 NFT</h2>
                 {collectedNFTs.length > 0 ? (
                   // Updated grid classes
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {collectedNFTs.map((nft) => (
                      <NFTCard key={nft.id} {...nft} />
                    ))}
                  </div>
                 ) : (
                   <p className="text-zinc-500 dark:text-zinc-400 mt-6">还没有收藏任何 NFT。</p>
                 )}
              </div>
            )}

            {activeTab === 'created' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 sr-only">创建的 NFT</h2>
                 {createdNFTs.length > 0 ? (
                   // Updated grid classes
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {createdNFTs.map((nft) => (
                      <NFTCard key={nft.id} {...nft} />
                    ))}
                  </div>
                 ) : (
                  <p className="text-zinc-500 dark:text-zinc-400 mt-6">还没有创建任何 NFT。</p>
                 )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">活动记录</h2>
                 {profileActivities.length > 0 ? (
                   <div className="space-y-4">
                    {profileActivities.map((activity) => (
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

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">个人资料设置</h2>
                <div className="max-w-md space-y-6">
                  <InputField label="用户名" id="username" defaultValue={user.username} />
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      个人简介
                    </label>
                    <textarea
                      id="bio"
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      defaultValue={user.bio}
                    ></textarea>
                  </div>
                  <InputField label="邮箱地址 (可选)" id="email" type="email" placeholder="you@example.com" />
                  {/* Add fields for social links etc. */}
                  <Button type="button" size="lg">
                    保存更改
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 