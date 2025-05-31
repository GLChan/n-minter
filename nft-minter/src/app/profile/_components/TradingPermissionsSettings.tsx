"use client"; // 客户端组件

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { useReadContract } from "wagmi";
import wagmiConfig from "@/app/_lib/config/wagmi";
import { contractAddress, contractAbi } from "@/app/_lib/constants";

// --- 请在这里配置你的常量 ---
// 1. 你的市场合约地址
const MARKETPLACE_CONTRACT_ADDRESS =
  "0xYourMarketplaceContractAddressHere" as `0x${string}`;
// 2. 你的用户 NFT 主要来自于哪个固定的智能合约地址
const USER_MAIN_NFT_CONTRACT_ADDRESS = contractAddress as `0x${string}`;
// --- 常量配置结束 ---

export default function TradingPermissionsSettings() {
  const { address: currentUserAddress, isConnected } = useAccount();

  const [isProcessingTx, setIsProcessingTx] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 使用 useReadContract Hook 获取 isApprovedForAll 状态
  const {
    data: isApproved, // isApprovedForAll 的结果 (boolean | undefined)
    isLoading: isLoadingApprovalStatus,
    isError: isApprovalFetchError,
    error: approvalFetchErrorObject,
    refetch: refetchApprovalStatus, // 用于手动重新获取状态
  } = useReadContract({
    address: USER_MAIN_NFT_CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: "isApprovedForAll",
    args:
      currentUserAddress && MARKETPLACE_CONTRACT_ADDRESS
        ? [currentUserAddress, MARKETPLACE_CONTRACT_ADDRESS]
        : undefined,
    config: wagmiConfig, // wagmi v1+ 的 hooks 通常从 Provider 获取 config
    // 如果你的 wagmi setup 正确，这里可能不需要显式传递
    query: {
      // 只有当所有必要参数都有效时才执行查询
      enabled:
        !!USER_MAIN_NFT_CONTRACT_ADDRESS &&
        !!currentUserAddress &&
        !!MARKETPLACE_CONTRACT_ADDRESS &&
        isConnected,
    },
  });

  useEffect(() => {
    if (isApprovalFetchError && approvalFetchErrorObject) {
      console.error(
        `检查合约 ${USER_MAIN_NFT_CONTRACT_ADDRESS} 授权状态失败:`,
        approvalFetchErrorObject
      );
      setError(
        `检查授权状态失败: ${
          approvalFetchErrorObject.shortMessage ||
          approvalFetchErrorObject.message
        }`
      );
    } else if (!isLoadingApprovalStatus && typeof isApproved === "boolean") {
      setError(null); // 清除旧的错误（如果有）
    }
  }, [
    isApprovalFetchError,
    approvalFetchErrorObject,
    isLoadingApprovalStatus,
    isApproved,
  ]);

  // 处理授权/撤销操作
  const handleSetApproval = async (approvedState: boolean) => {
    if (
      !currentUserAddress ||
      !USER_MAIN_NFT_CONTRACT_ADDRESS ||
      !MARKETPLACE_CONTRACT_ADDRESS
    ) {
      setError("无法执行操作：用户信息、NFT合约地址或市场合约地址缺失。");
      return;
    }
    if (typeof isApproved !== "boolean") {
      setError("无法确定当前授权状态，请稍后重试。");
      return;
    }

    setIsProcessingTx(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const hash = await writeContract(wagmiConfig, {
        address: USER_MAIN_NFT_CONTRACT_ADDRESS,
        abi: contractAbi,
        functionName: "setApprovalForAll",
        args: [MARKETPLACE_CONTRACT_ADDRESS, approvedState],
      });

      await waitForTransactionReceipt(wagmiConfig, { hash });

      await refetchApprovalStatus(); // 重新获取最新的授权状态
      setSuccessMessage(
        `您的 NFT 交易权限已成功${approvedState ? "开启" : "撤销"}！`
      );
    } catch (err) {
      console.error(`操作权限失败:`, err);
      if (err instanceof Error) {
        setError(`操作权限失败: ${err.message}`);
      }
    } finally {
      setIsProcessingTx(false);
    }
  };

  if (!isConnected) {
    return (
      <p className="text-center text-gray-600">
        请先连接您的钱包以管理交易权限。
      </p>
    );
  }

  if (!USER_MAIN_NFT_CONTRACT_ADDRESS) {
    return (
      <p className="text-center text-red-500">错误：NFT 合约地址未配置。</p>
    );
  }
  if (!MARKETPLACE_CONTRACT_ADDRESS) {
    return (
      <p className="text-center text-red-500">错误：市场合约地址未配置。</p>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        交易权限设置
      </h2>
      <p className="text-sm text-gray-600 mb-1">
        管理您在 NFT 合约 (<code>{USER_MAIN_NFT_CONTRACT_ADDRESS}</code>) 中所有
        NFT 对于本平台市场 (<code>{MARKETPLACE_CONTRACT_ADDRESS}</code>)
        的交易授权。
      </p>
      <p className="text-sm text-gray-600 mb-6">
        这是一个链上操作，需要支付 Gas
        费用。授权后，本平台市场合约将有权在发生交易时转移您在此合约下的所有
        NFT。
      </p>

      {isLoadingApprovalStatus ? (
        <div className="text-center py-4">
          <p className="text-gray-500">正在检查当前授权状态...</p>
          {/* 你可以在这里放一个加载动画 */}
        </div>
      ) : error && !isProcessingTx ? ( // 只在非处理交易时显示检查状态的错误
        <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>
      ) : (
        <div className="text-center">
          <p className="mb-3 text-lg">
            当前状态:{" "}
            {typeof isApproved === "boolean" ? (
              isApproved ? (
                <span className="font-semibold text-green-600">已授权交易</span>
              ) : (
                <span className="font-semibold text-red-600">未授权交易</span>
              )
            ) : (
              <span className="text-gray-500">状态未知</span>
            )}
          </p>
          <button
            onClick={() => handleSetApproval(!isApproved)}
            disabled={isProcessingTx || typeof isApproved !== "boolean"}
            className={`w-full px-6 py-3 rounded-md text-white font-medium transition-colors
              ${
                isApproved
                  ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isProcessingTx
              ? "链上处理中..."
              : isApproved
              ? "撤销所有 NFT 交易授权"
              : "开启所有 NFT 交易授权"}
          </button>
        </div>
      )}
      {/* 显示一般性错误（例如交易失败） */}
      {error && isProcessingTx && (
        <p className="mt-3 text-red-500 text-sm">{error}</p>
      )}
      {successMessage && (
        <p className="mt-3 text-green-600 text-sm">{successMessage}</p>
      )}
    </div>
  );
}
