import React from 'react';
import { NFTCard } from '@/app/_components/ui/NFTCard';

// NFT接口定义
interface NFT {
  id: string;
  title: string;
  image: string;
  creator: string;
  price: number;
  timeAgo: string;
  collection?: string;
  collectionImage?: string;
}

interface CollectedNFTsTabProps {
  nfts: NFT[];
}

export function CollectedNFTsTab({ nfts }: CollectedNFTsTabProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 sr-only">收藏的 NFT</h2>
      {nfts.length > 0 ? (
        // 网格布局，响应不同屏幕尺寸
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nfts.map((nft) => (
            <NFTCard key={nft.id} {...nft} />
          ))}
        </div>
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400 mt-6">还没有收藏任何 NFT。</p>
      )}
    </div>
  );
} 