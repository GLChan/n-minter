"use client"

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
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

export const Navbar = () => {
  const router = useRouter();
  const { disconnect } = useDisconnect();
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();

  // 搜索框状态
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  // State to prevent multiple API calls per connection
  const [profileSyncAttempted, setProfileSyncAttempted] = React.useState(false);
  const [isProfileSyncing, setIsProfileSyncing] = React.useState(false);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Effect to sync profile on connect
  React.useEffect(() => {
    if (isConnected && address && !profileSyncAttempted && !isProfileSyncing) {
      setProfileSyncAttempted(true);
      setIsProfileSyncing(true);
      console.log(`Wallet connected: ${address}. Syncing profile...`);

      const syncProfile = async () => {
        try {
          const response = await fetch('/api/user/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: address }),
          });
          if (!response.ok) {
             const errorData = await response.json();
             throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }
          const profileData = await response.json();
          console.log('Profile synced/fetched successfully:', profileData);
        } catch (error) {
          console.error('Error syncing profile:', error);
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
    }

  }, [isConnected, address, profileSyncAttempted, isConnecting, isReconnecting, isProfileSyncing]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      setTimeout(() => {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        setIsSearchOpen(false);
        setIsSearching(false);
      }, 500);
    }
  };

  const handleTagSearch = (tag: string) => {
    setSearchQuery(tag);
    setIsSearching(true);
    setTimeout(() => {
      router.push(`/search?q=${encodeURIComponent(tag)}`);
      setIsSearchOpen(false);
      setIsSearching(false);
    }, 500);
  };

  const quickTags = [
    '数字艺术',
    '加密朋克',
    '元宇宙',
    '游戏资产',
    '音乐NFT'
  ];

  const navLinks = [
    { title: '探索', href: '/explore' },
    { title: '创建', href: '/create' },
    { title: '合集', href: '/collections' },
  ];

  // Helper function to shorten address
  const shortenAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* 左侧品牌和导航 */}
        <div className="flex items-center gap-8">
          {/* 品牌标识 */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">NFT铸造</span>
          </Link>

          {/* 导航链接 - 在移动端隐藏 */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                {link.title}
              </Link>
            ))}
          </nav>
        </div>

        {/* 右侧搜索和钱包 */}
        <div className="flex items-center gap-4">
          {/* 搜索按钮和弹出框 */}
          <div className="relative" ref={searchRef}>
            <button
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Search"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            {/* 搜索弹出框 */}
            {isSearchOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <form onSubmit={handleSearchSubmit}>
                  <div className="flex items-center p-2">
                    <input
                      type="text"
                      placeholder="搜索 NFT、合集或创作者..."
                      className="flex-1 px-3 py-2 text-sm bg-transparent outline-none border-none focus:ring-0"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={isSearching}
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="p-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 disabled:opacity-50"
                      disabled={isSearching || !searchQuery.trim()}
                    >
                      {isSearching ? (
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      )}
                    </button>
                  </div>
                </form>

                {/* 最近搜索记录 */}
                {!isSearching && searchQuery.length === 0 && (
                  <div className="px-3 py-2 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">最近搜索</div>
                      <button className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                        清除
                      </button>
                    </div>
                    <div className="mt-2 space-y-1">
                      <button
                        className="w-full text-left text-sm py-1 px-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        onClick={() => handleTagSearch('波普艺术NFT')}
                      >
                        波普艺术NFT
                      </button>
                      <button
                        className="w-full text-left text-sm py-1 px-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        onClick={() => handleTagSearch('顶级艺术家')}
                      >
                        顶级艺术家
                      </button>
                    </div>
                  </div>
                )}

                {/* 热门搜索标签 */}
                {!isSearching && (
                  <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">热门搜索</div>
                    <div className="flex flex-wrap gap-2">
                      {quickTags.map((tag, index) => (
                        <button
                          key={index}
                          className="px-2 py-1 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                          onClick={() => handleTagSearch(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 搜索中状态 */}
                {isSearching && (
                  <div className="p-8 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-500 mb-2"></div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">搜索中...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Wallet Connect Button - Custom Render */}
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
              const ready = mounted && authenticationStatus !== 'loading';
              const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    'style': { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <Button onClick={openConnectModal} type="button" size="lg">
                          连接钱包
                        </Button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <Button onClick={openChainModal} type="button" variant="destructive" size="lg">
                          网络错误
                        </Button>
                      );
                    }

                    if (isProfileSyncing) {
                      return (
                        <button disabled className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 opacity-70 cursor-wait">
                          <div className="relative w-6 h-6 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                             {account.ensAvatar ? (
                              <Image 
                                 src={account.ensAvatar}
                                 alt='Loading'
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

                    return (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                             {/* Avatar */}
                             <div className="relative w-6 h-6 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                               {account.ensAvatar && (
                                <Image 
                                   src={account.ensAvatar}
                                   alt={account.displayName ?? 'User avatar'}
                                   fill
                                   sizes="24px"
                                   className="object-cover"
                                 />
                               )}
                               {!account.ensAvatar && (
                                 <div className="w-full h-full flex items-center justify-center">
                                    <User size={14} className="text-zinc-500 dark:text-zinc-400" />
                                  </div>
                               )}
                             </div>
                              {/* Name / Address and Balance - Hidden on small screens */}
                             <div className="hidden md:flex items-center gap-2">
                               <span className="text-sm font-medium">
                                 {account.displayName
                                   ? account.displayName
                                   : shortenAddress(account.address)}
                               </span>
                               {/* Display Balance */} 
                               {account.displayBalance && (
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                  {account.displayBalance}
                                </span>
                               )}
                             </div>
                             {/* Chain Icon */}
                             {chain.hasIcon && (
                              <div className="relative w-4 h-4 ml-1 flex-shrink-0"> {/* Added flex-shrink-0 */} 
                                {chain.iconUrl && (
                                  <Image
                                    alt={chain.name ?? 'Chain icon'}
                                    src={chain.iconUrl}
                                    fill
                                    sizes="16px"
                                  />
                                )}
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
                                {account.displayName
                                  ? `${account.displayName} (${shortenAddress(account.address)})`
                                  : shortenAddress(account.address)}
                              </span>
                              {account.displayBalance && (
                                <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500 mt-0.5">
                                  {account.displayBalance}
                                </span>
                              )}
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
                           <DropdownMenuItem asChild>
                            <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/50 cursor-pointer focus:outline-none focus:bg-zinc-100 dark:focus:bg-zinc-800/50">
                              <LayoutDashboard size={16} />
                              <span>仪表盘</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/profile" className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/50 cursor-pointer focus:outline-none focus:bg-zinc-100 dark:focus:bg-zinc-800/50">
                              <User size={16} />
                              <span>个人资料</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                          <DropdownMenuItem
                             onClick={() => openChainModal && openChainModal()}
                             className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/50 cursor-pointer focus:outline-none focus:bg-zinc-100 dark:focus:bg-zinc-800/50"
                          >
                             <span>切换网络...</span>
                           </DropdownMenuItem>
                           <DropdownMenuItem
                             onClick={() => disconnect()}
                            className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer focus:outline-none focus:bg-red-100 dark:focus:bg-red-900/50 focus:text-red-700 dark:focus:text-red-400"
                          >
                            <LogOut size={16} />
                            <span>断开连接</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>

          {/* 移动端菜单按钮 */}
          <button
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}; 