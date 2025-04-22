"use client"

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/app/_components/Navbar';
import { Footer } from '@/app/_components/Footer';
import { Button } from '@/app/_components/ui/Button';
import { formatPrice, formatAddress } from '@/lib/utils';

interface NFTDetailsProps {
  params: {
    id: string;
  };
}

export default function NFTDetails({ params }: NFTDetailsProps) {
  // 在实际应用中，这里应该从API获取NFT数据
  const nft = {
    id: '1',
    title: '数字生活 #457',
    description: '这是一个数字生活系列NFT，展示了未来世界中的日常场景，结合了科技与自然元素，呈现出独特的艺术风格。',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    creator: {
      name: '@digitalartist',
      address: '0x1234567890123456789012345678901234567890',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop'
    },
    owner: {
      name: '@collector',
      address: '0x9876543210987654321098765432109876543210',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop'
    },
    collection: {
      name: '数字生活系列',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
    },
    price: 2.5,
    currency: 'ETH',
    mintDate: '2023-08-15',
    tokenId: 457,
    attributes: [
      { trait_type: '背景', value: '蓝色' },
      { trait_type: '风格', value: '赛博朋克' },
      { trait_type: '材质', value: '金属' },
      { trait_type: '稀有度', value: '稀有' }
    ],
    history: [
      { event: '铸造', from: '0x00000', to: '0x1234...7890', price: 0, date: '2023-08-15' },
      { event: '出售', from: '0x1234...7890', to: '0x9876...3210', price: 2.5, date: '2023-09-21' },
      { event: '上架', from: '0x9876...3210', to: '0x9876...3210', price: 3.0, date: '2023-10-05' },
      { event: '出价', from: '0x7654...2109', to: '0x9876...3210', price: 2.8, date: '2023-10-08' },
      { event: '出价', from: '0xabcd...ef01', to: '0x9876...3210', price: 3.1, date: '2023-10-12' },
      { event: '接受出价', from: '0x9876...3210', to: '0xabcd...ef01', price: 3.1, date: '2023-10-15' },
      { event: '转让', from: '0xabcd...ef01', to: '0x4567...890a', price: 0, date: '2023-11-03' },
      { event: '上架', from: '0x4567...890a', to: '0x4567...890a', price: 4.5, date: '2023-12-01' },
      { event: '降价', from: '0x4567...890a', to: '0x4567...890a', price: 3.8, date: '2023-12-20' },
      { event: '购买', from: '0x4567...890a', to: '0xfedc...ba98', price: 3.8, date: '2024-01-10' },
      { event: '拍卖开始', from: '0xfedc...ba98', to: '0xfedc...ba98', price: 4.0, date: '2024-02-05' },
      { event: '出价', from: '0x1357...2468', to: '0xfedc...ba98', price: 4.2, date: '2024-02-07' },
      { event: '出价', from: '0x8642...7531', to: '0xfedc...ba98', price: 4.5, date: '2024-02-08' },
      { event: '拍卖结束', from: '0xfedc...ba98', to: '0x8642...7531', price: 4.5, date: '2024-02-10' }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* 左侧 NFT 图片 */}
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <Image 
                src={nft.image} 
                alt={nft.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* 右侧 NFT 信息 */}
            <div className="flex flex-col gap-6">
              {/* 集合信息 */}
              {nft.collection && (
                <Link href={`/collections/${nft.collection.name}`} className="flex items-center gap-2">
                  <div className="relative w-6 h-6 rounded-full overflow-hidden">
                    <Image 
                      src={nft.collection.image} 
                      alt={nft.collection.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm">{nft.collection.name}</span>
                </Link>
              )}
              
              {/* NFT 标题 */}
              <h1 className="text-3xl font-bold">{nft.title}</h1>
              
              {/* 创作者和拥有者 */}
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-zinc-500">创作者</span>
                  <Link href={`/profile/${nft.creator.address}`} className="flex items-center gap-2">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden">
                      <Image 
                        src={nft.creator.avatar} 
                        alt={nft.creator.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium">{nft.creator.name}</span>
                  </Link>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-zinc-500">当前拥有者</span>
                  <Link href={`/profile/${nft.owner.address}`} className="flex items-center gap-2">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden">
                      <Image 
                        src={nft.owner.avatar} 
                        alt={nft.owner.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium">{nft.owner.name}</span>
                  </Link>
                </div>
              </div>
              
              {/* 描述 */}
              <div className="mt-4">
                <h2 className="text-lg font-semibold mb-2">描述</h2>
                <p className="text-zinc-700 dark:text-zinc-300">{nft.description}</p>
              </div>
              
              {/* 价格和购买 */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl mt-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-sm text-zinc-500">当前价格</span>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold">{nft.price}</span>
                      <span className="text-lg">{nft.currency}</span>
                    </div>
                  </div>
                  <Button size="lg">购买此 NFT</Button>
                </div>
              </div>
              
              {/* 属性 */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-3">属性</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {nft.attributes.map((attr, index) => (
                    <div 
                      key={index} 
                      className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3 flex flex-col items-center"
                    >
                      <span className="text-xs text-zinc-500 mb-1">{attr.trait_type}</span>
                      <span className="text-sm font-medium">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 交易历史 */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-3">交易历史</h2>
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                  <div className="max-h-80 overflow-y-auto relative">
                    <table className="w-full">
                      <thead className="bg-zinc-50 dark:bg-zinc-900 sticky top-0 z-10">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium">事件</th>
                          <th className="text-left p-3 text-sm font-medium">价格</th>
                          <th className="text-left p-3 text-sm font-medium">来源</th>
                          <th className="text-left p-3 text-sm font-medium">目标</th>
                          <th className="text-left p-3 text-sm font-medium">日期</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nft.history.map((event, index) => (
                          <tr key={index} className="border-t border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-sm">{event.event}</td>
                            <td className="p-3 text-sm">{event.price > 0 ? `${event.price} ETH` : '-'}</td>
                            <td className="p-3 text-sm">{formatAddress(event.from)}</td>
                            <td className="p-3 text-sm">{formatAddress(event.to)}</td>
                            <td className="p-3 text-sm">{event.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 