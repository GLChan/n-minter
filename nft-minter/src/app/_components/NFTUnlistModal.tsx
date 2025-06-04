"use client";

import React, { useEffect } from "react";
import Modal from "./ui/Modal";
import { NFTInfo } from "@/app/_lib/types";
import toast from "react-hot-toast";
import { Button } from "./ui/Button";
import { unlistNFT } from "@/app/_lib/data-service";
import { useRouter } from "next/navigation";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { MARKETPLACE_ABI } from "@/app/_lib/constants";
import { env } from "@/app/_lib/config/env";

export const NFTUnlistModal = ({
  nft,
  isOpen,
  onClose,
}: {
  nft: NFTInfo | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const router = useRouter();
  const selectedNFT = nft;

  const marketplaceAddress =
    env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`;

  // 取消上架操作
  const {
    data: cancelTxHash,
    writeContractAsync,
    isPending: isCancelling,
    error: writeCancelError,
  } = useWriteContract();

  const { isLoading: isConfirmingCancel, isSuccess: isCancelConfirmed } =
    useWaitForTransactionReceipt({
      hash: cancelTxHash,
    });

  useEffect(() => {
    if (isCancelConfirmed && selectedNFT) {
      const handleUnlistNFTInSupabase = async () => {
        try {
          console.log(`取消上架NFT: ID ${selectedNFT.id}`);
          await unlistNFT(selectedNFT.id, selectedNFT.owner_address);
          toast.success("NFT已取消上架");
          router.push(`/nft/${selectedNFT.id}`);
          onClose();
        } catch (error) {
          console.error("更新Supabase失败:", error);
          toast.error("取消上架失败，请重试");
        }
      };
      handleUnlistNFTInSupabase();
    }
  }, [isCancelConfirmed, selectedNFT, router, onClose]);

  useEffect(() => {
    if (writeCancelError) {
      toast.error(writeCancelError.message);
    }
  }, [writeCancelError]);

  const handleCancelListing = async () => {
    if (!selectedNFT) return;

    try {
      await writeContractAsync({
        abi: MARKETPLACE_ABI,
        address: marketplaceAddress,
        functionName: "cancelListing",
        args: [
          selectedNFT.contract_address as `0x${string}`,
          BigInt(selectedNFT.token_id!),
        ],
      });
    } catch (error) {
      console.error("取消上架合约调用失败:", error);
      toast.error(error instanceof Error ? error.message : "取消上架失败");
    }
  };

  return (
    <>
      {/* 取消上架确认模态框 */}
      {selectedNFT && (
        <Modal isOpen={isOpen} onClose={onClose} title="确认取消上架">
          <div className="space-y-4">
            <p className="text-center">您确定要取消上架此NFT吗？</p>

            <div className="mt-2 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  NFT名称
                </span>
                <span className="font-medium">{selectedNFT.name}</span>
              </div>
              {selectedNFT.list_price && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    当前价格
                  </span>
                  <span className="font-medium">
                    {selectedNFT.list_price}{" "}
                    {selectedNFT.list_currency || "ETH"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between gap-4 mt-6">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isCancelling || isConfirmingCancel}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelListing}
                disabled={isCancelling || isConfirmingCancel}
                className="flex-1"
              >
                {isCancelling
                  ? "等待钱包确认..."
                  : isConfirmingCancel
                  ? "取消确认中..."
                  : "确认取消上架"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
