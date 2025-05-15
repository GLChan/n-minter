"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { Navbar } from '@/app/_components/Navbar';
import { Footer } from '@/app/_components/Footer';
import { CollectedNFTsTab, CreatedNFTsTab, ActivityTab, SettingsTab } from './_components';
import useSupabaseClient from '@/app/_lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { NFT, UserProfile } from '../_lib/types';

// TabButton组件
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

// --- Mock Data ---
const mockUser: UserProfile = {
  id: '0',
  user_id: '0',
  wallet_address: '0x0000',
  username: 'USER',
  avatar_url: 'https://mzmlztcizgitmitugcdk.supabase.co/storage/v1/object/public/avatars//avatar.png',
  bio: '简介',
  email: '',
  created_at: '',
  updated_at: '',
  website: '',
};

const collectedNFTs:NFT[] = []
//   {
//     id: 'nft-c1',
//     title: '未来都市 #001',
//     image: 'https://images.unsplash.com/photo-1517757910079-f57fd7f49a94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDl8fGZ1dHVyZSUyMGNpdHl8ZW58MHx8fHwxNjc5MDYwMDY0&ixlib=rb-4.0.3&q=80&w=400',
//     creator: '未来主义者',
//     price: 1.8,
//     timeAgo: '2周前购买',
//     collection: '未来蓝图'
//   },
//   {
//     id: 'nft-c2',
//     title: '深海迷踪',
//     image: 'https://images.unsplash.com/photo-1528795259995-96146f681353?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDV8fGRlZXAlMjBzZWF8ZW58MHx8fHwxNjc5MDYwMDg0&ixlib=rb-4.0.3&q=80&w=400',
//     creator: '海洋探索者',
//     price: 0.9,
//     timeAgo: '1个月前购买',
//   },
//   {
//     id: 'nft-c3',
//     title: '星际漫游者',
//     image: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDN8fHNwYWNlfGVufDB8fHx8MTY3OTA2MDEwMw&ixlib=rb-4.0.3&q=80&w=400',
//     creator: '宇宙画家',
//     price: 3.5,
//     timeAgo: '3天前购买',
//     collection: '银河画卷',
//     collectionImage: 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?w=40&h=40&fit=crop',
//   },
//   {
//     id: 'nft-c4',
//     title: '霓虹之夜',
//     image: 'https://images.unsplash.com/photo-1531591022136-eb8b0da1e6d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDEwfHxuZW9ufGVufDB8fHx8MTY3OTA2MDEyNQ&ixlib=rb-4.0.3&q=80&w=400',
//     creator: '光影师',
//     price: 1.1,
//     timeAgo: '刚刚购买',
//   },
// ];

const createdNFTs: NFT[] = [
  // {
  //   id: 'nft-cr1',
  //   title: '生成线条 #08',
  //   image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDEwfHxnZW5lcmF0aXZlJTIwYXJ0fGVufDB8fHx8MTY3OTA2MDE1Mg&ixlib=rb-4.0.3&q=80&w=400',
  //   creator: mockUser.username,
  //   price: 0.7,
  //   timeAgo: '1周前创建',
  //   collection: '代码之笔',
  // },
];

