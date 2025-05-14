import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { NFT } from '@/app/_lib/types';
import { formatIPFSUrl } from '@/app/_lib/utils';

// interface NFTCardProps {
//   nft: NFT;
// }

// 处理钱包地址显示的辅助函数
const shortenAddress = (address: string) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// 获取代币ID或名称显示
const getTitle = (nft: any) => {
  if (nft.name) return nft.name;
  if (nft.token_id) return `NFT #${nft.token_id}`;
  return 'Untitled NFT';
};

export const NFTCard: React.FC<{
  nft: NFT;
}> = ({ nft }) => {
  if (!nft) return <></>
  let { name, id } = nft

  let imageUrl = nft.image_url ? formatIPFSUrl(nft.image_url) : ''
  let
    creator,
    price,
    timeAgo,
    collection,
    collectionImage
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-700 transition-transform hover:translate-y-[-4px] hover:shadow-lg">
      <Link href={`/nft/${id}`}>
        <div className="relative aspect-square overflow-hidden group">
          {imageUrl ? <Image
            src={imageUrl}
            alt={name}
            fill
            priority
            className="object-cover transition-transform group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          /> : <></>}
          {collection && (
            <div className="absolute top-2 left-2">
              <div className="flex items-center bg-white/80 dark:bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
                {collectionImage && (
                  <div className="relative w-5 h-5 mr-1.5 rounded-full overflow-hidden">
                    <Image
                      src={collectionImage}
                      alt={collection}
                      fill
                      className="object-cover"
                      sizes="20px"
                    />
                  </div>
                )}
                <span className="text-xs truncate max-w-[100px]">{collection}</span>
              </div>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex justify-between mb-2">
          <h3 className="font-medium text-base truncate max-w-[70%]">{name}</h3>
          <div className="flex items-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1"
            >
              <path
                d="M7.99984 14.6667C-0.333496 9.33334 1.33317 4.00001 7.99984 7.33334C14.6665 4.00001 16.3332 9.33334 7.99984 14.6667Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">10</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
            创作者: <span className="text-primary font-medium">{creator}</span>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">{timeAgo}</div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-zinc-500 dark:text-zinc-400 mr-1"
            >
              <path
                d="M8.00033 1.33334L5.17033 6.00668L0.00033328 6.82668L4.00033 10.514L3.00033 15.3333L8.00033 13L13.0003 15.3333L12.0003 10.514L16.0003 6.82668L10.8303 6.00668L8.00033 1.33334Z"
                fill="currentColor"
              />
            </svg>
            <span className="font-bold">{price} ETH</span>
          </div>
          <Link
            href={`/nft/${id}`}
            className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
          >
            查看详情
          </Link>
        </div>
      </div>
    </div>
  );
}; 