"use client"

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '../_components/Navbar';
import { Footer } from '../_components/Footer';
import { Button } from '../_components/ui/Button';

// 模拟搜索结果类型
interface SearchResult {
  id: string;
  type: 'nft' | 'collection' | 'creator';
  title: string;
  image: string;
  price?: number;
  creatorName?: string;
  creatorImage?: string;
  description?: string;
  stats?: {
    items?: number;
    owners?: number;
    floorPrice?: number;
    volume?: number;
  };
}

// 搜索过滤器选项
const filterOptions = [
  { label: '全部', value: 'all' },
  { label: 'NFT', value: 'nft' },
  { label: '合集', value: 'collection' },
  { label: '创作者', value: 'creator' }
];

// 排序选项
const sortOptions = [
  { label: '最新发布', value: 'newest' },
  { label: '价格: 低到高', value: 'price_asc' },
  { label: '价格: 高到低', value: 'price_desc' },
  { label: '热门程度', value: 'popularity' }
];

// 模拟搜索结果
const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    type: 'nft',
    title: '数字艺术品 #123',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    price: 0.25,
    creatorName: '@digartist',
    creatorImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    description: '独特的抽象数字艺术作品，展现了现代艺术的多样性与创新。'
  },
  {
    id: '2',
    type: 'nft',
    title: '加密朋克 #456',
    image: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=400&auto=format&fit=crop&q=80',
    price: 1.5,
    creatorName: '@cryptomaker',
    creatorImage: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&auto=format&fit=crop&q=80',
    description: '经典风格的像素艺术，灵感来源于加密朋克文化。'
  },
  {
    id: '3',
    type: 'collection',
    title: '元宇宙角色',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&auto=format&fit=crop&q=80',
    description: '一系列为元宇宙设计的独特角色，每个都有独特的特性和背景故事。',
    stats: {
      items: 1000,
      owners: 450,
      floorPrice: 0.15,
      volume: 120
    }
  },
  {
    id: '4',
    type: 'creator',
    title: 'MetaArtist',
    image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
    description: '专注于元宇宙艺术创作的艺术家，作品融合了现实与虚拟世界的元素。'
  },
  {
    id: '5',
    type: 'nft',
    title: '游戏资产 #789',
    image: 'https://images.unsplash.com/photo-1640690821275-c6aa2b75f074?w=400&auto=format&fit=crop&q=80',
    price: 0.08,
    creatorName: '@gamedev',
    creatorImage: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&auto=format&fit=crop&q=80',
    description: '游戏内可用的独特道具，赋予玩家特殊能力。'
  },
  {
    id: '6',
    type: 'collection',
    title: '音乐NFT合集',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
    description: '由知名音乐艺术家创作的限量版音乐NFT，包含独家音轨和视觉效果。',
    stats: {
      items: 50,
      owners: 30,
      floorPrice: 0.5,
      volume: 25
    }
  }
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<SearchResult[]>([]);
  
  // 模拟搜索过程
  useEffect(() => {
    if (query) {
      setIsLoading(true);
      
      // 模拟API请求延迟
      const timer = setTimeout(() => {
        // 过滤搜索结果
        const filtered = mockSearchResults.filter(result => {
          // 如果激活的过滤器不是"全部"，则按类型过滤
          if (activeFilter !== 'all' && result.type !== activeFilter) {
            return false;
          }
          
          // 简单的文本匹配
          return (
            result.title.toLowerCase().includes(query.toLowerCase()) ||
            (result.description && result.description.toLowerCase().includes(query.toLowerCase())) ||
            (result.creatorName && result.creatorName.toLowerCase().includes(query.toLowerCase()))
          );
        });
        
        // 排序结果
        const sortedResults = [...filtered];
        switch (sortBy) {
          case 'price_asc':
            sortedResults.sort((a, b) => (a.price || 0) - (b.price || 0));
            break;
          case 'price_desc':
            sortedResults.sort((a, b) => (b.price || 0) - (a.price || 0));
            break;
          case 'popularity':
            // 这里可以根据实际需求实现不同的排序逻辑
            break;
          default:
            // 默认按最新排序，这里不做特殊处理
            break;
        }
        
        setResults(sortedResults);
        setIsLoading(false);
      }, 800);
      
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsLoading(false);
    }
  }, [query, activeFilter, sortBy]);
  
  // 渲染NFT项
  const renderNFTItem = (item: SearchResult) => (
    <Link href={`/nft/${item.id}`} key={item.id} className="block group">
      <div className="rounded-xl overflow-hidden bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-shadow hover:shadow-lg">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center mb-2">
            <div className="relative w-6 h-6 rounded-full overflow-hidden mr-2">
              <Image
                src={item.creatorImage || ''}
                alt="Creator"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{item.creatorName}</span>
          </div>
          <h3 className="font-medium text-lg mb-1 truncate">{item.title}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-6.516c.273.047.55.07.83.07 1.347 0 2.588-.5 3.532-1.338.942-.837 1.587-2.004 1.744-3.278.017-.123.024-.238.024-.357 0-.642-.122-1.278-.357-1.866-1.258.227-2.363.992-3.076 2.042-.713 1.05-1.05 2.33-.933 3.598a5.102 5.102 0 01-1.764-1.302zM10 12c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2z" fill="currentColor" />
              </svg>
              <span className="font-medium">{item.price} ETH</span>
            </div>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              查看
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
  
  // 渲染合集项
  const renderCollectionItem = (item: SearchResult) => (
    <Link href={`/collections/${item.id}`} key={item.id} className="block group">
      <div className="rounded-xl overflow-hidden bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-shadow hover:shadow-lg">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="font-medium text-lg mb-2">{item.title}</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">{item.description}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 bg-zinc-50 dark:bg-zinc-700 rounded">
              <p className="text-zinc-500 dark:text-zinc-400">地板价</p>
              <p className="font-medium">{item.stats?.floorPrice} ETH</p>
            </div>
            <div className="p-2 bg-zinc-50 dark:bg-zinc-700 rounded">
              <p className="text-zinc-500 dark:text-zinc-400">总交易量</p>
              <p className="font-medium">{item.stats?.volume} ETH</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
  
  // 渲染创作者项
  const renderCreatorItem = (item: SearchResult) => (
    <Link href={`/creator/${item.id}`} key={item.id} className="block group">
      <div className="rounded-xl overflow-hidden bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-shadow hover:shadow-lg">
        <div className="p-6 flex items-center">
          <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-medium text-lg mb-1">{item.title}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">{item.description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
  
  // 渲染搜索结果
  const renderSearchResults = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-500 mb-4"></div>
          <p className="text-zinc-500 dark:text-zinc-400">搜索中...</p>
        </div>
      );
    }
    
    if (results.length === 0) {
      return (
        <div className="text-center py-20">
          <svg className="mx-auto h-12 w-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium">未找到结果</h3>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">抱歉，没有找到与&quot;{query}&quot;相关的内容</p>
          <div className="mt-6">
            <Button onClick={() => window.history.back()}>返回</Button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result) => {
          switch (result.type) {
            case 'nft':
              return renderNFTItem(result);
            case 'collection':
              return renderCollectionItem(result);
            case 'creator':
              return renderCreatorItem(result);
            default:
              return null;
          }
        })}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* 页面标题和搜索栏 */}
        <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">搜索结果: {query}</h1>
            <div className="relative max-w-2xl">
              <form action="/search" method="get">
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="搜索 NFT、合集或创作者..."
                  className="w-full px-4 py-3 pl-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 absolute left-3 top-3.5 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <button type="submit" className="hidden">搜索</button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          {/* 筛选器和排序选项 */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
            {/* 筛选选项 */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  className={`px-4 py-2 rounded-full text-sm ${
                    activeFilter === option.value
                      ? 'bg-foreground text-background hover:bg-zinc-800 dark:hover:bg-zinc-200'
                      : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                  onClick={() => setActiveFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            {/* 排序选项 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">排序:</span>
              <select
                className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* 搜索结果数量 */}
          {!isLoading && results.length > 0 && (
            <p className="mb-6 text-zinc-500 dark:text-zinc-400">
              找到 {results.length} 个与 &quot;{query}&quot; 相关的结果
            </p>
          )}
          
          {/* 搜索结果 */}
          {renderSearchResults()}
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 