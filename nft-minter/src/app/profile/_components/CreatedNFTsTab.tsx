import React from 'react';
import { NFTCard } from '@/app/_components/ui/NFTCard';
import { NFTInfo } from '@/app/_lib/types';


const nfts: NFTInfo[] = [
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
export function CreatedNFTsTab() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 sr-only">创建的 NFT</h2>
      {nfts.length > 0 ? (
        // 网格布局，响应不同屏幕尺寸
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nfts.map((nft) => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
        </div>
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400 mt-6">还没有创建任何 NFT。</p>
      )}
    </div>
  );
} 