const profileActivities = [
  { id: 'pact-1', description: `收藏了 <span class="font-medium text-primary">星际漫游者</span> 来自 <span class="font-medium">宇宙画家</span>`, timestamp: '3 天前' },
  { id: 'pact-2', description: `创建了新的 NFT <span class="font-medium text-primary">生成线条 #08</span>`, timestamp: '1 周前' },
  { id: 'pact-3', description: `更新了个人简介`, timestamp: '2 周前' },
];
// --- End Mock Data ---

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('collected');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserProfile>(mockUser); // 真实应用中应初始化为空对象并通过API获取

  // 获取认证上下文
  const { verifiedUserData } = useAuth();
  const supabase = useSupabaseClient();

  // 获取用户资料数据并确保存储桶存在
  React.useEffect(() => {
    async function initializeProfileData() {
      if (isLoading) return
      try {
        // 如果有已验证的钱包地址，获取用户资料
        if (!verifiedUserData?.wallet) return;

        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('wallet_address', verifiedUserData.wallet)
          .single();

        if (error) {
          console.error('获取用户资料失败:', error);
          return;
        }

        if (data) {
          setUserData({
            id: data.id,
            user_id: data.user_id,
            username: data.username || mockUser.username,
            bio: data.bio || mockUser.bio,
            avatar_url: data.avatar_url || mockUser.avatar_url,
            wallet_address: data.wallet_address,
            website: data.website,
            email: data.email,
            created_at: `${new Date(data.created_at).getFullYear()}年${new Date(data.created_at).getMonth() + 1}月加入`,
            updated_at: '',
          });
        }
      } catch (error) {
        console.error('初始化用户资料时出错:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeProfileData();
  }, [verifiedUserData, supabase, isLoading]);

  // 处理Tab切换
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // 刷新用户资料
  const refreshUserProfile = async () => {
    if (!verifiedUserData?.wallet) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', verifiedUserData.wallet)
        .single();

      if (error) {
        console.error('刷新用户资料失败:', error);
        return;
      }

      if (data) {
        setUserData({
          id: data.id,
          user_id: data.user_id,
          username: data.username || mockUser.username,
          bio: data.bio || mockUser.bio,
          avatar_url: data.avatar_url || mockUser.avatar_url,
          wallet_address: data.wallet_address,
          website: data.website,
          created_at: `${new Date(data.created_at).getFullYear()}年${new Date(data.created_at).getMonth() + 1}月加入`,
          updated_at: '',
          email: ''
        });
      }
    } catch (error) {
      console.error('刷新用户资料时出错:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-zinc-300 dark:border-zinc-700 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800">
              <Image
                src={userData.avatar_url || '/placeholder-avatar.png'}
                alt={`${userData.username} Avatar`}
                fill
                sizes="(max-width: 768px) 96px, 128px"
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-1">{userData.username}</h1>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400">
                  {userData.wallet_address || verifiedUserData?.wallet || '未连接钱包'}
                </p>
                {/* Simple copy button example */}
                <button
                  title="复制地址"
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  onClick={() => {
                    const address = userData.wallet_address || verifiedUserData?.wallet || '';
                    if (address) {
                      navigator.clipboard.writeText(address);
                      alert('钱包地址已复制');
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 text-sm max-w-lg mb-3">{userData.bio}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">{userData.created_at}</p>
              {userData.website && (
                <a
                  href={userData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-1 inline-block"
                >
                  {userData.website}
                </a>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 border-b border-zinc-200 dark:border-zinc-800">
            <div className="container mx-auto px-4">
              <div className="flex space-x-2 overflow-x-auto pb-px">
                <TabButton
                  active={activeTab === 'collected'}
                  onClick={() => handleTabChange('collected')}
                >
                  已收藏
                </TabButton>
                <TabButton
                  active={activeTab === 'created'}
                  onClick={() => handleTabChange('created')}
                >
                  已创建
                </TabButton>
                <TabButton
                  active={activeTab === 'activity'}
                  onClick={() => handleTabChange('activity')}
                >
                  活动
                </TabButton>
                <TabButton
                  active={activeTab === 'settings'}
                  onClick={() => handleTabChange('settings')}
                >
                  设置
                </TabButton>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="container mx-auto px-4 py-8">
            {activeTab === 'collected' && <CollectedNFTsTab nfts={collectedNFTs} />}
            {activeTab === 'created' && <CreatedNFTsTab nfts={createdNFTs} />}
            {activeTab === 'activity' && <ActivityTab activities={profileActivities} />}
            {activeTab === 'settings' && (
              <SettingsTab
                user={userData}
                onProfileUpdated={refreshUserProfile}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 