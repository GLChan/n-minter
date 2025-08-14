"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/app/_components/ui/Button";
import { OrderItem, OrderPayload } from "@/app/_lib/types";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  MARKETPLACE_ABI,
  MARKETPLACE_CONTRACT_ADDRESS,
} from "@/app/_lib/constants";
import { createClient } from "@/app/_lib/supabase/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { NFTOrderStatus, TransactionType } from "@/app/_lib/types/enums";

interface OfferActionButtonsProps {
  offer: OrderItem;
}

export const OfferActionButtons: React.FC<OfferActionButtonsProps> = ({
  offer,
}) => {
  const supabase = createClient();
  const router = useRouter();
  const { address } = useAccount(); // 获取当前连接的钱包地址
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [actionError, setActionError] = useState<string | null>(null);
  const [isRejectingOffer, setIsRejectingOffer] = useState(false); // 新增拒绝报价的提交状态

  const {
    data: writeContractResult,
    writeContractAsync,
    error: writeContractError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isTransactionError,
    error: transactionError,
  } = useWaitForTransactionReceipt({
    hash: writeContractResult,
    confirmations: 1,
    retryDelay: 2000,
    onReplaced: (replacement) => {
      console.log("交易被替换:", replacement);
    },
  });

  // 处理购买交易的 useEffect
  useEffect(() => {
    if (writeContractError) {
      console.error("接受报价 合约调用错误:", writeContractError);
      setIsSubmitting(false);
    }
  }, [writeContractError]);

  useEffect(() => {
    const fetchRecord = async () => {
      const { nft } = offer;
      if (!nft) {
        console.error("NFT信息缺失");
        return;
      }
      if (nft.list_price && nft.id) {
        try {
          const response = await fetch("/api/transaction/record", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nftId: nft.id,
              transactionType: TransactionType.Sale,
              transactionHash: writeContractResult,
              price: offer.price_wei,
              sellerAddress: offer.seller_address,
              buyerAddress: offer.buyer_address,
            }),
          });

          const data = await response.json();
          if (response.ok) {
            console.log("交易记录成功！", data.transaction);
          } else {
            throw new Error(data.details || "未知错误");
          }
        } catch (recordError) {
          console.error("记录交易失败:", recordError);
          toast.error(`交易记录失败: ${(recordError as Error).message}`);
        }
      }
    };

    if (!writeContractResult) return;

    if (isConfirming) {
      setIsSubmitting(true);
      toast.loading("正在确认购买交易，请稍候...");
    } else if (isConfirmed) {
      setIsSubmitting(false);

      // 记录交易 (通过 API 调用)
      fetchRecord();

      console.log("接受报价交易已确认:", writeContractResult);
      toast.success("NFT接受报价成功!");
      router.push(`/profile?tab=nft`);
    } else if (isTransactionError) {
      setIsSubmitting(false);
      console.error("接受报价交易确认失败:", transactionError);
      toast.error(
        `接受报价交易确认失败: ${transactionError?.message || "未知错误"}`
      );
    }
  }, [
    writeContractResult,
    isConfirming,
    isConfirmed,
    isTransactionError,
    transactionError,
    router,
    offer,
  ]);

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

    // 调用合约 fulfillOffer
    const order: OrderPayload = {
      seller: offer.seller_address as `0x${string}`,
      buyer: offer.buyer_address as `0x${string}`,
      nftAddress: offer.nft_address! as `0x${string}`,
      tokenId: BigInt(offer.token_id!),
      currency: offer.currency_address as `0x${string}`, // 使用 WETH 地址
      price: BigInt(offer.price_wei || 0),
      nonce: BigInt(`${offer.nonce}`),
      deadline: BigInt(offer.deadline_timestamp!),
    };

    console.log("准备调用合约 fulfillOffer:", order);
    
    // 1. 发送交易
    try {
      const hash = await writeContractAsync({
        address: MARKETPLACE_CONTRACT_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: "fulfillOffer",
        args: [order, offer.signature],
      });
      console.log("交易已发送, 哈希:", hash);
    } catch (error) {
      console.error("合约调用失败:", error);
      setIsSubmitting(false); // 停止加载状态
      toast.error(`合约调用失败: ${(error as Error).message}`);
      return; // 提前退出，不继续后续逻辑
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
        .from("orders")
        .update({ status: NFTOrderStatus.Rejected }) // 直接更新状态为 rejected
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

  const isLoading = isSubmitting || isConfirming || isRejectingOffer; // 更新 isLoading

  // 获取接受按钮的文本
  const getAcceptButtonText = () => {
    if (isSubmitting) {
      return "等待钱包确认...";
    }
    if (isConfirming) {
      return "接受确认中...";
    }
    return "接受";
  };

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
        {getAcceptButtonText()}
      </Button>
    </div>
  );
};
