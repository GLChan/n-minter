'use client';

import React, { useState } from 'react';
import Modal from './ui/Modal';
import ListNFTForm from './ui/ListNFTForm';
import { NFTInfo } from '@/app/_lib/types';
import { listNFT } from '@/app/_lib/data-service';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export const NFTListModal = ({ nft, isOpen, onClose }: { nft: NFTInfo | null, isOpen: boolean, onClose: () => void }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedNFT = nft

  const handleListNFT = async (price: number) => {
    if (!selectedNFT) return;

    try {
      setIsSubmitting(true);
      // 这里需要调用上架NFT的API
      console.log(`上架NFT: ID ${selectedNFT.id}, 价格 ${price} ETH`);

      // 模拟API调用延迟
      const transaction = await listNFT(selectedNFT.id, price, selectedNFT.owner_address, 'ETH');
      console.log('上架NFT成功:', transaction);
      
      toast.success('NFT上架成功');
      router.push(`/nft/${selectedNFT.id}`);
      onClose();
    } catch (error) {
      console.error("上架NFT失败:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (

    // <ListNFTModalContext.Provider value={{ openListModal, closeListModal }}>
    // {children}
    // </ListNFTModalContext.Provider >
    <>
      {/* 全局共享的上架NFT模态框 */}
      {selectedNFT && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title="上架NFT出售"
        >
          <ListNFTForm
            nft={selectedNFT}
            onSubmit={handleListNFT}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        </Modal>
      )}
    </>
  );
};
