'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';

interface FavoriteButtonProps {
  nftId: string;
  isAuth: boolean;
  initialFavorited?: boolean;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  nftId,
  isAuth,
  initialFavorited = false,
}) => {

  const [isFavorited, setIsFavorited] = useState<boolean>(initialFavorited);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // 获取初始收藏状态
  useEffect(() => {
    setIsMounted(true); // 防止水合(hydration)不匹配

    if (!isAuth || !nftId) return;

    async function checkFavoriteStatus() {
      try {
        const response = await fetch(`/api/nft/favorite?nftId=${nftId}`, {
          method: 'GET'
        });

        const data = await response.json();
        if (response.ok && data) {
          setIsFavorited(data.favorited);
        }
        
      } catch (error) {
        console.error('获取收藏状态错误:', error);
      }
    }

    checkFavoriteStatus();
  }, [nftId, isAuth]);

  // 处理收藏/取消收藏
  const toggleFavorite = async () => {
    if (!isAuth) {
      // 如果用户未登录，触发登录提示
      toast.error('请先登录', { position: 'bottom-center' });
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      const action = isFavorited ? 'remove' : 'add';
      
      const response = await fetch('/api/nft/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nftId, action })
      });

      const data = await response.json();
      
      if (response.ok) {
        // 更新UI状态
        setIsFavorited(!isFavorited);
        
        // 显示消息提示
        toast.success(
          isFavorited ? '已从收藏中移除' : '已添加到收藏', 
          { position: 'bottom-center' }
        );
      } else {
        console.error('操作失败:', data.error);
        toast.error('操作失败，请重试', { position: 'bottom-center' });
      }
    } catch (error) {
      console.error('收藏操作错误:', error);
      toast.error('发生错误，请稍后再试', { position: 'bottom-center' });
    } finally {
      setIsLoading(false);
    }
  };

  // 避免服务器端渲染与客户端水合时的不匹配
  if (!isMounted) return null;

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      aria-label={isFavorited ? '取消收藏' : '收藏'}
      className={`
        flex items-center justify-center p-2 rounded-full 
        ${isLoading 
          ? 'opacity-70 cursor-not-allowed' 
          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}
        transition-all duration-200
      `}
    >
      <Heart 
        className={`
          w-5 h-5 transition-all duration-300
          ${isFavorited 
            ? 'fill-red-500 text-red-500' 
            : 'fill-transparent text-zinc-600 dark:text-zinc-400'}
        `}
      />
    </button>
  );
}; 