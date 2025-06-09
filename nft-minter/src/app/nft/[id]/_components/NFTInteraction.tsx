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
import { NFTMarketStatus } from "@/app/_lib/types/enums";
import toast from "react-hot-toast";
import { getActiveOrderByNFTId } from "@/app/_lib/data-service";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { MARKETPLACE_ABI } from "@/app/_lib/constants";
import { useRouter } from "next/navigation";
import { env } from "@/app/_lib/config/env";
import { parseEther } from "viem";

interface NFTInteractionProps {
  userProfile: UserProfile | null;
  nft: NFTDetail;
}

export default function NFTInteraction({
  userProfile,
  nft,
}: Readonly<NFTInteractionProps>) {
  const router = useRouter();

  const { address } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const { data: writeContractResult, writeContractAsync } = useWriteContract();
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

  const handleBuyNFT = async (nft: NFTInfo) => {
    console.log(`购买NFT: ${nft.name}`);

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
      buyer: address as `0x${string}`,
      nftAddress: nft.contract_address! as `0x${string}`,
      tokenId: BigInt(nft.token_id!),
      currency: env.NEXT_PUBLIC_WETH_CONTRACT_ADDRESS as `0x${string}`, // 使用 WETH 地址
      price: orderData.price_wei
        ? parseEther(orderData.price_wei.toString())
        : BigInt(0), // 确保价格是 BigInt 类型
      // 生产环境中应从后端获取或调用合约的 userNonces(address)
      nonce: BigInt(`${orderData.nonce}`), // 示例值，实际应从合约获取
      deadline: BigInt(Math.floor(Date.now() / 1000) + 86400), // 24小时后过期
    };

    // 1. 发送交易
    const hash = await writeContractAsync({
      address: nft.contract_address as `0x${string}`,
      abi: MARKETPLACE_ABI,
      functionName: "fulfillOrder",
      args: [order, orderData.signature],
    });

    console.log("交易已发送, 哈希:", hash);

    // 这里可以添加购买逻辑
    // toast.success(`购买 ${nft.name} 成功！`);
  };

  useEffect(() => {
    if (!writeContractResult) return;

    if (isConfirming) {
      setIsSubmitting(true);
      toast.loading("正在确认交易，请稍候...");
    }

    if (isConfirmed) {
      setIsSubmitting(false);
      console.log("交易已确认:", writeContractResult);
      toast.success("NFT购买成功!");
      router.push(`/profile?tab=nft`);
    }
  }, [writeContractResult, isConfirming, isConfirmed, router]);

  return (
    <>
      {userProfile && nft.owner_address === userProfile.wallet_address ? (
        nft.list_status === NFTMarketStatus.NotListed ? (
          <Button size="lg" onClick={() => setShowListModal(true)}>
            上架
          </Button>
        ) : (
          <Button size="lg" onClick={() => setShowUnlistModal(true)}>
            下架
          </Button>
        )
      ) : (
        <div className="flex gap-2">
          <Button
            size="lg"
            disabled={isSubmitting}
            onClick={() => {
              if (nft.list_status === NFTMarketStatus.NotListed) {
                toast.error("此NFT未上架，无法购买");
                return;
              }
              // 这里可以添加购买逻辑
              handleBuyNFT(nftObj);
            }}
          >
            购买此 NFT
          </Button>
          <Button
            disabled={isSubmitting}
            size="lg"
            onClick={() => setShowOfferModal(true)}
          >
            报价
          </Button>
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
