"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/Button';
import { useRouter } from 'next/navigation';

export const Navbar = () => {
  // 路由
  const router = useRouter();
  
  // 模拟钱包连接状态
  const [isConnected, setIsConnected] = React.useState(false);
  // 搜索框状态
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // 搜索框引用，用于外部点击检测
  const searchRef = React.useRef<HTMLDivElement>(null);
  
  // 点击外部关闭搜索框
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
  
  // 处理搜索提交
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      
      // 延迟一下模拟搜索过程
      setTimeout(() => {
        // 跳转到搜索结果页面
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        setIsSearchOpen(false);
        setIsSearching(false);
      }, 500);
    }
  };
  
  // 处理标签点击搜索
  const handleTagSearch = (tag: string) => {
    setSearchQuery(tag);
    setIsSearching(true);
    
    // 延迟一下模拟搜索过程
    setTimeout(() => {
      // 跳转到搜索结果页面
      router.push(`/search?q=${encodeURIComponent(tag)}`);
      setIsSearchOpen(false);
      setIsSearching(false);
    }, 500);
  };
  
  // 快速搜索标签
  const quickTags = [
    '数字艺术',
    '加密朋克',
    '元宇宙',
    '游戏资产',
    '音乐NFT'
  ];
  
  // 导航链接
  const navLinks = [
    { title: '探索', href: '/explore' },
    { title: '创建', href: '/create' },
    { title: '合集', href: '/collections' },
  ];
  
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
          
          {/* 钱包按钮 */}
          {isConnected ? (
            <div className="flex items-center gap-2">
              <span className="text-sm hidden md:inline-block">0.0035 ETH</span>
              <button className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <div className="relative w-full h-full">
                  <Image 
                    src="/images/avatars/avatar.png" 
                    alt="User avatar"
                    fill
                    className="object-cover"
                  />
                </div>
              </button>
            </div>
          ) : (
            <Button onClick={() => setIsConnected(true)}>
              连接钱包
            </Button>
          )}
          
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