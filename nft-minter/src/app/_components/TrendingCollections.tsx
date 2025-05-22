'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/app/_lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  image: string;
  volume: number;
  floorPrice: number;
  timeFrame: string;
}

const mockCollections: Collection[] = [
  {
    id: '1',
    name: 'base',
    image: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400&auto=format&fit=crop&q=80',
    volume: 6300000,
    floorPrice: 2303730,
    timeFrame: '6d'
  },
  {
    id: '2',
    name: 'frog',
    image: 'https://images.unsplash.com/photo-1502780402662-acc01c084a25?w=400&auto=format&fit=crop&q=80',
    volume: 185500,
    floorPrice: 257814,
    timeFrame: '1d'
  },
  {
    id: '3',
    name: '$cum',
    image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&auto=format&fit=crop&q=80',
    volume: 198800,
    floorPrice: 257074,
    timeFrame: '5d'
  },
  {
    id: '4',
    name: 'base',
    image: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400&auto=format&fit=crop&q=80',
    volume: 6300000,
    floorPrice: 2303730,
    timeFrame: '6d'
  },
  {
    id: '5',
    name: 'frog',
    image: 'https://images.unsplash.com/photo-1502780402662-acc01c084a25?w=400&auto=format&fit=crop&q=80',
    volume: 185500,
    floorPrice: 257814,
    timeFrame: '1d'
  },
  {
    id: '6',
    name: '$cum',
    image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&auto=format&fit=crop&q=80',
    volume: 198800,
    floorPrice: 257074,
    timeFrame: '5d'
  },
  {
    id: '7',
    name: 'base',
    image: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400&auto=format&fit=crop&q=80',
    volume: 6300000,
    floorPrice: 2303730,
    timeFrame: '6d'
  },
  {
    id: '8',
    name: 'frog',
    image: 'https://images.unsplash.com/photo-1502780402662-acc01c084a25?w=400&auto=format&fit=crop&q=80',
    volume: 185500,
    floorPrice: 257814,
    timeFrame: '1d'
  },
  {
    id: '9',
    name: '$cum',
    image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&auto=format&fit=crop&q=80',
    volume: 198800,
    floorPrice: 257074,
    timeFrame: '5d'
  },
  {
    id: '10',
    name: 'base',
    image: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400&auto=format&fit=crop&q=80',
    volume: 6300000,
    floorPrice: 2303730,
    timeFrame: '6d'
  },
  {
    id: '11',
    name: 'frog',
    image: 'https://images.unsplash.com/photo-1502780402662-acc01c084a25?w=400&auto=format&fit=crop&q=80',
    volume: 185500,
    floorPrice: 257814,
    timeFrame: '1d'
  },
  {
    id: '12',
    name: '$cum',
    image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&auto=format&fit=crop&q=80',
    volume: 198800,
    floorPrice: 257074,
    timeFrame: '5d'
  }
];

export const TrendingCollections = () => {

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    // 滚动
    const scrollAmount = 320 * 3; // 大约一个卡片的宽度加上间距
    const currentScroll = scrollContainerRef.current.scrollLeft;

    scrollContainerRef.current.scrollTo({
      left: direction === 'left'
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount,
      behavior: 'smooth'
    });
  };
  return (

    <section className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Top Today</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
            aria-label="向左滚动"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
            aria-label="向右滚动"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {mockCollections.map((collection) => (

            <div
              key={collection.id}
              className="min-w-[240px] md:min-w-[280px] snap-start"
            >
              <Link key={collection.id} href={`/collections/${collection.id}`} className="group">
                <div className="flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300">
                  <div className="relative h-48 w-full">
                    <Image
                      src={collection.image}
                      alt={collection.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-baseline mb-3">
                      <h3 className="font-medium">{collection.name}</h3>
                      <span className="text-zinc-500 text-sm">{collection.timeFrame}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="text-zinc-500 mb-1">Volume</span>
                        <span className="font-medium">${formatPrice(collection.volume)}</span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-zinc-500 mb-1">Floor</span>
                        <span className="font-medium">${formatPrice(collection.floorPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* 添加自定义滚动条样式 */}
      <style jsx>{`
          /* 隐藏 webkit 的默认滚动条 */
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
    </section>
  );
}; 