'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/app/_components/ui/Button'; // Adjust path if needed

// Mock data for received offers (can be replaced with props or state later)
const receivedOffers = [
  {
    id: 'offer-1',
    nftId: 'nft-2', 
    nftTitle: '数字脉冲',
    nftImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop',
    offerAmount: 1.5,
    offerFromAddress: '0xabcd...efgh',
    timestamp: '1 天前',
  },
  {
    id: 'offer-2',
    nftId: 'nft-4', 
    nftTitle: '赛博朋克都市',
    nftImage: 'https://images.unsplash.com/photo-1519677100203-a7e5e89c14b4?w=100&h=100&fit=crop',
    offerAmount: 2.0,
    offerFromAddress: '0x1234...5678',
    timestamp: '5 小时前',
  },
];

export function OffersTab() {
  // TODO: Implement logic to accept/reject offers
  const handleAcceptOffer = (offerId: string) => {
    console.log("Accepting offer:", offerId);
    alert(`接受报价 ${offerId} (功能待实现)`);
  };

  const handleRejectOffer = (offerId: string) => {
    console.log("Rejecting offer:", offerId);
    alert(`拒绝报价 ${offerId} (功能待实现)`);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">收到的报价</h2>
      {receivedOffers.length > 0 ? (
        <div className="space-y-4">
          {receivedOffers.map((offer) => (
            <div key={offer.id} className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
              {/* NFT Thumbnail */}
              <Link href={`/nft/${offer.nftId}`} className="flex-shrink-0">
                <Image 
                  src={offer.nftImage}
                  alt={offer.nftTitle}
                  width={64} 
                  height={64}
                  className="rounded-md object-cover w-16 h-16"
                />
              </Link>
              {/* Offer Details */}
              <div className="flex-grow min-w-[200px]">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  收到对 <Link href={`/nft/${offer.nftId}`} className="font-medium text-primary hover:underline">{offer.nftTitle}</Link> 的报价
                </p>
                <p className="text-lg font-semibold my-1">{offer.offerAmount} ETH</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  来自 <span className="font-mono">{offer.offerFromAddress}</span> • {offer.timestamp}
                </p>
              </div>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 ml-auto">
                <Button variant="secondary" size="sm" onClick={() => handleRejectOffer(offer.id)}>拒绝</Button>
                <Button size="sm" variant="primary" onClick={() => handleAcceptOffer(offer.id)}>接受</Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400 mt-6 text-center">您目前没有收到任何报价。</p>
      )}
    </div>
  );
} 