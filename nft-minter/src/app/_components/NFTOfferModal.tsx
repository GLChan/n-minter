"use client";

import React, { useState } from "react";
import Modal from "./ui/Modal";
import { Button } from "./ui/Button";
import { NFTInfo } from "@/app/_lib/types";
import toast from "react-hot-toast";
// import { addOrder } from "../_lib/data-service";
// import { ethToWei } from "../_lib/utils";
// import { NFTOrderStatus } from "../_lib/types/enums";
import { useUser } from "@/contexts/UserContext";

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

  const [offerAmount, setOfferAmount] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // 添加提交状态

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

      // offerer_id 为用户id

      // const nftOffer = await addOrder(
      //   {
      //     nft_id: nft.id,
      //     offerer_id: user.id, // 发出报价的用户
      //     offer_amount: ethToWei(offerAmount), // 报价金额。
      //     currency: "ETH",
      //     status: NFTOrderStatus.Active, // 初始状态为 pending
      //     expires_at: new Date(
      //       Date.now() + 7 * 24 * 60 * 60 * 1000
      //     ).toISOString(), // 报价有效期为7天
      //   },
      //   nft.name
      // );

      // toast.success("报价已提交并记录：" + nftOffer.id);
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
            disabled={isSubmitting} // 使用新的提交状态
            className="flex-1"
          >
            取消
          </Button>
          <Button
            onClick={handleSubmitOffer}
            disabled={
              isSubmitting || !offerAmount || parseFloat(offerAmount) <= 0
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
