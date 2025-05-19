import React from 'react';
import { NFTCard } from '@/app/_components/ui/NFTCard';
import { NFT, NFTInfo } from '@/app/_lib/types';

const nfts: NFTInfo[] = []
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

export function CollectedNFTsTab() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 sr-only">收藏的 NFT</h2>
      {nfts.length > 0 ? (
        // 网格布局，响应不同屏幕尺寸
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nfts.map((nft) => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
        </div>
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400 mt-6">还没有收藏任何 NFT。</p>
      )}
    </div>
  );
} 