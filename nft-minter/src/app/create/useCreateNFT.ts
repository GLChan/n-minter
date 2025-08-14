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

/** NFT 属性类型定义 */
export type Attribute = { key: string; value: string };

/** 创建 NFT 表单输入类型 */
export type CreateNFTFormInputs = {
  file: FileList | null;
  name: string;
  description: string;
  attributes: Attribute[];
  collection: string; // 合集 ID/标识符
  explicit: boolean;
  contractAddress: string; // 智能合约地址
};

/** NFT 创建成功后返回的数据类型 */
interface CreateNFTMutationData {
  txHash: string;
  tokenId: string | number;
  nftId: string; // Supabase 数据库 ID
  imageURI: string;
  tokenURI: string;
}

/** NFT 创建错误类型 */
type CreateNFTError = Error;

/**
 * 从交易收据中解析 Token ID
 * @param receipt 交易收据对象
 * @param contractAddress 合约地址
 * @param recipientAddress 接收者地址
 * @returns 解析出的 Token ID 或错误状态标识
 */
const parseTokenIdFromReceipt = (
  receipt: { logs?: { address?: string; topics: string[] }[] },
  contractAddress: string,
  recipientAddress: string
): string | number => {
  let tokenId: string | number = "未知";
  try {
    // 检查交易日志是否存在
    if (!receipt.logs || receipt.logs.length === 0) {
      console.warn("Warning: Transaction logs are empty, cannot get Token ID.");
      return "pending_logs"; // 表示缺少日志
    }

    // 构建 Transfer 事件签名
    const transferSignature = "Transfer(address,address,uint256)";
    const transferTopic = ethersId(transferSignature);

    // 查找匹配的 Transfer 事件日志
    const transferLog = receipt.logs.find(
      (log: { address?: string; topics: string[] }) =>
        log.address?.toLowerCase() === contractAddress.toLowerCase() &&
        log.topics[0] === transferTopic &&
        log.topics.length === 4 && // from, to, tokenId
        log.topics[2]
          ?.toLowerCase()
          .includes(recipientAddress.slice(2).toLowerCase()) // to address
    );

    // 解析 Token ID
    if (transferLog?.topics[3]) {
      tokenId = BigInt(transferLog.topics[3]).toString();
      console.log("Parsed Token ID:", tokenId);
    } else {
      console.warn("No matching Transfer event found to parse Token ID.");
      tokenId = "pending_event"; // 表示未找到事件
    }
  } catch (e) {
    console.error("Error parsing Token ID:", e);
    tokenId = "error_parsing"; // 表示解析错误
  }
  return tokenId;
};

/**
 * 验证表单数据的有效性
 * @param formData 表单数据
 * @param isConnected 钱包连接状态
 * @param address 钱包地址
 * @param chain 区块链信息
 * @throws {Error} 当验证失败时抛出错误
 */
const validateFormData = (
  formData: CreateNFTFormInputs,
  isConnected: boolean,
  address: string | undefined,
  chain: { id: number } | undefined
) => {
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
};

/**
 * 上传文件和元数据到 IPFS
 * @param formData 表单数据
 * @param toastId Toast 消息 ID
 * @param setProcessingStep 设置处理步骤的函数
 * @returns 包含 tokenURI 和 imageURI 的对象
 */
const uploadFileAndMetadata = async (
  formData: CreateNFTFormInputs,
  toastId: string,
  setProcessingStep: (step: string) => void
) => {
  setProcessingStep("Uploading file and metadata...");
  toast.loading("Uploading file and metadata...", { id: toastId });

  // 准备上传数据
  const fileToUpload = formData.file![0];
  const uploadFormData = new FormData();
  uploadFormData.append("file", fileToUpload);
  uploadFormData.append("name", formData.name);
  uploadFormData.append("description", formData.description);
  
  // 过滤有效属性
  const validAttributes = formData.attributes.filter(
    (attr) => attr.key && attr.value
  );
  uploadFormData.append("attributes", JSON.stringify(validAttributes));

  // 发送上传请求
  const uploadResponse = await fetch("/api/nft/upload", {
    method: "POST",
    body: uploadFormData,
  });

  // 处理上传结果
  if (!uploadResponse.ok) {
    const errorData = await uploadResponse.json();
    throw new Error(
      errorData.error ||
        `IPFS Upload Failed: ${uploadResponse.statusText}`
    );
  }
  
  const { tokenURI, imageURI } = await uploadResponse.json();
  if (!tokenURI) throw new Error("Failed to get Token URI from server.");
  
  toast.success("File uploaded!", { id: toastId });
  return { tokenURI, imageURI };
};

