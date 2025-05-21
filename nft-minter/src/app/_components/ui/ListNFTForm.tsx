'use client';

import React, { useState } from 'react';
import { NFTInfo } from '@/app/_lib/types';
import { Button } from './Button';

interface ListNFTFormProps {
  nft: NFTInfo;
  onSubmit: (price: number) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const ListNFTForm: React.FC<ListNFTFormProps> = ({
  nft,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [price, setPrice] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证价格
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setError('请输入有效的价格');
      return;
    }

    try {
      await onSubmit(Number(price));
    } catch (err) {
      setError(err instanceof Error ? err.message : '上架失败，请重试');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">NFT名称</div>
          <div className="font-medium">{nft.name}</div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="price" className="block mb-2 text-sm font-medium">
            设置价格 (ETH)
          </label>
          <div className="relative">
            <input
              id="price"
              type="number"
              step="0.0001"
              min="0"
              placeholder="0.00"
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-700 dark:text-white"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setError(null);
              }}
              required
              disabled={isSubmitting}
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-500 dark:text-zinc-400">
              ETH
            </span>
          </div>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">费用</h4>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-zinc-600 dark:text-zinc-400">平台费用 (2.5%)</span>
            <span>{price ? (Number(price) * 0.025).toFixed(4) : '0.0000'} ETH</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-zinc-600 dark:text-zinc-400">创作者版税 (5%)</span>
            <span>{price ? (Number(price) * 0.05).toFixed(4) : '0.0000'} ETH</span>
          </div>
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700 mt-3 flex justify-between font-medium">
            <span>您将获得</span>
            <span>
              {price ? (Number(price) * 0.925).toFixed(4) : '0.0000'} ETH
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          取消
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !price}
          className="flex-1"
        >
          {isSubmitting ? '处理中...' : '确认上架'}
        </Button>
      </div>
    </form>
  );
};

export default ListNFTForm; 