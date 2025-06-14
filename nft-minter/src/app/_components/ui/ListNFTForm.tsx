"use client";

import React, { useEffect, useState } from "react";
import { EIP712_TYPES, NFTInfo, OrderPayload } from "@/app/_lib/types";
import { Button } from "./Button";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSignTypedData,
  useChainId, // 新增：导入 useChainId 来获取当前链ID
} from "wagmi";
import {
  MARKETPLACE_ABI,
  MARKETPLACE_CONTRACT_ADDRESS,
  MARKETPLACE_NAME,
  MARKETPLACE_VERSION,
  MY_NFT_ABI,
  SECONDS_IN_A_DAY,
  ZERO_ADDRESS,
} from "@/app/_lib/constants";
import { parseEther } from "viem";
import { env } from "@/app/_lib/config/env";
import { listNFT } from "@/app/_lib/data-service"; // 这个函数现在的作用是发送签名订单到后端
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ListNFTFormProps {
  nft: NFTInfo;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ListNFTForm: React.FC<ListNFTFormProps> = ({
  nft,
  onSuccess,
  onCancel,
}) => {
  const router = useRouter();
  const [price, setPrice] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { address } = useAccount();
  const chainId = useChainId(); // 获取当前链ID

  // --- 授权逻辑 (基本保持不变) ---
  const { data: isApproved, refetch: refetchApproval } = useReadContract({
    abi: MY_NFT_ABI,
    address: nft.contract_address as `0x${string}`,
    functionName: "isApprovedForAll",
    args: [address!, MARKETPLACE_CONTRACT_ADDRESS],
    query: { enabled: !!address },
  });

  const {
    data: approvalTxHash,
    writeContract: approveNFT,
    isPending: isApproving,
    error: writeApprovalError,
  } = useWriteContract();

  const { isLoading: isConfirmingApproval, isSuccess: isApprovalConfirmed } =
    useWaitForTransactionReceipt({
      hash: approvalTxHash,
    });

  useEffect(() => {
    if (isApprovalConfirmed) {
      refetchApproval(); // 授权成功后重新检查授权状态
      setError(null);
    }
  }, [isApprovalConfirmed, refetchApproval]);

  useEffect(() => {
    if (writeApprovalError) {
      setError(writeApprovalError.message);
    }
  }, [writeApprovalError]);

  const handleApprove = async () => {
    if (!address) return toast.error("请先连接钱包");
    approveNFT({
      abi: MY_NFT_ABI,
      address: nft.contract_address as `0x${string}`,
      functionName: "setApprovalForAll",
      args: [MARKETPLACE_CONTRACT_ADDRESS, true],
    });
  };

  // --- 挂单逻辑 (核心改动部分) ---

  const domain = {
    name: MARKETPLACE_NAME, // 必须与您部署合约时使用的 name 一致
    version: MARKETPLACE_VERSION, // 必须与您部署合约时使用的 version 一致
    chainId: chainId,
    verifyingContract: MARKETPLACE_CONTRACT_ADDRESS,
  } as const;

  const { signTypedDataAsync, isPending: isSigning } = useSignTypedData();

  const { refetch: refetchNonce } = useReadContract({
    address: MARKETPLACE_CONTRACT_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "userNonces",
    args: [address!],
    query: {
      enabled: false, // 初始不执行查询
    },
  });

  // 重构 handleSubmit 函数以处理签名流程
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!address) return setError("请连接钱包");
    if (!price || isNaN(Number(price)) || Number(price) <= 0)
      return setError("请输入有效的价格");
    if (!isApproved) return setError("请先授权平台交易您的NFT");

    setIsSubmitting(true);

    try {
      const { data: latestNonce, isSuccess } = await refetchNonce();
      console.log("最新的 nonce:", latestNonce);
      if (!isSuccess) throw new Error("Failed to fetch nonce");

      // 1. 准备订单数据
      // 注意: nonce 应从后端或链上获取，这里用 0n 作为示例
      const order: OrderPayload = {
        seller: address,
        buyer: ZERO_ADDRESS, // 公开挂单
        nftAddress: nft.contract_address! as `0x${string}`,
        tokenId: BigInt(nft.token_id!),
        currency: env.NEXT_PUBLIC_WETH_CONTRACT_ADDRESS as `0x${string}`, // 使用 WETH 地址
        price: parseEther(price),
        // 生产环境中应从后端获取或调用合约的 userNonces(address)
        nonce: BigInt(`${latestNonce}`), // 示例值，实际应从合约获取
        deadline: BigInt(Math.floor(Date.now() / 1000) + SECONDS_IN_A_DAY), // 24小时后过期
      };

      // 2. 请求用户签名
      const signature = await signTypedDataAsync({
        domain,
        types: EIP712_TYPES,
        primaryType: "Order",
        message: order,
      });

      // 3. 将订单和签名发送到您的后端服务器
      await listNFT(nft.id, order, signature);

      toast.success("NFT 挂单成功！");
      router.push(`/nft/${nft.id}`);
      onSuccess();
    } catch (error) {
      console.error("挂单签名或提交失败:", error);
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      setError(`操作失败: ${errorMessage.slice(0, 50)}...`);
      toast.error("挂单失败！");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 费用计算部分 (保持不变) ---
  const platformFee = 0.025;
  const royalties = (nft.collection?.royalty_fee_bps ?? 0) / 10000;
  const royaltiesPercentage = royalties * 100;
  const totalFees = platformFee + royalties;
  const earnPercentage = 1 - totalFees;

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
              disabled={isSubmitting || isApproving || isConfirmingApproval}
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

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <div className="flex gap-4 mt-6">
        {!isApproved ? (
          <Button
            type="button"
            onClick={handleApprove}
            disabled={isApproving || isConfirmingApproval}
            className="flex-1"
          >
            {isApproving
              ? "等待钱包确认..."
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
              disabled={isSubmitting || isSigning}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={!price || isSubmitting || isSigning}
              className="flex-1"
            >
              {isSigning
                ? "等待钱包签名..."
                : isSubmitting
                ? "正在提交..."
                : "确认挂单"}
            </Button>
          </>
        )}
      </div>
    </form>
  );
};
