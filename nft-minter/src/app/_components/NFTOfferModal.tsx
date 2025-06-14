"use client";

import React, { useState } from "react";
import Modal from "./ui/Modal";
import { Button } from "./ui/Button";
import { EIP712_TYPES, NFTInfo, OrderPayload } from "@/app/_lib/types";
import toast from "react-hot-toast";
import { addOrder } from "../_lib/data-service";
import { useUser } from "@/contexts/UserContext";
import { useAccount, useChainId, useReadContract, useSignTypedData } from "wagmi";
import {
  MARKETPLACE_ABI,
  MARKETPLACE_CONTRACT_ADDRESS,
  MARKETPLACE_NAME,
  MARKETPLACE_VERSION,
  SECONDS_IN_A_DAY
} from "@/app/_lib/constants";
import { env } from "../_lib/config/env";
import { parseEther } from "viem";

interface NFTOfferModalProps {
  nft: NFTInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NFTOfferModal: React.FC<NFTOfferModalProps> = ({
  nft,
  isOpen,
  onClose,
}) => {
  const user = useUser();
  const { address } = useAccount();

  const chainId = useChainId(); // 获取当前链ID

  const [offerAmount, setOfferAmount] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // 添加提交状态

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
  if (!user) {
    return <> </>; // 或者显示一个错误提示
  }
  const handleSubmitOffer = async () => {
    setError(null);
    if (
      !offerAmount ||
      isNaN(Number(offerAmount)) ||
      Number(offerAmount) <= 0
    ) {
      setError("请输入有效的报价金额");
      return;
    }
    if (!nft) {
      setError("NFT信息缺失");
      return;
    }

    setIsSubmitting(true); // 开始提交
    try {
      // 检查报价金额是否大于0
      if (Number(offerAmount) <= 0) {
        setError("报价金额必须大于0");
        return;
      }

      const { data: latestNonce, isSuccess } = await refetchNonce();
      console.log("最新的 nonce:", latestNonce);
      if (!isSuccess) throw new Error("Failed to fetch nonce");

      // 1. 准备订单数据
      // 注意: nonce 应从后端或链上获取，这里用 0n 作为示例
      const order: OrderPayload = {
        seller: nft.owner_address! as `0x${string}`, // NFT 当前所有者地址
        buyer: address!, // 公开挂单
        nftAddress: nft.contract_address! as `0x${string}`,
        tokenId: BigInt(nft.token_id!),
        currency: env.NEXT_PUBLIC_WETH_CONTRACT_ADDRESS as `0x${string}`, // 使用 WETH 地址
        price: parseEther(offerAmount),
        // 生产环境中应从后端获取或调用合约的 userNonces(address)
        nonce: BigInt(`${latestNonce}`), // 示例值，实际应从合约获取
        deadline: BigInt(Math.floor(Date.now() / 1000) + SECONDS_IN_A_DAY * 7), // 7天有效期
      };

      // 2. 请求用户签名
      const signature = await signTypedDataAsync({
        domain,
        types: EIP712_TYPES,
        primaryType: "Order",
        message: order,
      });

      // offerer_id 为用户id
      const nftOffer = await addOrder(
        nft.id,
        order,
        signature
      );

      toast.success("报价已提交并记录：" + nftOffer.id);
      onClose();
      setOfferAmount(""); // 清空输入
    } catch (err) {
      console.error("提交报价失败:", err);
      setError(err instanceof Error ? err.message : "提交报价失败");
      toast.error(
        `提交报价失败: ${err instanceof Error ? err.message : "未知错误"}`
      );
    } finally {
      setIsSubmitting(false); // 结束提交
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="提交报价">
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <label
            htmlFor="offerAmount"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            报价金额 (ETH)
          </label>
          <input
            type="number"
            id="offerAmount"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={offerAmount}
            onChange={(e) => {
              setOfferAmount(e.target.value);
              setError(null);
            }}
            disabled={isSubmitting} // 使用新的提交状态
          />
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
        <div className="flex justify-between gap-4 mt-6">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting || isSigning} // 使用新的提交状态
            className="flex-1"
          >
            取消
          </Button>
          <Button
            onClick={handleSubmitOffer}
            disabled={
              isSubmitting ||
              isSigning ||
              !offerAmount ||
              parseFloat(offerAmount) <= 0
            } // 使用新的提交状态
            className="ml-2 flex-1"
          >
            {isSubmitting ? "提交中..." : "提交报价"} {/* 更新按钮文本 */}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
