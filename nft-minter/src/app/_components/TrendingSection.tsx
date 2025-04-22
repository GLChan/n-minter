'use client';

import { useState } from 'react';
import NFTCard from './NFTCard';

// 示例数据
const TRENDING_DATA = [
  {
    id: '1',
    name: 'Base星球',
    image: '/images/placeholder1.jpg',
    creator: 'base',
    price: '0.05',
    collection: 'Base系列',
    timeLeft: '6d'
  },
  {
    id: '2',
    name: '青蛙NFT',
    image: '/images/placeholder2.jpg',
    creator: 'frog',
    price: '0.03',
    collection: 'Ripe系列',
    timeLeft: '1d'
  },
  {
    id: '3',
    name: '数字藏品#3452',
    image: '/images/placeholder3.jpg',
    creator: 'cryptomfer',
    price: '0.02',
    collection: 'Cryptomfer系列',
    timeLeft: '5d'
  },
  {
    id: '4',
    name: '元宇宙空间站',
    image: '/images/placeholder4.jpg',
    creator: 'metaverse',
    price: '0.08',
    collection: '元宇宙系列',
    timeLeft: '2d'
  }
];

const TrendingSection = () => {
  // 可以添加不同时间范围的过滤器
  const [timeFilter, setTimeFilter] = useState('today'); // today, week, month
  
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">今日热门</h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-3 py-1 text-sm rounded-full ${
                timeFilter === 'today'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              }`}
            >
              今日
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-3 py-1 text-sm rounded-full ${
                timeFilter === 'week'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              }`}
            >
              本周
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-3 py-1 text-sm rounded-full ${
                timeFilter === 'month'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              }`}
            >
              本月
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRENDING_DATA.map((nft) => (
            <NFTCard key={nft.id} {...nft} />
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-900">
            查看更多
          </button>
        </div>
      </div>
    </section>
  );
};

export default TrendingSection; 