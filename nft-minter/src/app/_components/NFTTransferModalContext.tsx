'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { NFTInfo } from '@/app/_lib/types';
import { NFTTransferModal } from './NFTTransferModal';

interface NFTTransferModalContextType {
  openTransferModal: (nft: NFTInfo) => void;
  closeTransferModal: () => void;
}

const NFTTransferModalContext = createContext<NFTTransferModalContextType | undefined>(undefined);

export const useNFTTransferModal = () => {
  const context = useContext(NFTTransferModalContext);
  if (context === undefined) {
    throw new Error('useNFTTransferModal must be used within a NFTTransferModalProvider');
  }
  return context;
};

export const NFTTransferModalProvider = ({ children }: { children: ReactNode }) => {
  const [selectedNFT, setSelectedNFT] = useState<NFTInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openTransferModal = (nft: NFTInfo) => {
    setSelectedNFT(nft);
    setIsModalOpen(true);
  };

  const closeTransferModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedNFT(null), 300); // 延迟清空NFT数据，避免模态框关闭动画问题
  };

  return (
    <NFTTransferModalContext.Provider value={{ openTransferModal, closeTransferModal }}>
      {children}
      <NFTTransferModal
        nft={selectedNFT}
        isOpen={isModalOpen}
        onClose={closeTransferModal}
      />
    </NFTTransferModalContext.Provider>
  );
}; 