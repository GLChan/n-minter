import React from 'react';
import { NFTCard } from '@/app/_components/ui/NFTCard';
import { NFT } from '@/app/_lib/types';

export function CreatedNFTsTab({ nfts }: {
  nfts: NFT[];
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 sr-only">创建的 NFT</h2>
      {nfts.length > 0 ? (
        // 网格布局，响应不同屏幕尺寸
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nfts.map((nft) => (
            <NFTCard key={nft.id} {...nft} />
          ))}
        </div>
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400 mt-6">还没有创建任何 NFT。</p>
      )}
    </div>
  );
} 