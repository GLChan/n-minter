"use client";

import React, { useEffect, useState } from "react";
import { NFTCard } from "@/app/_components/ui/NFTCard";
import { getUserNFTs } from "@/app/_lib/data-service";
import { NFTInfo, UserProfile } from "@/app/_lib/types";
import Link from "next/link";
import { NFTListModal } from "@/app/_components/NFTListModal";
import { NFTUnlistModal } from "@/app/_components/NFTUnlistModal";
import { TransactionType } from "@/app/_lib/types/enums";
import { NFTTransferModal } from "@/app/_components/NFTTransferModal";

interface OwnedNFTsTabProps {
  page: number;
  profile: UserProfile;
}

export default function OwnedNFTsTab({ page, profile }: OwnedNFTsTabProps) {
  const [nfts, setNfts] = useState<NFTInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeModalType, setActiveModalType] = useState<string | null>(null);
  const [currentItemData, setCurrentItemData] = useState<NFTInfo | null>(null);

  const openModal = (modalType: string, nft: NFTInfo) => {
    setActiveModalType(modalType);
    setCurrentItemData(nft);
  };

  const closeModal = () => {
    setActiveModalType(null);
    setCurrentItemData(null);
  };

  useEffect(() => {
    async function loadNFTs() {
      try {
        setLoading(true);
        const nftData = await getUserNFTs({
          page,
          pageSize: 10,
          ownerId: profile.id,
        });
        setNfts(nftData);
      } catch (error) {
        console.error("加载NFT时出错:", error);
      } finally {
        setLoading(false);
      }
    }

    loadNFTs();
  }, [page, profile.id]);

  return (
    <div>
      {loading && (
        <div className="flex justify-center py-12">
          <div className="spinner"></div>
        </div>
      )}

      {/* 上架NFT Modal */}
      <NFTListModal
        isOpen={activeModalType === TransactionType.List}
        nft={currentItemData}
        onClose={closeModal}
      />

      {/* 取消上架NFT Modal */}
      <NFTUnlistModal
        isOpen={activeModalType === TransactionType.Unlist}
        nft={currentItemData}
        onClose={closeModal}
      />

      {/* 转移 NFT */}
      <NFTTransferModal
        isOpen={activeModalType === TransactionType.Transfer}
        nft={currentItemData}
        onClose={closeModal}
      />

      {!loading && nfts && nfts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {nfts.map((nft) => (
            <NFTCard
              key={nft.id}
              nft={nft}
              isOwner={true}
              openModal={openModal}
            />
          ))}
        </div>
      )}

      {!loading && nfts && nfts.length === 0 && (
        <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">
            您目前还没有任何 NFT
          </p>
          <Link
            href="/create"
            className="px-4 py-2 bg-primary rounded-md hover:bg-primary/90 transition-colors"
          >
            开始创建 NFT
          </Link>
        </div>
      )}
    </div>
  );
}
