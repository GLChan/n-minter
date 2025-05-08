'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { NFTCard } from '@/app/_components/ui/NFTCard';
import { NFTSkeleton } from './NFTSkeleton';
import { useNFTs } from '@/app/_lib/hooks/useNFTs';
import { formatIPFSUrl } from '@/app/_lib/utils';

// 处理钱包地址显示的辅助函数
const shortenAddress = (address: string) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// 从多个可能的图片来源获取图片URL
const getImageUrl = (nft: any) => {
  // 直接使用image_url字段
  if (nft.image_url) return formatIPFSUrl(nft.image_url);
  
  // 从metadata中获取图片URL
  if (nft.metadata && typeof nft.metadata === 'object' && nft.metadata.image) {
    return formatIPFSUrl(nft.metadata.image);
  }
  
  // 如果metadata是字符串，尝试解析它
  if (nft.metadata && typeof nft.metadata === 'string') {
    try {
      const parsedMetadata = JSON.parse(nft.metadata);
      if (parsedMetadata.image) return formatIPFSUrl(parsedMetadata.image);
    } catch (e) {
      // 解析失败，忽略错误
    }
  }
  
  // 如果有metadata_url，可以考虑使用它作为图像源
  if (nft.metadata_url) return formatIPFSUrl(nft.metadata_url);
  
  // 没有找到图片，返回占位符
  return '/placeholder-image.png';
};

// 获取代币ID或名称显示
const getTitle = (nft: any) => {
  if (nft.name) return nft.name;
  if (nft.token_id) return `NFT #${nft.token_id}`;
  return 'Untitled NFT';
};

export function OwnedNFTsTab() {
  // 使用自定义钩子获取NFT列表
  const {
    nfts,
    isLoading,
    error,
    total,
    page,
    totalPages,
    setPage,
    setLimit,
    refetch
  } = useNFTs(1, 10);

  // 分页处理函数
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  // 条目选择处理函数
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    setPage(1); // 重置到第一页
  };

  // 渲染分页控件
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          显示 {total} 个NFT中的 {(page - 1) * 10 + 1}-{Math.min(page * 10, total)} 个
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={10} 
            onChange={handleLimitChange}
            className="text-sm border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1 bg-white dark:bg-zinc-800"
          >
            <option value={5}>每页5个</option>
            <option value={10}>每页10个</option>
            <option value={20}>每页20个</option>
            <option value={50}>每页50个</option>
          </select>
          
          <button 
            onClick={handlePrevPage} 
            disabled={page <= 1}
            className="p-1 rounded-md border border-zinc-200 dark:border-zinc-700 disabled:opacity-50"
          >
            <ChevronLeft size={18} />
          </button>
          
          <span className="text-sm px-2">
            第 {page} 页，共 {totalPages} 页
          </span>
          
          <button 
            onClick={handleNextPage} 
            disabled={page >= totalPages}
            className="p-1 rounded-md border border-zinc-200 dark:border-zinc-700 disabled:opacity-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  // 渲染主要内容
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 sr-only">我拥有的 NFT</h2>
      
      {isLoading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <NFTSkeleton key={index} />
            ))}
          </div>
          <div className="flex justify-center mt-6">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-zinc-500 dark:text-zinc-400">加载中...</span>
          </div>
        </>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">加载 NFT 时出错:</p>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={() => refetch()} 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md text-sm"
          >
            重试
          </button>
        </div>
      ) : nfts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {nfts.map((nft) => (
              <NFTCard 
                key={nft.id} 
                id={nft.id} 
                title={getTitle(nft)}
                image={getImageUrl(nft) || ''}
                creator={shortenAddress(nft.owner_address)}
                price={0} // 占位符，可从metadata中获取实际价格
                timeAgo={new Date(nft.created_at).toLocaleString()} 
              />
            ))}
          </div>
          
          {renderPagination()}
        </>
      ) : (
        <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">您目前还没有任何 NFT</p>
          <Link 
            href="/create" 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            开始创建 NFT
          </Link>
        </div>
      )}
    </div>
  );
} 