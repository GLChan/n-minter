"use client";

import React, { useState } from 'react';
import { Button } from '@/app/_components/ui/Button';
import { Modal } from '@/app/_components/ui/Modal';
import { NFT, UserProfile } from '@/app/_lib/types';

interface NFTInteractionProps {
  userProfile: UserProfile | null;
  nft: NFT;
}

export default function NFTInteraction({ userProfile, nft }: Readonly<NFTInteractionProps>) {
  const [showOfferModal, setShowOfferModal] = useState(false);
  const handleCloseOfferModal = () => setShowOfferModal(false);

  return (
    <>
      {userProfile && nft.owner_address === userProfile.wallet_address ? (
        <Button size="lg">下架</Button>
      ) : (
        <div className="flex gap-2">
          <Button size="lg">购买此 NFT</Button>
          <Button size="lg" onClick={() => setShowOfferModal(true)}>报价</Button>
        </div>
      )}

      {/* 模态框 */}
      <Modal isOpen={showOfferModal} onClose={handleCloseOfferModal} title="提交报价">
        <div className="p-4">
          <label htmlFor="offerAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            报价金额 (ETH)
          </label>
          <input
            type="number"
            id="offerAmount"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          <div className="mt-4 flex justify-end">
            <Button onClick={handleCloseOfferModal}>取消</Button>
            <Button className="ml-2">提交报价</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}