import React from 'react';
import Image from 'next/image';
import { Button, ButtonVariantDefault, ButtonVariantSecondary } from './ui/Button';
import Link from 'next/link';
import { getFeaturedNFT } from '../_lib/actions';
import { formatIPFSUrl } from '../_lib/utils';

// Hero部分数据对象
const heroData = {
  title: {
    firstLine: '创建、分享',
    highlightedLine: '和铸造 NFT'
  },
  description: '简单几步，将您的创意铸造为 NFT，立即加入 Web3 数字艺术的世界。',
  community: {
    count: '3.5k+',
    description: '创作者社区',
    avatars: [
      { src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces', alt: 'User 1' },
      { src: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=64&h=64&fit=crop&crop=faces', alt: 'User 2' },
      { src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&crop=faces', alt: 'User 3' }
    ]
  }
};



export const Hero = async () => {

  const featuredNFTObject = await getFeaturedNFT()

  const featuredNFT = featuredNFTObject.nfts
  
  const owner = featuredNFT.profiles


  return (
    <section className="relative w-full overflow-hidden py-12 md:py-20">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-900 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* 左侧文本内容 */}
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {heroData.title.firstLine}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                {heroData.title.highlightedLine}
              </span>
            </h1>

            <p className="text-lg text-zinc-700 dark:text-zinc-300 max-w-md">
              {heroData.description}
            </p>

            <div className="flex flex-wrap gap-4 mt-2">

              <Link href="/create">
                <Button
                  variant={ButtonVariantDefault}
                  size="lg"
                >
                  开始创建
                </Button>
              </Link>
              <Link href="/explore">
                <Button
                  variant={ButtonVariantSecondary}
                  size="lg"
                >
                  探索收藏品
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center -space-x-2">
                {heroData.community.avatars.map((avatar, index) => (
                  <div key={index} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 overflow-hidden relative">
                    <Image src={avatar.src} alt={avatar.alt} fill className="object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                加入 <span className="font-semibold">{heroData.community.count}</span> {heroData.community.description}
              </p>
            </div>
          </div>

          {/* 右侧图片 */}
          {featuredNFT && owner && <Link href={`/nft/${featuredNFT.id}`}>
            <div className="relative h-[480px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={formatIPFSUrl(featuredNFT.image_url) || ''}
                alt="Featured NFT artwork"
                fill
                className="object-cover"
                priority
              />

              {/* NFT信息卡片 */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{featuredNFT.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-5 h-5 rounded-full overflow-hidden relative">
                        <Image src={owner.avatar_url || ''} alt="Creator" fill className="object-cover" />
                      </div>
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">{owner.username}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-500">当前价格</p>
                    <p className="font-semibold">{featuredNFT.last_sale_price || featuredNFT.list_price} {featuredNFT.last_sale_currency || featuredNFT.list_currency}</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>}
        </div>
      </div>
    </section>
  );
}; 