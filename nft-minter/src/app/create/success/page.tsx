'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Share2, ExternalLink, ArrowLeft, Eye, Sparkles } from 'lucide-react';
import { NFT } from '@/app/_lib/types';
import useAsyncEffect from '@/app/_lib/hooks/useAsyncEffect';
import { getNFTById } from '@/app/_lib/data-service';
import { formatIPFSUrl } from '@/app/_lib/utils';

export default function MintSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nftId = searchParams.get('id');
  // const imageUrl = searchParams.get('image');
  // const name = searchParams.get('name');

  const [nft, setNft] = useState<NFT | null>(null);

  const [countdown, setCountdown] = useState(5);

  // 5秒倒计时后自动跳转到NFT详情页
  useEffect(() => {
    if (!nftId) return;

    const timer = setTimeout(() => {
      router.push(`/nft/${nftId}`);
    }, 5000);

    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [nftId, router]);

  useAsyncEffect(async () => {
    if (!nftId) return;
    const nft = await getNFTById(nftId)
    setNft(nft)
  }, [nftId])

  if (!nftId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">找不到NFT信息</h1>
          <p className="mb-6">无法获取NFT详情，请返回主页</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回主页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* 顶部祝贺横幅 */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-6 px-8 text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center">
              <Sparkles className="w-6 h-6 mr-2" />
              铸造成功！
            </h1>
            <div className="flex items-center text-sm font-medium">
              {countdown > 0 && (
                <span>{countdown}秒后自动跳转</span>
              )}
            </div>
          </div>
        </div>

        {/* NFT预览和信息 */}
        {nft && (
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center mb-6">
              {/* NFT图片预览 */}
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                {nft.image_url ? (
                  <Image
                    src={formatIPFSUrl(nft.image_url) || ''}
                    alt={nft.name || 'NFT作品'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                    预览加载中...
                  </div>
                )}
              </div>

              {/* 成功信息 */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-semibold mb-2">
                  {nft.name || 'NFT作品'}
                </h2>
                <p className="text-gray-600 mb-4">
                  您的NFT已成功铸造并将永久存储在区块链上！现在您可以查看、分享或将其添加到您的收藏中。
                </p>

                {/* 交易ID简写 */}
                <div className="text-sm text-gray-500 mb-1">
                  交易ID：{nftId ? `${nftId.substring(0, 8)}...${nftId.substring(nftId.length - 8)}` : 'Processing...'}
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <Link
                href={`/nft/${nftId}`}
                className="flex items-center justify-center px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                查看我的NFT
              </Link>

              <Link
                href="/profile"
                className="flex items-center justify-center px-4 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                查看我的藏品
              </Link>

              <a
                href={`https://etherscan.io/tx/${nftId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-3 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                在区块链浏览器上查看
              </a>

              <button
                onClick={() => {
                  try {
                    navigator.share({
                      title: `${nft.name || 'NFT作品'} - 刚刚铸造的NFT`,
                      text: '看看我刚刚铸造的NFT！',
                      url: `${window.location.origin}/nft/${nftId}`
                    });
                  } catch (err) {
                    // 如果分享API不可用，则简单地复制链接到剪贴板
                    navigator.clipboard.writeText(`${window.location.origin}/nft/${nftId}`);
                    alert('链接已复制到剪贴板');
                  }
                }}
                className="flex items-center justify-center px-4 py-3 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-4 h-4 mr-2" />
                分享喜悦
              </button>
            </div>

            {/* 返回按钮 */}
            <div className="flex justify-center mt-8">
              <Link
                href="/create"
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                再铸造一个
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 