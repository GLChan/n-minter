import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  sessionCookieName,
  PINATA_IPFS_GATEWAY_BASE,
} from "@/app/_lib/constants";
import { CookieOptionsWithName } from "@supabase/ssr";
import { keccak256, toUtf8Bytes } from "ethers";
import { format } from "date-fns";
import { ethers } from "ethers";

export function getCookieOptions() {
  return {
    name: sessionCookieName,
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
  } satisfies CookieOptionsWithName;
}

/**
 * 合并类名工具函数，结合clsx和tailwind-merge
 * 可以智能地合并tailwind类，避免冲突
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 截断文本工具函数
 * @param text 要截断的文本
 * @param length 最大长度
 * @returns 截断后的文本
 */
export function truncateText(text: string, length: number): string {
  if (!text) return "";
  if (text.length <= length) return text;
  return `${text.slice(0, length)}...`;
}

/**
 * 格式化以太坊地址
 * @param address 地址
 * @returns 格式化后的地址，如0x123...abc
 */
export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * 格式化价格，添加千位分隔符
 * @param price 价格
 * @returns 格式化后的价格
 */
export function formatPrice(price: string): string {
  return (
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETH",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(Number(price))
      .replace("ETH", "") + " ETH"
  );
}

export function shortenAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diff = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}个月前`;
  return `${Math.floor(diff / 31536000)}年前`;
}

/**
 * 将IPFS URI转换为可访问的HTTP URL
 *
 * @param ipfsUri IPFS URI或链接
 * @returns 可访问的HTTP URL
 */
export function formatIPFSUrl(ipfsUri?: string | null): string {
  if (!ipfsUri?.startsWith("ipfs://")) {
    return ipfsUri || "";
  }
  const cid = ipfsUri.substring(7);
  // 使用常量拼接 URL
  return `${PINATA_IPFS_GATEWAY_BASE}${cid}`;
}

export function generateWalletP(walletAddress: string) {
  const secretKey = process.env.PROJECT_SECRET;
  const hash = keccak256(toUtf8Bytes(`${walletAddress}:${secretKey}`));
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&";
  let password = "";
  for (let i = 2; i < 34; i += 2) {
    const byte = parseInt(hash.slice(i, i + 2), 16);
    password += chars[byte % chars.length];
  }
  return password;
}

export function formatDate(date: Date | string): string {
  if (!date) return "";
  return format(new Date(date), "yyyy-MM-dd");
}

export function formatDateTime(date: Date | string): string {
  if (!date) return "";
  return format(new Date(date), "yyyy-MM-dd HH:mm");
}

export function getFilePrefixAndExtension(filePath: string): {
  prefix: string;
  extension: string;
} {
  const fileName = filePath.split("/").pop() ?? "";
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return { prefix: fileName, extension: "" };
  }

  const prefix = fileName.substring(0, lastDotIndex);
  const extension = fileName.substring(lastDotIndex + 1).toLowerCase();

  return { prefix, extension };
}

/**
 * 将 ETH 转换为 Wei（返回字符串类型的 BigNumber）
 * @param ethAmount - 以太币数量（字符串或数字）
 * @returns wei 字符串
 */
export function ethToWei(ethAmount: string | number): string {
  return ethAmount ? ethers.parseEther(ethAmount.toString()).toString() : '0';
}

/**
 * 将 Wei 转换为 ETH（返回字符串）
 * @param weiAmount - wei 值（字符串或 bigint）
 * @returns ETH 字符串（带小数）
 */
export function weiToEth(weiAmount: string | bigint | number): string {
  return weiAmount ? ethers.formatEther(weiAmount.toString()) : '0.0';
}
