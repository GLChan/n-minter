"use client";

import React, { useEffect, useState } from "react";
import Modal from "./ui/Modal";
import { NFTInfo } from "@/app/_lib/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { contractAbi, contractAddress } from "@/app/_lib/constants";

export const NFTTransferModal = ({
  nft,
  isOpen,
  onClose,
}: {
  nft: NFTInfo | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { address: senderAddress } = useAccount(); // 获取钱包连接状态和地址  , isConnected, chain
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiverAddress, setReceiverAddress] = useState("");
  const [error, setError] = useState("");
  const [successHash, setSuccessHash] = useState("");
  const selectedNFT = nft;

  const {
    data: writeContractResult,
    writeContractAsync,
    // isPending: isMinting,
    // error: mintError,
  } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    // data: receipt,
  } = useWaitForTransactionReceipt({
    hash: writeContractResult,
    confirmations: 1, // 添加确认数
    retryDelay: 1000,
    onReplaced: (replacement) => {
      console.log("交易被替换:", replacement);
    },
  });

  const handleTransferNFT = async () => {
    if (!selectedNFT) return;
    if (!receiverAddress.trim()) {
      toast.error("请输入接收方地址");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessHash("");

    try {
      const tokenId = selectedNFT.token_id;
      console.log(
        `正在从 ${senderAddress} 转移 Token ID ${tokenId} 到 ${receiverAddress}...`
      );

      // 1. 发送交易
      const hash = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: contractAbi,
        functionName: "safeTransferFrom",
        args: [
          senderAddress,
          receiverAddress as `0x${string}`,
          BigInt(tokenId!),
        ], // 参数顺序和类型要匹配
      });

      console.log("交易已发送, 哈希:", hash);
      // --- UI 更新: 显示等待确认 ---
      const response = await fetch("/api/nft/transfer", {
        method: "POST",
        body: JSON.stringify({
          nftId: selectedNFT.id,
          receiverAddress,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        // 成功提示
        toast.success("NFT已成功转移:" + successHash);

        // 刷新页面或跳转
        router.push(`/nft/${selectedNFT.id}`);

        // 关闭弹窗
        onClose();
      } else {
        const error = data.error;
        console.error("转移NFT失败:", error);
        throw new Error("转移NFT时发生错误");
      }
    } catch (err) {
      console.error("转移失败:", err);
      if (err instanceof Error) {
        setError(err.message || "转移过程中发生未知错误。");
      }
      // --- UI 更新: 显示错误 ---
      toast.error(`转移失败: ${error}`);
    }
  };

  useEffect(() => {
    if (!writeContractResult) return;

    if (isConfirming) {
      setIsSubmitting(true);
      setError("");
    }

    if (isConfirmed) {
      setIsSubmitting(false);
      setSuccessHash(writeContractResult);
      console.log("交易已确认:", writeContractResult);
      toast.success("NFT转移成功!");
      // --- UI 更新: 显示成功 ---
      // --- 可能需要重新获取用户的 NFT 列表 ---
      router.push(`/nft/${nft?.id}`);
      onClose();
    }
  }, [
    writeContractResult,
    onClose,
    isConfirming,
    isConfirmed,
    router,
    nft?.id,
  ]);

  return (
    <>
      {selectedNFT && (
        <Modal isOpen={isOpen} onClose={onClose} title="转移NFT">
          <div className="space-y-4">
            <div className="mt-2 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  NFT名称
                </span>
                <span className="font-medium">{selectedNFT.name}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="receiver-address"
                className="block text-sm font-medium"
              >
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
                {isSubmitting ? "处理中..." : "确认转移"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