/**
 * 铸造 NFT 到区块链
 * @param formData 表单数据
 * @param tokenURI Token URI（元数据链接）
 * @param address 用户钱包地址
 * @param wagmiConfig Wagmi 配置
 * @param toastId Toast 消息 ID
 * @param setProcessingStep 设置处理步骤的函数
 * @returns 交易哈希
 */
const mintNFT = async (
  formData: CreateNFTFormInputs,
  tokenURI: string,
  address: string,
  wagmiConfig: ReturnType<typeof useConfig>,
  toastId: string,
  setProcessingStep: (step: string) => void
) => {
  setProcessingStep("Waiting for wallet confirmation to mint...");
  toast.loading("Waiting for wallet confirmation to mint...", {
    id: toastId,
  });

  // 调用智能合约铸造 NFT
  const transactionHash = await writeContract(wagmiConfig, {
    address: formData.contractAddress as `0x${string}`,
    abi: MY_NFT_ABI,
    functionName: "safeMint",
    args: [address, tokenURI],
  });
  
  if (!transactionHash)
    throw new Error("Minting transaction failed to initiate.");
  toast.success("Minting transaction submitted!", { id: toastId });
  return transactionHash;
};

/**
 * 等待区块链交易确认
 * @param transactionHash 交易哈希
 * @param wagmiConfig Wagmi 配置
 * @param toastId Toast 消息 ID
 * @param setProcessingStep 设置处理步骤的函数
 * @returns 交易收据
 */
const waitForTransaction = async (
  transactionHash: `0x${string}`,
  wagmiConfig: ReturnType<typeof useConfig>,
  toastId: string,
  setProcessingStep: (step: string) => void
) => {
  setProcessingStep("Confirming transaction on the blockchain...");
  toast.loading("Confirming transaction...", { id: toastId });

  // 等待交易确认
  const receipt = await waitForTransactionReceipt(wagmiConfig, {
    hash: transactionHash,
    confirmations: 1,
  });
  
  // 检查交易是否成功
  if (receipt.status === "reverted") {
    throw new Error("Transaction reverted by the blockchain.");
  }
  toast.success("Transaction confirmed!", { id: toastId });
  return receipt;
};

/** NFT 保存数据参数类型 */
interface SaveNFTDataParams {
  formData: CreateNFTFormInputs;
  tokenId: string | number;
  tokenURI: string;
  imageURI: string;
  address: string;
  chain: { id: number };
  receipt: { transactionHash: string };
  toastId: string;
  setProcessingStep: (step: string) => void;
}

/**
 * 保存 NFT 数据到数据库
 * @param params 保存参数对象
 * @returns 保存结果数据
 */
const saveNFTData = async (params: SaveNFTDataParams) => {
  const {
    formData,
    tokenId,
    tokenURI,
    imageURI,
    address,
    chain,
    receipt,
    toastId,
    setProcessingStep,
  } = params;

  setProcessingStep("Saving NFT information...");
  toast.loading("Saving NFT information...", { id: toastId });

  // 获取用户认证信息
  const supabase = createClient();
  const sessionResponse = await supabase.auth.getSession();
  const accessToken = sessionResponse.data.session?.access_token;

  if (!accessToken) {
    throw new Error("Authentication failed. Cannot save NFT data.");
  }

  // 构建 NFT 数据
  const nftDataToSave = {
    tokenId: tokenId.toString(),
    tokenURI,
    ownerAddress: address,
    contractAddress: formData.contractAddress,
    chainId: chain.id,
    name: formData.name,
    description: formData.description,
    imageUrl: imageURI,
    attributes: formData.attributes.filter(
      (attr) => attr.key && attr.value
    ),
    transactionHash: receipt.transactionHash,
    collectionId: formData.collection,
    // 根据 Token ID 解析状态确定 NFT 状态
    status:
      (typeof tokenId === "string" && tokenId.startsWith("pending_")) ||
      tokenId === "error_parsing" ||
      tokenId === "未知"
        ? "pending_finalization"
        : "completed",
  };

  // 保存到数据库
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
  return saveData;
};

/**
 * 处理 NFT 创建过程中的错误
 * @param err 错误对象
 * @param transactionHash 交易哈希（如果存在）
 * @param toastId Toast 消息 ID
 */
const handleNFTCreationError = (
  err: unknown,
  transactionHash: `0x${string}` | undefined,
  toastId: string
) => {
  console.error("NFT Creation process error:", err);
  let errorMessage = "An unknown error occurred.";
  
  // 提取错误消息
  if (err instanceof Error) {
    errorMessage = err.message;
  } else if (typeof err === "string") {
    errorMessage = err;
  }

  // 根据错误类型提供友好的错误消息
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
    // 如果铸造可能成功但保存失败，提供交易哈希
    errorMessage = `NFT might be minted (Tx: ${transactionHash}), but saving data failed: ${errorMessage}`;
  }

  toast.error(errorMessage, { id: toastId, duration: 5000 });
  throw new Error(errorMessage);
};

