'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import Modal from '../ui/Modal';
import ListNFTForm from '../ui/ListNFTForm';
import { NFTInfo } from '@/app/_lib/types';
import { listNFT } from '@/app/_lib/data-service';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ListNFTModalContextType {
  openListModal: (nft: NFTInfo) => void;
  closeListModal: () => void;
}

const ListNFTModalContext = createContext<ListNFTModalContextType | undefined>(undefined);

export const ListNFTModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<NFTInfo | null>(null);

  const openListModal = (nft: NFTInfo) => {
    setSelectedNFT(nft);
    setIsModalOpen(true);
  };

  const closeListModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      // 延迟清空selectedNFT，以避免Modal关闭时内容闪烁
      setTimeout(() => {
        setSelectedNFT(null);
      }, 300);
    }
  };

  const handleListNFT = async (price: number) => {
    if (!selectedNFT) return;

    try {
      setIsSubmitting(true);
      // 这里需要调用上架NFT的API
      console.log(`上架NFT: ID ${selectedNFT.id}, 价格 ${price} ETH`);

      // 模拟API调用延迟
      const transaction = await listNFT(selectedNFT.id, price, selectedNFT.owner_address, 'ETH');
      console.log('上架NFT成功:', transaction);

      // 弹出上架成功提示
      toast.success('NFT上架成功');

      // 跳转至NFT详情页
      router.push(`/nft/${selectedNFT.id}`);
      
      // 上架成功后关闭弹窗
      setIsModalOpen(false);

      // 这里应该添加成功提示或刷新列表的逻辑

    } catch (error) {
      console.error("上架NFT失败:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ListNFTModalContext.Provider value={{ openListModal, closeListModal }}>
      {children}

      {/* 全局共享的上架NFT模态框 */}
      {selectedNFT && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeListModal}
          title="上架NFT出售"
        >
          <ListNFTForm
            nft={selectedNFT}
            onSubmit={handleListNFT}
            onCancel={closeListModal}
            isSubmitting={isSubmitting}
          />
        </Modal>
      )}
    </ListNFTModalContext.Provider>
  );
};

export const useListNFTModal = () => {
  const context = useContext(ListNFTModalContext);
  if (context === undefined) {
    throw new Error('useListNFTModal must be used within a ListNFTModalProvider');
  }
  return context;
}; 