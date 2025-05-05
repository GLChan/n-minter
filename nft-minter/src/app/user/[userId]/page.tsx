"use client"

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/app/_components/Navbar';
import { Footer } from '@/app/_components/Footer';
import { Button } from '@/app/_components/ui/Button';
import { NFTCard } from '@/app/_components/ui/NFTCard'; // Assuming NFTCard is reusable
import { ExternalLink, Rss } from 'lucide-react'; // Example icons

// Reusing TabButton component (or import if refactored)
interface TabButtonProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

const TabButton = ({ children, active, onClick }: TabButtonProps) => (
  <button
    onClick={onClick}
    // Slightly different style for profile tabs to match image
    className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors
      ${active
        ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
        : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200'}\
    `}
  >
    {children}
  </button>
);

// --- Mock Data for Sample User ---
const sampleUser = {
  userId: 'barkr',
  username: 'Barkr',
  verified: true,
  avatar: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDV8fGRvZ3xlbnwwfHx8fDE2NzkwNjEwODA&ixlib=rb-4.0.3&q=80&w=128&h=128', // Dog avatar
  bio: 'tag @barkr on warpcast to launch your dogcoin and earn a % of the fees!',
  followers: 73,
  following: 3,
  externalLink: 'barkr.xyz', // Example link
};

const userPosts = [
  {
    id: 'post-1',
    title: '白雪小狗',
    image: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDEwfHxwdXBweXxlbnwwfHx8fDE2NzkwNjExMzA&ixlib=rb-4.0.3&q=80&w=400',
    creator: sampleUser.username,
    price: 0.1,
    timeAgo: '2小时前',
  },
  {
    id: 'post-2',
    title: '漫画猫咪',
    image: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDR8fGNhdHxlbnwwfHx8fDE2NzkwNjExNjQ&ixlib=rb-4.0.3&q=80&w=400',
    creator: sampleUser.username,
    price: 0.2,
    timeAgo: '5小时前',
    collection: '卡通伙伴'
  },
  {
    id: 'post-3',
    title: '意大利灵缇',
    image: 'https://images.unsplash.com/photo-1504595403659-9088ce801e29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDF8fGdyZXlob3VuZHxlbnwwfHx8fDE2NzkwNjExOTE&ixlib=rb-4.0.3&q=80&w=400',
    creator: sampleUser.username,
    price: 0.5,
    timeAgo: '1天前',
  },
  {
    id: 'post-4',
    title: '像素狗狗 x3',
    image: 'https://images.unsplash.com/photo-1611140059333-669648e975a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDEwfHxwaXhlbCUyMGFydHxlbnwwfHx8fDE2NzkwNjEyMTc&ixlib=rb-4.0.3&q=80&w=400',
    creator: sampleUser.username,
    price: 1.0,
    timeAgo: '2天前',
    collection: '像素宠物'
  },
  {
    id: 'post-5',
    title: '吉娃娃思考者',
    image: 'https://images.unsplash.com/photo-1605915492173-353446555891?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDV8fGNoaWh1YWh1YXxlbnwwfHx8fDE2NzkwNjEyNDQ&ixlib=rb-4.0.3&q=80&w=400',
    creator: sampleUser.username,
    price: 0.3,
    timeAgo: '3天前',
  },
  {
    id: 'post-6',
    title: '酷盖蓝狗',
    image: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDE1fHxibHVlJTIwZG9nfGVufDB8fHx8MTY3OTA2MTI3MA&ixlib=rb-4.0.3&q=80&w=400',
    creator: sampleUser.username,
    price: 0.8,
    timeAgo: '4天前',
    collection: 'Cool Dogs Club'
  },
  // Add more posts based on the image...
];

const userHoldings = [
  {
    id: 'hold-1',
    title: '可爱小狗',
    image: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDN8fHB1cHB5fGVufDB8fHx8MTY3OTA2MTEzMA&ixlib=rb-4.0.3&q=80&w=400',
    creator: '宠物摄影师',
    price: 0.05,
    timeAgo: '收藏于1周前',
    collection: '萌宠瞬间'
  },
  {
    id: 'hold-2',
    title: '黑犬标志',
    image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDN8fGJsYWNrJTIwZG9nfGVufDB8fHx8MTY3OTA2MTMxNQ&ixlib=rb-4.0.3&q=80&w=400',
    creator: '设计工作室',
    price: 1.5,
    timeAgo: '收藏于3天前',
  },
  {
    id: 'hold-3',
    title: '草地上的狗狗',
    image: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDZ8fGRvZ3xlbnwwfHx8fDE2NzkwNjEwODA&ixlib=rb-4.0.3&q=80&w=400',
    creator: '自然爱好者',
    price: 0.4,
    timeAgo: '收藏于1个月前',
  },
  // Add more holdings if needed
];
// --- End Mock Data ---

type UserProfilePageProps = {
  params: {
    userId: string;
  };
};

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const [activeTab, setActiveTab] = React.useState('posts'); // 'posts' or 'holdings'
  const { userId } = params;

  // In a real app, fetch user data based on userId
  const user = sampleUser; // Use mock data for now
  const posts = userPosts;
  const holdings = userHoldings;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Profile Header -参考图片布局 */}
          <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
            {/* Avatar */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-zinc-300 dark:border-zinc-700 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 mx-auto sm:mx-0">
              <Image
                src={user.avatar}
                alt={`${user.username} Avatar`}
                fill
                sizes="(max-width: 640px) 96px, 128px"
                className="object-cover"
              />
            </div>
            {/* User Info & Follow Button */}
            <div className="flex-1 flex flex-col sm:flex-row items-start w-full">
              <div className="flex-1 mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  {user.username}
                  {user.verified && (
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  )}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mb-2">@{userId}</p> {/* Displaying route param */}
                <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3 max-w-lg">{user.bio}</p>
                <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  <span><span className="font-semibold text-zinc-900 dark:text-zinc-100">{user.followers}</span> followers</span>
                  <span><span className="font-semibold text-zinc-900 dark:text-zinc-100">{user.following}</span> following</span>
                </div>
                {user.externalLink && (
                  <Link href={`https://${user.externalLink}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400">
                    <ExternalLink size={14} />
                    {user.externalLink}
                  </Link>
                )}
              </div>
              <div className="flex-shrink-0 ml-auto">
                <Button size="lg">Follow</Button>
              </div>
            </div>
          </div>

          {/* Tab Navigation - 参考图片样式 */}
          <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800">
            <nav className="flex -mb-px" aria-label="Tabs">
              <TabButton active={activeTab === 'posts'} onClick={() => setActiveTab('posts')}>Posts ({posts.length})</TabButton>
              <TabButton active={activeTab === 'holdings'} onClick={() => setActiveTab('holdings')}>Holdings ({holdings.length})</TabButton>
            </nav>
          </div>

          {/* Tab Content - 参考图片网格布局 (3列) */}
          <div>
            {activeTab === 'posts' && (
              <div>
                {posts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {posts.map((nft) => (
                      <NFTCard key={nft.id} {...nft} />
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 dark:text-zinc-400 mt-6">{user.username}还没有发布任何内容。</p>
                )}
              </div>
            )}

            {activeTab === 'holdings' && (
              <div>
                {holdings.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {holdings.map((nft) => (
                      <NFTCard key={nft.id} {...nft} />
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 dark:text-zinc-400 mt-6">{user.username}还没有持有任何藏品。</p>
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