/**
 * 创建 NFT 的自定义 Hook
 * 提供 NFT 创建的完整流程：验证 -> 上传 -> 铸造 -> 确认 -> 保存
 * @returns Hook 返回对象，包含创建函数和状态信息
 */
export function useCreateNFT() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { address, isConnected, chain } = useAccount();
  const wagmiConfig = useConfig();

  // 当前处理步骤状态
  const [currentProcessingStep, setCurrentProcessingStep] =
    useState<string>("");

  // 使用 React Query 的 mutation 来管理异步操作
  const mutation = useMutation<
    CreateNFTMutationData,
    CreateNFTError,
    CreateNFTFormInputs
  >({
    /**
     * 主要的 NFT 创建流程
     * @param formData 表单数据
     * @returns 创建成功后的数据
     */
    mutationFn: async (
      formData: CreateNFTFormInputs
    ): Promise<CreateNFTMutationData> => {
      // 1. 验证表单数据
      validateFormData(formData, isConnected, address, chain);

      const toastId = "create-nft-progress";
      let transactionHash: `0x${string}` | undefined = undefined;

      try {
        // 2. 上传文件和元数据到 IPFS
        const { tokenURI, imageURI } = await uploadFileAndMetadata(
          formData,
          toastId,
          setCurrentProcessingStep
        );

        // 3. 铸造 NFT 到区块链
        transactionHash = await mintNFT(
          formData,
          tokenURI,
          address!,
          wagmiConfig,
          toastId,
          setCurrentProcessingStep
        );

        // 4. 等待交易确认
        const receipt = await waitForTransaction(
          transactionHash,
          wagmiConfig,
          toastId,
          setCurrentProcessingStep
        );

        // 5. 从交易收据中解析 Token ID
        const tokenId = parseTokenIdFromReceipt(
          receipt,
          formData.contractAddress,
          address!
        );

        // 6. 保存 NFT 数据到数据库
        const saveData = await saveNFTData({
          formData,
          tokenId,
          tokenURI,
          imageURI,
          address: address!,
          chain: chain!,
          receipt,
          toastId,
          setProcessingStep: setCurrentProcessingStep,
        });

        return {
          txHash: receipt.transactionHash,
          tokenId,
          nftId: saveData.data.id,
          imageURI: imageURI || "",
          tokenURI: tokenURI || "",
        };
      } catch (err: unknown) {
        handleNFTCreationError(err, transactionHash, toastId);
        throw err;
      }
    },
    /** 当 mutation 开始时的回调 */
    onMutate: () => {
      // 可选：mutation 开始时执行的操作
      // 例如：禁用表单、乐观更新等
    },
    /** 当 mutation 成功时的回调 */
    onSuccess: (data, variables) => {
      setCurrentProcessingStep("");
      toast.success(
        `NFT Created! Token ID: ${data.tokenId}. Supabase ID: ${data.nftId}`,
        {
          duration: 6000,
        }
      );
      // 使相关查询失效，触发重新获取数据
      queryClient.invalidateQueries({ queryKey: ["userNfts", address] });
      queryClient.invalidateQueries({
        queryKey: ["collectionNfts", variables.contractAddress],
      });

      // 跳转到成功页面
      router.replace(`/create/success?id=${data.nftId}`);
    },
    /** 当 mutation 失败时的回调 */
    onError: (error: CreateNFTError) => {
      setCurrentProcessingStep("");
      // 错误 toast 已在 mutationFn 的 catch 块中显示
      // 这里可以添加额外的通用错误处理逻辑
      console.error("Mutation failed:", error.message);
    },
    /** 当 mutation 完成时的回调（无论成功或失败） */
    onSettled: () => {
      // 可选：mutation 完成后执行的操作
      setCurrentProcessingStep(""); // 清除步骤消息
    },
  });

  // 返回组件需要的接口
  return {
    /**
     * 创建 NFT 的函数
     * @param formData 表单数据
     */
    createNFT: (formData: CreateNFTFormInputs) => {
      // 基本的客户端检查
      if (!isConnected || !address || !chain) {
        toast.error("Please connect your wallet first.");
        return;
      }
      if (mutation.isPending) {
        toast.error("Creation process already in progress.");
        return;
      }
      // 调用实际的 mutation
      mutation.mutate(formData);
    },
    isLoading: mutation.isPending, // 组合所有加载状态
    error: mutation.error?.message || null, // 简化的错误消息
    successData: mutation.data, // 成功后的数据
    processingStep: currentProcessingStep, // 用于更细粒度的 UI 反馈
    reset: mutation.reset, // 重置 mutation 状态（如果需要）
  };
}
