"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import { NFTListModal } from "@/app/_components/NFTListModal";
import { NFTUnlistModal } from "@/app/_components/NFTUnlistModal";
import { NFTOfferModal } from "@/app/_components/NFTOfferModal"; // 引入 NFTOfferModal
import {
  NFTDetail,
  NFTInfo,
  OrderPayload,
  UserProfile,
} from "@/app/_lib/types";
import { NFTMarketStatus, TransactionType } from "@/app/_lib/types/enums";
import toast from "react-hot-toast";
import { getActiveOrderByNFTId } from "@/app/_lib/data-service";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
  useReadContract, // 引入 useReadContract
  useAccount, // 引入 useAccount
} from "wagmi";
import {
  MARKETPLACE_ABI,
  MARKETPLACE_CONTRACT_ADDRESS,
  ERC20_ABI, // 引入 ERC20_ABI
} from "@/app/_lib/constants";
import { useRouter } from "next/navigation";
import { env } from "@/app/_lib/config/env"; // 引入 env

interface NFTInteractionProps {
  userProfile: UserProfile | null;
  nft: NFTDetail;
}

export default function NFTInteraction({
  userProfile,
  nft,
}: Readonly<NFTInteractionProps>) {
  const router = useRouter();

  const { address: userWalletAddress } = useAccount(); // 获取当前连接的钱包地址
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false); // 添加授权状态

  const [showOfferModal, setShowOfferModal] = useState(false);
  const handleCloseOfferModal = () => setShowOfferModal(false);

  const [showListModal, setShowListModal] = useState(false);
  const handleCloseListModal = () => setShowListModal(false);

  const [showUnlistModal, setShowUnlistModal] = useState(false);
  const handleCloseUnlistModal = () => setShowUnlistModal(false);

  const nftObj: NFTInfo = {
    ...nft,
    profile: nft.owner,
  };

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

  // 查询 WETH 授权额度
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: env.NEXT_PUBLIC_WETH_CONTRACT_ADDRESS as `0x${string}`, // WETH 合约地址
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [userWalletAddress!, MARKETPLACE_CONTRACT_ADDRESS], // owner, spender
    query: {
      enabled: !!userWalletAddress && !!nft.list_price, // 只有当用户地址和 NFT 价格存在时才查询
    },
  });

  // 授权 WETH
  const {
    data: approveWriteResult,
    writeContractAsync: approveWriteContractAsync,
    error: approveWriteError,
  } = useWriteContract();

  const {
    isLoading: isApprovingConfirming,
    isSuccess: isApprovedConfirmed,
    isError: isApproveTransactionError,
    error: approveTransactionError,
  } = useWaitForTransactionReceipt({
    hash: approveWriteResult,
    confirmations: 1,
    retryDelay: 2000,
  });

  // 处理授权操作
  const handleApprove = async () => {
    if (!userWalletAddress || !nft.list_price) {
      toast.error("无法授权：缺少钱包地址或 NFT 价格。");
      return;
    }
    setIsApproving(true);
    try {
      await approveWriteContractAsync({
        address: env.NEXT_PUBLIC_WETH_CONTRACT_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [MARKETPLACE_CONTRACT_ADDRESS, BigInt(nft.list_price!)], // 授权 Marketplace 合约使用 WETH
      });
      toast.loading("正在发送授权交易，请稍候...");
    } catch (error) {
      console.error("授权合约调用失败:", error);
      setIsApproving(false);
      toast.error(`授权失败: ${(error as Error).message}`);
    }
  };

  // 处理购买 NFT 操作
  const handleBuyNFT = async (nft: NFTInfo) => {
    console.log(`购买NFT: ${nft.name}`);

    if (!userWalletAddress) {
      toast.error("请先连接钱包。");
      return;
    }

    // 检查授权额度
    console.log("当前授权额度:", allowance);
    if (
      allowance === undefined ||
      (allowance && BigInt(allowance.toString()) < BigInt(nft.list_price || 0))
    ) {
      toast.error("WETH 授权额度不足，请先授权。");
      // 这里不直接调用授权，而是让用户点击授权按钮
      return;
    }

    // 请求合约 Order 数据 和 签名
    const orderData = await getActiveOrderByNFTId(nft.id);
    console.log("获取到的订单数据:", orderData);
    if (!orderData) {
      toast.error("未找到有效的挂单，无法购买此NFT");
      return;
    }

    // 调用合约 fulfillOrder
    const order: OrderPayload = {
      seller: orderData.seller_address as `0x${string}`,
      buyer: orderData.buyer_address as `0x${string}`,
      nftAddress: orderData.nft_address! as `0x${string}`,
      tokenId: BigInt(orderData.token_id!),
      currency: orderData.currency as `0x${string}`, // 使用 WETH 地址
      price: BigInt(orderData.price_wei || 0),
      nonce: BigInt(`${orderData.nonce}`),
      deadline: BigInt(orderData.deadline_timestamp!),
    };

    // 1. 发送交易
    try {
      const hash = await writeContractAsync({
        address: MARKETPLACE_CONTRACT_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: "fulfillOrder",
        args: [order, orderData.signature],
      });
      console.log("交易已发送, 哈希:", hash);
    } catch (error) {
      console.error("合约调用失败:", error);
      setIsSubmitting(false); // 停止加载状态
      toast.error(`合约调用失败: ${(error as Error).message}`);
      return; // 提前退出，不继续后续逻辑
    }
  };

  // 处理购买交易的 useEffect
  useEffect(() => {
    if (writeContractError) {
      console.error("购买合约调用错误:", writeContractError);
      setIsSubmitting(false);
    }
  }, [writeContractError]);

  useEffect(() => {
    const fetchRecord = async () => {
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
              price: BigInt(nft.list_price).toString(),
              sellerAddress: nft.owner_address,
              buyerAddress: userWalletAddress,
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

      console.log("购买交易已确认:", writeContractResult);
      toast.success("NFT购买成功!");
      router.push(`/profile?tab=nft`);
    } else if (isTransactionError) {
      setIsSubmitting(false);
      console.error("购买交易确认失败:", transactionError);
      toast.error(
        `购买交易确认失败: ${transactionError?.message || "未知错误"}`
      );
    }
  }, [
    writeContractResult,
    isConfirming,
    isConfirmed,
    isTransactionError,
    transactionError,
    router,
    userProfile,
    nft.list_price,
    nft.id,
    userWalletAddress,
    nft.owner_address,
  ]);

  // 处理授权交易的 useEffect
  useEffect(() => {
    if (approveWriteError) {
      console.error("授权合约调用错误:", approveWriteError);
      setIsApproving(false);
      toast.error(`授权失败: ${approveWriteError.message}`);
    }
  }, [approveWriteError]);

  useEffect(() => {
    if (!approveWriteResult) return;

    if (isApprovingConfirming) {
      setIsApproving(true);
      toast.loading("正在确认授权交易，请稍候...");
    } else if (isApprovedConfirmed) {
      setIsApproving(false);
      console.log("授权交易已确认:", approveWriteResult);
      toast.success("WETH 授权成功!");
      refetchAllowance(); // 授权成功后重新查询授权额度
    } else if (isApproveTransactionError) {
      setIsApproving(false);
      console.error("授权交易确认失败:", approveTransactionError);
      toast.error(
        `授权交易确认失败: ${approveTransactionError?.message || "未知错误"}`
      );
    }
  }, [
    approveWriteResult,
    isApprovingConfirming,
    isApprovedConfirmed,
    isApproveTransactionError,
    approveTransactionError,
    refetchAllowance,
  ]);

  // 计算拥有者按钮内容
  const getOwnerButton = () => {
    const isOwner = userProfile && nft.owner_address === userProfile.wallet_address;
    if (!isOwner) return null;

    if (nft.list_status === NFTMarketStatus.NotListed) {
      return (
        <Button size="lg" onClick={() => setShowListModal(true)}>
          上架
        </Button>
      );
    } else {
      return (
        <Button size="lg" onClick={() => setShowUnlistModal(true)}>
          下架
        </Button>
      );
    }
  };

  return (
    <>
      {getOwnerButton() || (
        <div className="flex gap-2">
          {/* 检查是否需要授权 */}
          {userWalletAddress &&
          allowance !== undefined &&
          BigInt(allowance!.toString()) < BigInt(nft.list_price || 0) ? (
            <Button
              size="lg"
              disabled={isApproving || isSubmitting}
              onClick={handleApprove}
            >
              {isApproving ? "授权中..." : "授权 WETH"}
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                disabled={isSubmitting || isApproving} // 购买时也禁用授权按钮
                onClick={() => {
                  if (nft.list_status === NFTMarketStatus.NotListed) {
                    toast.error("此NFT未上架，无法购买");
                    return;
                  }
                  handleBuyNFT(nftObj);
                }}
              >
                {isSubmitting ? "购买中..." : "购买此 NFT"}
              </Button>

              <Button
                disabled={isSubmitting || isApproving}
                size="lg"
                onClick={() => setShowOfferModal(true)}
              >
                报价
              </Button>
            </>
          )}
        </div>
      )}

      {/* NFT上架模态框 */}
      <NFTListModal
        nft={nftObj}
        isOpen={showListModal}
        onClose={handleCloseListModal}
      />

      {/* NFT下架模态框 */}
      <NFTUnlistModal
        nft={nftObj}
        isOpen={showUnlistModal}
        onClose={handleCloseUnlistModal}
      />

      {/* NFT报价模态框 */}
      <NFTOfferModal
        nft={nftObj}
        isOpen={showOfferModal}
        onClose={handleCloseOfferModal}
      />
    </>
  );
}
