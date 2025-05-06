"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Added Link for DropdownMenuItem asChild
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
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
import { SiweMessage } from 'siwe';

// Helper function to shorten address
const shortenAddress = (addr: string | undefined) => {
  if (!addr) return '';
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
};

export const WalletConnectWrapper = () => {
  const router = useRouter();
  const { disconnect: wagmiDisconnect } = useDisconnect(); 
  const { address, isConnected, isConnecting, isReconnecting, chain } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [profileSyncAttempted, setProfileSyncAttempted] = React.useState(false);
  const [isProfileSyncing, setIsProfileSyncing] = React.useState(false);
  const [isSiweLoading, setIsSiweLoading] = useState(false);
  const [supSessionChecked, setSupSessionChecked] = useState(false);

  const [isBackendVerified, setIsBackendVerified] = React.useState(false);
  const [verifiedUserData, setVerifiedUserData] = React.useState<{ wallet: string } | null>(null);

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
             const errorData = await response.json().catch(() => ({ error: 'Failed to parse error JSON'})); // Prevent crash if errorData is not json
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
        setIsBackendVerified(false);
        setVerifiedUserData(null);
        setIsSiweLoading(false);
    }
  }, [isConnected, address, profileSyncAttempted, isConnecting, isReconnecting, isProfileSyncing]);


  const handleSiweLogin = useCallback(async () => { 
    if (!address || !chain?.id || isSiweLoading || isBackendVerified) {
        if(isBackendVerified) console.log("WalletConnectWrapper: SIWE: Already verified.");
        if(isSiweLoading) console.log("WalletConnectWrapper: SIWE: Already loading.");
        if(!address || !chain?.id) console.log("WalletConnectWrapper: SIWE: No address or chain ID.");
        return;
    }

    setIsSiweLoading(true);
    console.log("WalletConnectWrapper: 开始 SIWE 登录流程...");
    setIsBackendVerified(false); // Reset verification status before attempting
    setVerifiedUserData(null);

    try {
      const nonceRes = await fetch('/api/auth/nonce');
      if (!nonceRes.ok) {
        const errorData = await nonceRes.json().catch(() => ({ error: '获取 nonce 失败, 无法解析错误响应' }));
        throw new Error(errorData.error || '获取 nonce 失败');
      }
      const { nonce } = await nonceRes.json();
      if (!nonce) throw new Error('API 未返回 nonce');
      
      const now = new Date();
      // Ensure window.location is available (client-side)
      const domain = typeof window !== 'undefined' ? window.location.host : '';
      const uri = typeof window !== 'undefined' ? window.location.origin : '';

      const siweMessage = new SiweMessage({
        domain,
        address: address,
        uri,
        version: '1',
        chainId: chain.id,
        nonce: nonce,
        issuedAt: now.toISOString(),
      });
      
      const messageToSign = siweMessage.prepareMessage();
      const signature = await signMessageAsync({ message: messageToSign });

      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSign, signature }),
        credentials: 'include',
      });

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json().catch(() => ({ error: '服务器验证失败, 无法解析错误响应' }));
        throw new Error(errorData.error || '服务器验证失败');
      }

      const verificationData = await verifyRes.json();
      console.log('WalletConnectWrapper: SIWE 登录成功:', verificationData);
      
      if (verificationData.success && verificationData.wallet) {
        setIsBackendVerified(true);
        setVerifiedUserData({ wallet: verificationData.wallet });
        setProfileSyncAttempted(false); 
        // alert("登录成功！"); // Consider using a less disruptive notification method
        console.log("WalletConnectWrapper: SIWE 登录成功并已验证后端。");
      } else {
        throw new Error(verificationData.message || '验证成功但API未返回正确的用户信息或状态');
      }

    } catch (error: any) {
      console.error("WalletConnectWrapper: SIWE 登录错误:", error.message);
      // alert(`登录失败: ${error.message}`); // Consider using a less disruptive notification method
      setIsBackendVerified(false);
      setVerifiedUserData(null);
    } finally {
      setIsSiweLoading(false);
    }
  }, [address, chain, isSiweLoading, isBackendVerified, signMessageAsync]);

  useEffect(() => {
    if (isConnected && address && !isSiweLoading && !isBackendVerified && !supSessionChecked) {
      console.log("WalletConnectWrapper: 连接状态变化，尝试SIWE登录. isConnected:", isConnected, "address:", !!address, "isSiweLoading:", isSiweLoading, "isBackendVerified:", isBackendVerified, "supSessionChecked:", supSessionChecked);
      setSupSessionChecked(true); 
      handleSiweLogin();
    } else if (!isConnected) {
      setSupSessionChecked(false); 
    }
  }, [isConnected, address, isSiweLoading, isBackendVerified, supSessionChecked, handleSiweLogin]);

  const handleLogout = () => {
    wagmiDisconnect();
    setIsBackendVerified(false);
    setVerifiedUserData(null);
    setProfileSyncAttempted(false);
    setSupSessionChecked(false);
    setIsSiweLoading(false);
    if (typeof window !== 'undefined') router.push('/'); // Ensure router.push is client-side
    console.log("WalletConnectWrapper: User logged out, states reset.");
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

        if (isBackendVerified && verifiedUserData && account) { // Ensure account is also available for display consistency
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
                  <Link href={`/profile/${verifiedUserData.wallet}`} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/50 cursor-pointer focus:outline-none focus:bg-zinc-100 dark:focus:bg-zinc-800/50">
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
                    <User size={16} /> {/* Using User icon as a generic login icon here */}
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