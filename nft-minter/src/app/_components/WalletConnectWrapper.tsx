"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { LayoutDashboard, User, LogOut, Copy, Loader2 } from 'lucide-react';
import { Button } from './ui/Button'; 
import { useAuth } from '@/contexts/AuthContext'; // 导入全局认证钩子

// Helper function to shorten address
const shortenAddress = (addr: string | undefined) => {
  if (!addr) return '';
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
};

export const WalletConnectWrapper = () => {
  const router = useRouter();
  const { address, isConnected, isConnecting, isReconnecting, chain } = useAccount();
  
  // 使用全局认证上下文替代本地状态
  const { isBackendVerified, verifiedUserData, isSiweLoading, login, logout } = useAuth();
  
  // 保留这些本地状态，因为它们是特定于组件的UI状态，与认证状态不同
  const [profileSyncAttempted, setProfileSyncAttempted] = React.useState(false);
  const [isProfileSyncing, setIsProfileSyncing] = React.useState(false);
  const [supSessionChecked, setSupSessionChecked] = useState(false);

  useEffect(() => {
    if (isConnected && address && !profileSyncAttempted && !isProfileSyncing) {
      setProfileSyncAttempted(true);
      setIsProfileSyncing(true);
      console.log(`WalletConnectWrapper: Wallet connected: ${address}. Syncing profile...`);

      const syncProfile = async () => {
        try {
          const response = await fetch('/api/user/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: address }),
          });
          if (!response.ok) {
             const errorData = await response.json().catch(() => ({ error: 'Failed to parse error JSON'}));
             throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }
          const profileData = await response.json();
          console.log('WalletConnectWrapper: Profile synced/fetched successfully:', profileData);
        } catch (error) {
          console.error('WalletConnectWrapper: Error syncing profile:', error);
          setProfileSyncAttempted(false); 
        } finally {
          setIsProfileSyncing(false);
        }
      };
      syncProfile();
    }

    if (!isConnected && !isConnecting && !isReconnecting) {
        setProfileSyncAttempted(false);
        setIsProfileSyncing(false);
        setSupSessionChecked(false);
    }
  }, [isConnected, address, profileSyncAttempted, isConnecting, isReconnecting, isProfileSyncing]);

  // 调用全局上下文的login方法，而不是本地的handleSiweLogin
  const handleSiweLogin = useCallback(async () => { 
    try {
      await login();
      // 登录成功后重置Profile同步状态以允许获取最新数据
      setProfileSyncAttempted(false);
    } catch (error) {
      console.error("WalletConnectWrapper: 登录失败:", error);
    }
  }, [login]);

  // 处理钱包连接后的自动登录
  useEffect(() => {
    if (isConnected && address && !isSiweLoading && !isBackendVerified && !supSessionChecked) {
      console.log("WalletConnectWrapper: 连接状态变化，尝试SIWE登录");
      setSupSessionChecked(true); 
      handleSiweLogin();
    } else if (!isConnected) {
      setSupSessionChecked(false); 
    }
  }, [isConnected, address, isSiweLoading, isBackendVerified, supSessionChecked, handleSiweLogin]);

  // 使用全局的logout并清理本地状态
  const handleLogout = () => {
    logout(); // 调用全局登出方法
    setProfileSyncAttempted(false);
    setSupSessionChecked(false);
    console.log("WalletConnectWrapper: 用户已登出");
  };

  return (
    <ConnectButton.Custom>
      {({ account, chain: currentChain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connectedViaRainbowKit = ready && account && currentChain;

        if ((isConnecting || isReconnecting) || (isConnected && isSiweLoading && !isBackendVerified)) {
           return (
            <Button variant="outline" disabled className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isSiweLoading ? '验证中...' : (isConnecting ? '连接中...' : (isReconnecting ? '重新连接...' : '处理中...'))}
            </Button>
          );
        }

        if (isBackendVerified && verifiedUserData && account) { // 使用全局状态验证
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <div className="relative w-6 h-6 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                    {account.ensAvatar ? <Image
                      src={account.ensAvatar}
                      alt="User Avatar"
                      fill
                      sizes="24px"
                      className="object-cover"
                    /> : <></>}
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {account.displayName || shortenAddress(verifiedUserData.wallet)}
                    </span>
                  </div>
                  {currentChain?.hasIcon && currentChain.iconUrl && (
                     <div className="relative w-4 h-4 ml-1 flex-shrink-0">
                       <Image
                         alt={currentChain.name ?? 'Chain icon'}
                         src={currentChain.iconUrl}
                         fill
                         sizes="16px"
                       />
                     </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 mr-2 mt-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-50"
                align="end"
              >
                <DropdownMenuLabel className="px-2 pt-2 pb-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  <div className="flex flex-col">
                    <span>
                      {account.displayName ? `${account.displayName} (${shortenAddress(verifiedUserData.wallet)})` : shortenAddress(verifiedUserData.wallet)}
                    </span>
                    {account?.displayBalance && (
                       <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500 mt-0.5">
                         {account.displayBalance}
                       </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuItem
                  className="flex items-center justify-between gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/50 cursor-pointer focus:outline-none focus:bg-zinc-100 dark:focus:bg-zinc-800/50"
                  onClick={() => navigator.clipboard.writeText(verifiedUserData.wallet)}
                >
                  <span>复制地址</span>
                  <Copy size={14} />
                </DropdownMenuItem>
                <DropdownMenuSeparator className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                <DropdownMenuItem asChild>
                  <Link href={`/profile`} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/50 cursor-pointer focus:outline-none focus:bg-zinc-100 dark:focus:bg-zinc-800/50">
                    <User size={16} />
                    <span>个人资料</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/50 cursor-pointer focus:outline-none focus:bg-zinc-100 dark:focus:bg-zinc-800/50">
                    <LayoutDashboard size={16} />
                    <span>仪表盘</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                {connectedViaRainbowKit && openChainModal && (
                   <DropdownMenuItem
                     onClick={openChainModal}
                     className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/50 cursor-pointer focus:outline-none focus:bg-zinc-100 dark:focus:bg-zinc-800/50"
                   >
                     <span>切换网络...</span>
                   </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer focus:outline-none focus:bg-red-100 dark:focus:bg-red-900/50 focus:text-red-700 dark:focus:text-red-400"
                >
                  <LogOut size={16} />
                  <span>登出</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
        
        if (isConnected && isProfileSyncing && account) { 
          return (
            <button disabled className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 opacity-70 cursor-wait">
              <div className="relative w-6 h-6 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                 {account.ensAvatar ? (
                  <Image 
                     src={account.ensAvatar}
                     alt='Loading profile'
                     fill sizes="24px" className="object-cover"
                   />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center">
                      <User size={14} className="text-zinc-500 dark:text-zinc-400" />
                    </div>
                 )}
              </div>
              <Loader2 size={16} className="animate-spin text-zinc-500 dark:text-zinc-400" />
            </button>
          );
        }

        if (connectedViaRainbowKit && account) { // Wallet is connected via RainbowKit, but not (yet) backend verified
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                   <div className="relative w-6 h-6 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                     {account.ensAvatar ? ( <Image src={account.ensAvatar} alt={account.displayName ?? 'User avatar'} fill sizes="24px" className="object-cover" /> ) 
                                         : ( <div className="w-full h-full flex items-center justify-center"> <User size={14} className="text-zinc-500 dark:text-zinc-400" /> </div> )}
                   </div>
                   <div className="hidden md:flex items-center gap-2">
                     <span className="text-sm font-medium"> {account.displayName ? account.displayName : shortenAddress(account.address)} </span>
                     {account.displayBalance && ( <span className="text-xs text-zinc-500 dark:text-zinc-400"> {account.displayBalance} </span> )}                   </div>
                   {currentChain?.hasIcon && currentChain.iconUrl && ( <div className="relative w-4 h-4 ml-1 flex-shrink-0"> <Image alt={currentChain.name ?? 'Chain icon'} src={currentChain.iconUrl} fill sizes="16px" /> </div> )}
                 </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 mr-2 mt-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-50"
                align="end"
              >
                <DropdownMenuLabel className="px-2 pt-2 pb-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  <div className="flex flex-col">
                    <span> {account.displayName ? `${account.displayName} (${shortenAddress(account.address)})` : shortenAddress(account.address)} </span>
                    {account.displayBalance && ( <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500 mt-0.5"> {account.displayBalance} </span> )}
                  </div>
                 </DropdownMenuLabel>
                 <DropdownMenuItem 
                   className="flex items-center justify-between gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/50 cursor-pointer focus:outline-none focus:bg-zinc-100 dark:focus:bg-zinc-800/50"
                   onClick={() => navigator.clipboard.writeText(account.address)}
                 >
                   <span>复制地址</span>
                   <Copy size={14} />
                 </DropdownMenuItem>
                <DropdownMenuSeparator className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                 <DropdownMenuItem 
                    onClick={handleSiweLogin} 
                    disabled={isSiweLoading}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/50 cursor-pointer focus:outline-none focus:bg-zinc-100 dark:focus:bg-zinc-800/50"
                  >
                    <User size={16} />
                    <span>{isSiweLoading ? "验证中..." : "使用钱包验证"}</span>
                  </DropdownMenuItem>
                <DropdownMenuSeparator className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                 {openChainModal && <DropdownMenuItem
                   onClick={openChainModal}
                   className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/50 cursor-pointer focus:outline-none focus:bg-zinc-100 dark:focus:bg-zinc-800/50"
                 >
                   <span>切换网络...</span>
                 </DropdownMenuItem>}
                 {openAccountModal && <DropdownMenuItem
                   onClick={openAccountModal} 
                   className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/50 cursor-pointer focus:outline-none focus:bg-zinc-100 dark:focus:bg-zinc-800/50"
                 >
                  <LogOut size={16} />
                  <span>管理账户</span>
                 </DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

        if (!ready || !mounted) { // Covers initial loading state of RainbowKit
            return (
                <Button variant="outline" disabled className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    加载中...
                </Button>
            );
        }

        return (
          <Button onClick={openConnectModal} type="button" size="lg">
            连接钱包
          </Button>
        );
      }}
    </ConnectButton.Custom>
  );
}; 