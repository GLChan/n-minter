"use client";

import React, { useState, useEffect } from "react";
import { NFTInfo } from "@/app/_lib/types";
import { Button } from "./Button";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { MARKETPLACE_ABI, MY_NFT_ABI } from "@/app/_lib/constants";
import { parseEther } from "viem";
import { env } from "@/app/_lib/config/env";
import { listNFT } from "@/app/_lib/data-service";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ethToWei } from "@/app/_lib/utils";

interface ListNFTFormProps {
  nft: NFTInfo;
  onSuccess: () => void; // 修改为 onSuccess
  onCancel: () => void;
}

export const ListNFTForm: React.FC<ListNFTFormProps> = ({
  nft,
  onSuccess, // 修改为 onSuccess
  onCancel,
}) => {
  const router = useRouter();
  const [price, setPrice] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [listingError, setListingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { address } = useAccount();
  const marketplaceAddress =
    env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`;

  // 检查是否已授权
  const {
    data: isApproved,
    isLoading: isCheckingApproval,
    refetch: refetchApproval,
  } = useReadContract({
    abi: MY_NFT_ABI,
    address: nft.contract_address as `0x${string}`,
    functionName: "isApprovedForAll",
    args: [address!, marketplaceAddress],
    query: {
      enabled: !!address && !!nft.contract_address && !!marketplaceAddress,
      refetchInterval: 5000, // 5秒刷新一次授权状态
    },
  });

  useEffect(() => {
    if (isApproved === undefined) {
      console.log("正在检查授权状态，请稍候...", isApproved);
    } else if (isApproved) {
      console.log("您已授权平台交易您的NFT", isApproved);
    } else {
      console.log("请先授权平台交易您的NFT", isApproved);
    }
    console.log("授权状态isCheckingApproval:", isCheckingApproval);
  }, [isApproved, isCheckingApproval]);

  // 授权操作
  const {
    data: approvalTxHash,
    writeContractAsync: writeApproval,
    isPending: isApproving,
    error: writeApprovalError,
  } = useWriteContract();

  const { isLoading: isConfirmingApproval, isSuccess: isApprovalConfirmed } =
    useWaitForTransactionReceipt({
      hash: approvalTxHash,
    });

  // 上架操作
  const {
    data: listItemTxHash,
    writeContractAsync: writeListItem,
    isPending: isListingItem,
    error: writeListItemError,
  } = useWriteContract();

  const { isLoading: isConfirmingListItem, isSuccess: isListItemConfirmed } =
    useWaitForTransactionReceipt({
      hash: listItemTxHash,
    });

  useEffect(() => {
    if (isApprovalConfirmed) {
      refetchApproval(); // 授权成功后重新检查授权状态
      setApprovalError(null);
    }
  }, [isApprovalConfirmed, refetchApproval]);

  useEffect(() => {
    if (writeApprovalError) {
      setApprovalError(writeApprovalError.message);
    }
  }, [writeApprovalError]);

  useEffect(() => {
    if (writeListItemError) {
      setListingError(writeListItemError.message);
    }
  }, [writeListItemError]);

  const handleApprove = async () => {
    setApprovalError(null);
    try {
      await writeApproval({
        abi: MY_NFT_ABI,
        address: nft.contract_address as `0x${string}`,
        functionName: "setApprovalForAll",
        args: [marketplaceAddress, true],
      });
    } catch (err) {
      console.error("授权失败:", err);
      setApprovalError(err instanceof Error ? err.message : "授权失败");
    }
  };

  const platformFee = 0.025; // 平台费用 2.5%
  const royalties = (nft.collection?.royalty_fee_bps ?? 0) / 10000;
  const royaltiesPercentage = royalties * 100; // 默认创作者版税 5%
  const totalFees = platformFee + royalties;
  const earnPercentage = 1 - totalFees; // 用户实际获得的百分比

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setListingError(null);

    if (!address) {
      setError("请连接钱包");
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setError("请输入有效的价格");
      return;
    }

    if (!isApproved) {
      setError("请先授权平台交易您的NFT");
      return;
    }

    try {
      // 调用 Marketplace 合约的 listItem
      await writeListItem({
        abi: MARKETPLACE_ABI,
        address: marketplaceAddress,
        functionName: "listItem",
        args: [
          nft.contract_address as `0x${string}`,
          BigInt(nft.token_id!),
          parseEther(price),
        ],
      });
    } catch (err) {
      console.error("上架失败:", err);
      setListingError(err instanceof Error ? err.message : "上架失败，请重试");
    }
  };

  useEffect(() => {
    if (isListItemConfirmed && listItemTxHash) {
      // 交易确认后，调用上架接口
      const handleListNFT = async () => {
        if (isSubmitting || !nft || !price) return;

        try {
          // 这里需要调用上架NFT的API
          console.log(`上架NFT: ID ${nft.id}, 价格 ${price} ETH`);

          setIsSubmitting(true);
          // 模拟API调用延迟
          const transaction = await listNFT(
            nft.id,
            ethToWei(price),
            nft.owner_address,
            "ETH"
          );
          console.log("上架NFT成功:", transaction);

          toast.success("NFT上架成功");
          router.push(`/nft/${nft.id}`);
          onSuccess(); // 调用成功回调
        } catch (error) {
          console.error("上架NFT失败:", error);
          setListingError(
            error instanceof Error ? error.message : "上架NFT失败"
          );
        } finally {
          setIsSubmitting(false);
        }
      };
      handleListNFT();
    }
  }, [
    isListItemConfirmed,
    listItemTxHash,
    nft,
    price,
    onSuccess,
    router,
    isSubmitting,
  ]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            NFT名称
          </div>
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
              disabled={isSubmitting || isListingItem || isConfirmingListItem}
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
            <span className="text-zinc-600 dark:text-zinc-400">
              平台费用 (2.5%)
            </span>
            <span>
              {price ? (Number(price) * platformFee).toFixed(4) : "0.0000"} ETH
            </span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-zinc-600 dark:text-zinc-400">
              创作者版税 ({royaltiesPercentage || 0}%)
            </span>
            <span>
              {price ? (Number(price) * royalties).toFixed(4) : "0.0000"} ETH
            </span>
          </div>
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700 mt-3 flex justify-between font-medium">
            <span>您将获得</span>
            <span>
              {price ? (Number(price) * earnPercentage).toFixed(4) : "0.0000"}{" "}
              ETH
            </span>
          </div>
        </div>
      </div>

      {approvalError && (
        <p className="mt-2 text-sm text-red-500">{approvalError}</p>
      )}
      {listingError && (
        <p className="mt-2 text-sm text-red-500">{listingError}</p>
      )}

      <div className="flex gap-4 mt-6">
        {!isApproved ? (
          <Button
            type="button"
            onClick={handleApprove}
            disabled={isApproving || isConfirmingApproval || isCheckingApproval}
            className="flex-1"
          >
            {isCheckingApproval
              ? "检查授权..."
              : isApproving
              ? "等待钱包确认授权..."
              : isConfirmingApproval
              ? "授权确认中..."
              : "授权平台交易"}
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isListingItem || isConfirmingListItem}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={!price || isListingItem || isConfirmingListItem}
              className="flex-1"
            >
              {isListingItem
                ? "等待钱包确认上架..."
                : isConfirmingListItem
                ? "上架确认中..."
                : "确认上架"}
            </Button>
          </>
        )}
      </div>
    </form>
  );
};

export default ListNFTForm;
