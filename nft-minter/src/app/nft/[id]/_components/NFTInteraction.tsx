"use client";

import React, { useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import { NFTListModal } from "@/app/_components/NFTListModal";
import { NFTUnlistModal } from "@/app/_components/NFTUnlistModal";
import { NFTOfferModal } from "@/app/_components/NFTOfferModal"; // 引入 NFTOfferModal
import { NFTDetail, NFTInfo, UserProfile } from "@/app/_lib/types";
import { NFTMarketStatus } from "@/app/_lib/types/enums";

interface NFTInteractionProps {
  userProfile: UserProfile | null;
  nft: NFTDetail;
}

export default function NFTInteraction({
  userProfile,
  nft,
}: Readonly<NFTInteractionProps>) {
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
          <Button size="lg">购买此 NFT</Button>
          <Button size="lg" onClick={() => setShowOfferModal(true)}>
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
