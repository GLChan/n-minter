"use client";
import { useState } from "react"; // Keep useState for local UI state if needed, useEffect may not be needed for main flow
import {
  useAccount,
  // useWriteContract, // Replaced by writeContract action
  // useWaitForTransactionReceipt, // Replaced by waitForTransactionReceipt action
} from "wagmi";
import {
  writeContract,
  waitForTransactionReceipt,
  // For wagmi v2, you get config from useAccount or directly from wagmi config setup
} from "@wagmi/core";
import { useConfig } from "wagmi"; // To get the wagmi config for actions

import { id as ethersId } from "ethers"; // ethers v6
// For ethers v5, it might be: import { id } from "@ethersproject/hash";

import { MY_NFT_ABI } from "@/app/_lib/constants";
import { createClient } from "../_lib/supabase/client";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast"; // Assuming you use react-hot-toast or similar

export type Attribute = { key: string; value: string };

export type CreateNFTFormInputs = {
  file: FileList | null;
  name: string;
  description: string;
  attributes: Attribute[];
  collection: string; // This would be the collection ID/slug
  explicit: boolean;
  contractAddress: string; // This will be derived or part of collection data
};

// Define the type of data returned by the mutation on success
interface CreateNFTMutationData {
  txHash: string;
  tokenId: string | number;
  nftId: string; // Supabase ID
  imageURI: string;
  tokenURI: string;
}

// Define the type for errors
type CreateNFTError = Error;

// --- Helper: Parse Token ID from receipt ---
// (This can be outside the hook or a static method if preferred)
const parseTokenIdFromReceipt = (
  receipt: { logs?: { address?: string; topics: string[] }[] },
  contractAddress: string,
  recipientAddress: string
): string | number => {
  let tokenId: string | number = "未知";
  try {
    if (!receipt.logs || receipt.logs.length === 0) {
      console.warn("Warning: Transaction logs are empty, cannot get Token ID.");
      return "pending_logs"; // Indicate logs were missing
    }

    const transferSignature = "Transfer(address,address,uint256)";
    const transferTopic = ethersId(transferSignature);

    const transferLog = receipt.logs.find(
      (log: { address?: string; topics: string[] }) =>
        log.address?.toLowerCase() === contractAddress.toLowerCase() &&
        log.topics[0] === transferTopic &&
        log.topics.length === 4 && // from, to, tokenId
        log.topics[2]
          ?.toLowerCase()
          .includes(recipientAddress.slice(2).toLowerCase()) // to address
    );

    if (transferLog && transferLog.topics[3]) {
      tokenId = BigInt(transferLog.topics[3]).toString();
      console.log("Parsed Token ID:", tokenId);
    } else {
      console.warn("No matching Transfer event found to parse Token ID.");
      tokenId = "pending_event"; // Indicate event was not found
    }
  } catch (e) {
    console.error("Error parsing Token ID:", e);
    tokenId = "error_parsing"; // Indicate parsing error
  }
  return tokenId;
};

