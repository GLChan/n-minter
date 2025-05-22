'use client';

import React, { useState } from 'react';
import Modal from './ui/Modal';
import { NFTInfo } from '@/app/_lib/types';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';

export const NFTTransferModal = ({ nft, isOpen, onClose }: { nft: NFTInfo | null, isOpen: boolean, onClose: () => void }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiverAddress, setReceiverAddress] = useState('');
  const selectedNFT = nft;

  const handleTransferNFT = async () => {
    if (!selectedNFT) return;
    if (!receiverAddress.trim()) {
      toast.error('请输入接收方地址');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log(`转移NFT: ID ${selectedNFT.id} 到地址 ${receiverAddress}`);

      // 调用NFT转移API

      const response = await fetch('/api/nft/transfer', {
        method: 'POST',
        body: JSON.stringify({
          nftId: selectedNFT.id,
          receiverAddress,
        }),
      })
      const data = await response.json();

      if (response.ok) {
        // 成功提示
        toast.success('NFT已成功转移');

        // 刷新页面或跳转
        router.push(`/nft/${selectedNFT.id}`);

        // 关闭弹窗
        onClose();
      } else {
        const error = data.error
        console.error('转移NFT失败:', error);
        throw new Error('转移NFT时发生错误');
      }

    } catch (error) {
      console.error("转移NFT失败:", error);
      toast.error('转移失败，请检查地址是否正确');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {selectedNFT && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title="转移NFT"
        >
          <div className="space-y-4">
            <div className="mt-2 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">NFT名称</span>
                <span className="font-medium">{selectedNFT.name}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="receiver-address" className="block text-sm font-medium">
                接收方钱包地址
              </label>
              <input
                id="receiver-address"
                type="text"
                value={receiverAddress}
                onChange={(e) => setReceiverAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-between gap-4 mt-6">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                onClick={handleTransferNFT}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? '处理中...' : '确认转移'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
