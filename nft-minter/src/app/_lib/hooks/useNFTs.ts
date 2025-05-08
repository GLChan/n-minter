import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// NFT类型定义 - 与Supabase表结构匹配
interface NFT {
  id: string;
  token_id: string | null;
  contract_address: string;
  chain_id: string | number;
  owner_id: string | null;
  creator_id: string | null;
  name: string | null;
  description: string | null;
  image_url: string | null;
  metadata_url: string | null;
  metadata: any | null;
  created_at: string;
  updated_at: string;
  owner_address: string;
  transaction_hash: string;
  token_uri: string | null;
  collection_id: string | null;
}

// 分页响应接口
interface PaginatedResponse {
  data: NFT[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 钩子返回类型
interface UseNFTsReturn {
  nfts: NFT[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  refetch: () => Promise<void>;
}

/**
 * 自定义钩子：获取用户拥有的NFT列表
 * 
 * @param initialPage 初始页码
 * @param initialLimit 每页数量
 * @returns NFT列表状态和控制函数
 */
export function useNFTs(initialPage: number = 1, initialLimit: number = 10): UseNFTsReturn {
  const { isBackendVerified } = useAuth();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 获取NFT列表
  const fetchNFTs = useCallback(async () => {
    if (!isBackendVerified) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 调用API获取NFT列表
      const response = await fetch(`/api/user/nfts?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        let errorMsg = `错误: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (e) {
          // 忽略JSON解析错误
        }
        throw new Error(errorMsg);
      }

      const data: PaginatedResponse = await response.json();
      
      // 更新状态
      setNfts(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      
    } catch (err: any) {
      setError(err.message || '获取NFT列表失败');
      console.error('获取NFT列表时出错:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isBackendVerified, page, limit]);

  // 依赖项更改时重新获取
  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  // 返回状态和控制函数
  return {
    nfts,
    isLoading,
    error,
    total,
    page,
    totalPages,
    setPage,
    setLimit,
    refetch: fetchNFTs
  };
} 