"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/app/_components/ui/Button";
import { NFTOfferItem } from "@/app/_lib/types";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { MARKETPLACE_ABI } from "@/app/_lib/constants";
import { env } from "@/app/_lib/config/env";
import { createClient } from "@/app/_lib/supabase/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { NFTOfferStatus } from "@/app/_lib/types/enums";

interface OfferActionButtonsProps {
  offer: NFTOfferItem;
}

export const OfferActionButtons: React.FC<OfferActionButtonsProps> = ({
  offer,
}) => {
  const supabase = createClient();
  const router = useRouter();
  const { address } = useAccount();
  const marketplaceAddress =
    env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`;

  const [actionError, setActionError] = useState<string | null>(null);
  const [isRejectingOffer, setIsRejectingOffer] = useState(false); // 新增拒绝报价的提交状态

  // 接受报价合约交互
  const {
    data: acceptTxHash,
    writeContractAsync: writeAcceptOffer,
    isPending: isAccepting,
    error: writeAcceptError,
  } = useWriteContract();

  const { isLoading: isConfirmingAccept, isSuccess: isAcceptConfirmed } =
    useWaitForTransactionReceipt({
      hash: acceptTxHash,
    });

  // 处理合约交易错误
  useEffect(() => {
    if (writeAcceptError) {
      setActionError(writeAcceptError.message);
      toast.error(`接受报价失败: ${writeAcceptError.message}`);
    }
  }, [writeAcceptError]);

  // 处理接受报价成功后的Supabase更新
  useEffect(() => {
    if (isAcceptConfirmed) {
      const updateOfferStatus = async () => {
        try {
          const { error: dbError } = await supabase
            .from("nft_offers")
            .update({ status: "accepted" })
            .eq("id", offer.id);

          if (dbError) {
            throw new Error(dbError.message);
          }
          toast.success("报价已接受并更新状态");
          router.refresh(); // 刷新页面数据
        } catch (dbError) {
          console.error("更新Supabase接受报价状态失败:", dbError);
          toast.error(
            `更新状态失败: ${
              dbError instanceof Error ? dbError.message : "未知错误"
            }`
          );
        }
      };
      updateOfferStatus();
    }
  }, [isAcceptConfirmed, offer.id, router, supabase]);

  const handleAcceptOffer = async () => {
    setActionError(null);
    if (!address) {
      setActionError("请连接钱包");
      return;
    }
    if (!offer.nft) {
      setActionError("NFT信息缺失");
      return;
    }

    try {
      await writeAcceptOffer({
        abi: MARKETPLACE_ABI,
        address: marketplaceAddress,
        functionName: "acceptOffer",
        args: [
          offer.nft.contract_address as `0x${string}`,
          BigInt(offer.nft.token_id!),
          offer.offerer_id, // 报价者的用户ID
          BigInt(offer.offer_amount!), // 报价金额
        ],
      });
    } catch (err) {
      console.error("接受报价合约调用失败:", err);
      setActionError(err instanceof Error ? err.message : "接受报价失败");
    }
  };

  const handleRejectOffer = async () => {
    setActionError(null);
    if (!address) {
      setActionError("请连接钱包");
      return;
    }
    if (!offer.nft) {
      setActionError("NFT信息缺失");
      return;
    }

    setIsRejectingOffer(true); // 开始拒绝报价的提交
    try {
      const { error: dbError } = await supabase
        .from("nft_offers")
        .update({ status: NFTOfferStatus.REJECTED }) // 直接更新状态为 rejected
        .eq("id", offer.id);

      if (dbError) {
        throw new Error(dbError.message);
      }
      toast.success("报价已拒绝并更新状态");
      router.refresh(); // 刷新页面数据
    } catch (err) {
      console.error("拒绝报价失败:", err);
      setActionError(err instanceof Error ? err.message : "拒绝报价失败");
      toast.error(
        `拒绝报价失败: ${err instanceof Error ? err.message : "未知错误"}`
      );
    } finally {
      setIsRejectingOffer(false); // 结束拒绝报价的提交
    }
  };

  const isLoading = isAccepting || isConfirmingAccept || isRejectingOffer; // 更新 isLoading

  return (
    <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 ml-auto">
      {actionError && (
        <p className="text-sm text-red-500 text-center">{actionError}</p>
      )}
      <Button
        variant="secondary"
        size="sm"
        onClick={handleRejectOffer}
        disabled={isLoading}
      >
        {isRejectingOffer ? "处理中..." : "拒绝"} {/* 更新按钮文本 */}
      </Button>
      <Button
        size="sm"
        variant="primary"
        onClick={handleAcceptOffer}
        disabled={isLoading}
      >
        {isAccepting
          ? "等待钱包确认..."
          : isConfirmingAccept
          ? "接受确认中..."
          : "接受"}
      </Button>
    </div>
  );
};
