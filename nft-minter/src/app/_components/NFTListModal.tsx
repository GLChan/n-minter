"use client";

import React from "react";
import Modal from "./ui/Modal";
import ListNFTForm from "./ui/ListNFTForm";
import { NFTInfo } from "@/app/_lib/types";
export const NFTListModal = ({
  nft,
  isOpen,
  onClose,
}: {
  nft: NFTInfo | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const selectedNFT = nft;

  return (
    <>
      {selectedNFT && (
        <Modal isOpen={isOpen} onClose={onClose} title="上架NFT出售">
          <ListNFTForm
            nft={selectedNFT}
            onSuccess={onClose}
            onCancel={onClose}
          />
        </Modal>
      )}
    </>
  );
};
