"use client";

import React, { useState } from "react";
import Modal from "./ui/Modal";
import { NFTInfo } from "@/app/_lib/types";
import toast from "react-hot-toast";
import { Button } from "./ui/Button";
import { unlistNFT } from "@/app/_lib/data-service";
import { useRouter } from "next/navigation";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedNFT = nft;

  const handleUnlistNFT = async () => {
    if (!selectedNFT) return;

    try {
      setIsSubmitting(true);
      console.log(`取消上架NFT: ID ${selectedNFT.id}`);

      // 调用取消上架API
      await unlistNFT(selectedNFT.id, selectedNFT.owner_address);

      // 成功提示
      toast.success("NFT已取消上架");

      // 跳转到NFT详情页面
      router.push(`/nft/${selectedNFT.id}`);

      // 关闭弹窗
      onClose();
    } catch (error) {
      console.error("取消上架NFT失败:", error);
      toast.error("取消上架失败，请重试");
    } finally {
      setIsSubmitting(false);
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
                disabled={isSubmitting}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={handleUnlistNFT}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "处理中..." : "确认取消上架"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