export function useCreateNFT() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { address, isConnected, chain } = useAccount();
  const wagmiConfig = useConfig(); // Get wagmi config for core actions

  const [currentProcessingStep, setCurrentProcessingStep] =
    useState<string>("");

  const mutation = useMutation<
    CreateNFTMutationData,
    CreateNFTError,
    CreateNFTFormInputs // Input to mutate() will be form inputs
  >({
    mutationFn: async (
      formData: CreateNFTFormInputs
    ): Promise<CreateNFTMutationData> => {
      if (!isConnected || !address || !chain) {
        throw new Error("Please connect your wallet.");
      }
      if (!formData.file || formData.file.length === 0) {
        throw new Error("Please select a file to upload.");
      }
      if (!formData.name.trim()) {
        throw new Error("NFT name cannot be empty.");
      }
      if (!formData.contractAddress) {
        throw new Error(
          "Contract address is missing. Please select a collection."
        );
      }

      const toastId = "create-nft-progress";
      let currentTokenURI: string | null = null;
      let currentImageURI: string | null = null;
      let transactionHash: `0x${string}` | undefined = undefined;

      try {
        // --- Step 1: Uploading file and metadata ---
        setCurrentProcessingStep("Uploading file and metadata...");
        toast.loading("Uploading file and metadata...", { id: toastId });

        const fileToUpload = formData.file[0];
        const uploadFormData = new FormData();
        uploadFormData.append("file", fileToUpload);
        uploadFormData.append("name", formData.name);
        uploadFormData.append("description", formData.description);
        const validAttributes = formData.attributes.filter(
          (attr) => attr.key && attr.value
        );
        uploadFormData.append("attributes", JSON.stringify(validAttributes));

        const uploadResponse = await fetch("/api/nft/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(
            errorData.error ||
              `IPFS Upload Failed: ${uploadResponse.statusText}`
          );
        }
        const { tokenURI, imageURI } = await uploadResponse.json();
        if (!tokenURI) throw new Error("Failed to get Token URI from server.");
        currentTokenURI = tokenURI;
        currentImageURI = imageURI;
        toast.success("File uploaded!", { id: toastId });

        // --- Step 2: Minting NFT ---
        setCurrentProcessingStep("Waiting for wallet confirmation to mint...");
        toast.loading("Waiting for wallet confirmation to mint...", {
          id: toastId,
        });

        // Use wagmi core action
        transactionHash = await writeContract(wagmiConfig, {
          address: formData.contractAddress as `0x${string}`,
          abi: MY_NFT_ABI,
          functionName: "safeMint",
          args: [address, tokenURI],
          // chainId: chain.id // Optional if wagmiConfig is multi-chain aware and user is on correct chain
        });
        if (!transactionHash)
          throw new Error("Minting transaction failed to initiate.");
        toast.success("Minting transaction submitted!", { id: toastId });

        // --- Step 3: Confirming Transaction ---
        setCurrentProcessingStep("Confirming transaction on the blockchain...");
        toast.loading("Confirming transaction...", { id: toastId });

        // Use wagmi core action
        const receipt = await waitForTransactionReceipt(wagmiConfig, {
          hash: transactionHash,
          confirmations: 1,
          // chainId: chain.id // Optional
        });
        if (receipt.status === "reverted") {
          throw new Error("Transaction reverted by the blockchain.");
        }
        toast.success("Transaction confirmed!", { id: toastId });

        // --- Step 4: Saving NFT to Supabase ---
        setCurrentProcessingStep("Saving NFT information...");
        toast.loading("Saving NFT information...", { id: toastId });

        const tokenId = parseTokenIdFromReceipt(
          receipt,
          formData.contractAddress,
          address
        );

        const supabase = createClient();
        const sessionResponse = await supabase.auth.getSession();
        const accessToken = sessionResponse.data.session?.access_token;

        if (!accessToken) {
          throw new Error("Authentication failed. Cannot save NFT data.");
        }

        const nftDataToSave = {
          tokenId: tokenId.toString(),
          tokenURI: currentTokenURI,
          ownerAddress: address,
          contractAddress: formData.contractAddress,
          chainId: chain.id,
          name: formData.name,
          description: formData.description,
          imageUrl: currentImageURI,
          attributes: formData.attributes.filter(
            (attr) => attr.key && attr.value
          ),
          transactionHash: receipt.transactionHash,
          collectionId: formData.collection, // Assuming collection is an ID/slug
          status:
            (typeof tokenId === "string" && tokenId.startsWith("pending_")) ||
            tokenId === "error_parsing" ||
            tokenId === "未知"
              ? "pending_finalization" // More specific status
              : "completed",
        };

        const saveResponse = await fetch("/api/nft/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(nftDataToSave),
        });

        if (!saveResponse.ok) {
          const errorData = await saveResponse.json();
          throw new Error(
            errorData.details ||
              errorData.error ||
              `Failed to save NFT data: ${saveResponse.statusText}`
          );
        }
        const saveData = await saveResponse.json();
        toast.success("NFT information saved!", { id: toastId });

        return {
          txHash: receipt.transactionHash,
          tokenId,
          nftId: saveData.data.id, // Assuming your API returns { data: { id: ... } }
          imageURI: currentImageURI || "",
          tokenURI: currentTokenURI || "",
        };
      } catch (err: unknown) {
        console.error("NFT Creation process error:", err);
        let errorMessage = "An unknown error occurred.";
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === "string") {
          errorMessage = err;
        } else if (
          err &&
          err instanceof Error &&
          typeof err.message === "string"
        ) {
          errorMessage = err.message;
        }

        if (errorMessage.toLowerCase().includes("user rejected")) {
          errorMessage = "Wallet operation rejected by user.";
        } else if (
          transactionHash &&
          errorMessage.toLowerCase().includes("transaction reverted")
        ) {
          errorMessage = `Minting transaction reverted. Hash: ${transactionHash}`;
        } else if (
          transactionHash &&
          !errorMessage.toLowerCase().includes("failed to save nft data")
        ) {
          // If minting might have succeeded but saving failed, provide hash
          errorMessage = `NFT might be minted (Tx: ${transactionHash}), but saving data failed: ${errorMessage}`;
        }

        toast.error(errorMessage, { id: toastId, duration: 5000 });
        throw new Error(errorMessage); // Rethrow to be caught by onError
      }
    },
    onMutate: () => {
      // Optional: Actions to take when mutation starts
      // e.g., disable form, optimistic updates (more complex)
    },
    onSuccess: (data, variables) => {
      setCurrentProcessingStep("");
      toast.success(
        `NFT Created! Token ID: ${data.tokenId}. Supabase ID: ${data.nftId}`,
        {
          duration: 6000,
        }
      );
      // Invalidate queries that list NFTs or user's NFTs
      queryClient.invalidateQueries({ queryKey: ["userNfts", address] });
      queryClient.invalidateQueries({
        queryKey: ["collectionNfts", variables.contractAddress],
      });

      router.replace(`/create/success?id=${data.nftId}`);
    },
    onError: (error: CreateNFTError) => {
      setCurrentProcessingStep("");
      // The error toast is already shown in `mutationFn`'s catch block.
      // You can add additional generic error handling here if needed.
      console.error("Mutation failed:", error.message);
    },
    onSettled: () => {
      // Optional: Actions to take after mutation is success or error
      setCurrentProcessingStep(""); // Clear step message
    },
  });

  // Expose what the component needs
  return {
    createNFT: (formData: CreateNFTFormInputs) => {
      // Basic client-side checks before calling mutate
      if (!isConnected || !address || !chain) {
        toast.error("Please connect your wallet first.");
        return;
      }
      if (mutation.isPending) {
        toast.error("Creation process already in progress.");
        return;
      }
      // Call the actual mutation
      mutation.mutate(formData);
    },
    isLoading: mutation.isPending, // Combines all loading states
    error: mutation.error?.message || null, // Simplified error message
    successData: mutation.data,
    processingStep: currentProcessingStep, // For more granular UI feedback
    reset: mutation.reset, // To reset mutation state if needed
  };
}
