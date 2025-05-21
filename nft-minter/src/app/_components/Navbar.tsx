"use client"

import React, { useState } from 'react'; // Simplified React import
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { SearchNavbarItem } from './SearchNavbarItem';
import useAsyncEffect from '../_lib/hooks/useAsyncEffect';
import { isAuthAction } from '../_lib/actions/auth';
import { getUserProfile } from '../_lib/data-service';
import { UserProfile } from '../_lib/types';
export const Navbar = () => {
  const navLinks = [
    { title: '探索', href: '/explore' },
    { title: '创建', href: '/create' },
    { title: '合集', href: '/collections' },
  ];

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useAsyncEffect(async () => {
    const { isAuth } = await isAuthAction();
    if (isAuth) {
      const userProfile = await getUserProfile();
      console.log('userProfile', userProfile);
      setUserProfile(userProfile);
    } else {
      setUserProfile(null);
    }
  }, []);

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

            {userProfile && (
              <>
                <Link href="/profile" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  个人中心
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* 右侧组件区域 */}
        <div className="flex items-center gap-4">
          {/* 搜索组件 */}
          <SearchNavbarItem />

          {/* 钱包连接组件 */}
          <ConnectButton />

          {/* 移动端菜单按钮 */}
          <button
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Menu"
          // onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} // Placeholder for mobile menu toggle
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