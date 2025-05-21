'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import Modal from '../ui/Modal';
import { NFTInfo } from '@/app/_lib/types';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';
import { unlistNFT } from '@/app/_lib/data-service';
import { useRouter } from 'next/navigation';

interface UnlistNFTModalContextType {
  openUnlistModal: (nft: NFTInfo) => void;
  closeUnlistModal: () => void;
}

const UnlistNFTModalContext = createContext<UnlistNFTModalContextType | undefined>(undefined);

export const UnlistNFTModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<NFTInfo | null>(null);

  const openUnlistModal = (nft: NFTInfo) => {
    setSelectedNFT(nft);
    setIsModalOpen(true);
  };

  const closeUnlistModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      // 延迟清空selectedNFT，以避免Modal关闭时内容闪烁
      setTimeout(() => {
        setSelectedNFT(null);
      }, 300);
    }
  };

  const handleUnlistNFT = async () => {
    if (!selectedNFT) return;

    try {
      setIsSubmitting(true);
      console.log(`取消上架NFT: ID ${selectedNFT.id}`);

      // 调用取消上架API
      await unlistNFT(selectedNFT.id, selectedNFT.owner_address);

      // 成功提示
      toast.success('NFT已取消上架');
      
      // 关闭弹窗
      setIsModalOpen(false);

      // 跳转到NFT详情页面
      router.push(`/nft/${selectedNFT.id}`);

    } catch (error) {
      console.error("取消上架NFT失败:", error);
      toast.error('取消上架失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UnlistNFTModalContext.Provider value={{ openUnlistModal, closeUnlistModal }}>
      {children}
      
      {/* 取消上架确认模态框 */}
      {selectedNFT && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeUnlistModal}
          title="确认取消上架"
        >
          <div className="space-y-4">
            <p className="text-center">您确定要取消上架此NFT吗？</p>
            
            <div className="mt-2 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">NFT名称</span>
                <span className="font-medium">{selectedNFT.name}</span>
              </div>
              {selectedNFT.list_price && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">当前价格</span>
                  <span className="font-medium">{selectedNFT.list_price} {selectedNFT.list_currency || 'ETH'}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between gap-4 mt-6">
              <Button
                variant="secondary"
                onClick={closeUnlistModal}
                disabled={isSubmitting}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={handleUnlistNFT}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? '处理中...' : '确认取消上架'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </UnlistNFTModalContext.Provider>
  );
};

export const useUnlistNFTModal = () => {
  const context = useContext(UnlistNFTModalContext);
  if (context === undefined) {
    throw new Error('useUnlistNFTModal must be used within a UnlistNFTModalProvider');
  }
  return context;
}; 