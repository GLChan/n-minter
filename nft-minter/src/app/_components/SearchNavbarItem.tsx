"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from './ui/Button'; // Assuming Button is in ./ui/Button relative to _components

const quickTagsData = [
  '数字艺术',
  '加密朋克',
  '元宇宙',
  '游戏资产',
  '音乐NFT'
];

// Mock data for recent searches (replace with actual data fetching or local storage later)
const mockRecentSearches = [
    { id: '1', term: 'Cool NFT Collection' },
    { id: '2', term: 'Top Creators' },
    { id: '3', term: 'Abstract Art' },
];

export const SearchNavbarItem = () => {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState(mockRecentSearches); // State for recent searches
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      // Add to recent searches (simple implementation, consider duplicates, limits, etc.)
      if (!recentSearches.find(rs => rs.term.toLowerCase() === searchQuery.trim().toLowerCase())) {
        const newRecentSearch = { id: Date.now().toString(), term: searchQuery.trim() };
        setRecentSearches(prev => [newRecentSearch, ...prev].slice(0, 5)); // Keep last 5
      }
      setTimeout(() => { // Simulate API call
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setIsSearchOpen(false);
        setIsSearching(false);
        // setSearchQuery(''); // Optionally clear query after search
      }, 500);
    }
  };

  const handleTagOrRecentSearch = (term: string) => {
    setSearchQuery(term);
    setIsSearching(true);
    // Add to recent searches if it's a tag click and not already a top recent one
    if (!recentSearches.find(rs => rs.term.toLowerCase() === term.toLowerCase())) {
        const newRecentSearch = { id: Date.now().toString(), term: term };
        setRecentSearches(prev => [newRecentSearch, ...prev].slice(0, 5));
    }
    setTimeout(() => {
      router.push(`/search?q=${encodeURIComponent(term)}`);
      setIsSearchOpen(false);
      setIsSearching(false);
    }, 300);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    // Optionally, also clear from localStorage if used
  };

  return (
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
      
      {isSearchOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700/50 overflow-hidden z-50">
          <form onSubmit={handleSearchSubmit}>
            <div className="flex items-center p-2 border-b border-zinc-100 dark:border-zinc-800">
              <input
                type="text"
                placeholder="搜索 NFT、合集或创作者..."
                className="flex-1 px-3 py-2 text-sm bg-transparent outline-none border-none focus:ring-0 placeholder-zinc-400 dark:placeholder-zinc-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isSearching}
                autoFocus
              />
              <button
                type="submit"
                className="p-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 disabled:opacity-50 transition-colors"
                disabled={isSearching || !searchQuery.trim()}
                aria-label="Submit search"
              >
                {isSearching ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                )}
              </button>
            </div>
          </form>

          {isSearching && (
            <div className="p-8 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin h-8 w-8 text-zinc-500 mb-3" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">搜索中...</p>
            </div>
          )}

          {!isSearching && searchQuery.length === 0 && recentSearches.length > 0 && (
            <div className="px-3 py-2">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">最近搜索</div>
                {recentSearches.length > 0 && (
                    <button onClick={clearRecentSearches} className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                        清除
                    </button>
                )}
              </div>
              <div className="space-y-1">
                {recentSearches.map((item) => (
                  <button
                    key={item.id}
                    className="w-full text-left text-sm py-1.5 px-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300"
                    onClick={() => handleTagOrRecentSearch(item.term)}
                  >
                    {item.term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isSearching && (
            <div className={`p-3 ${searchQuery.length === 0 && recentSearches.length > 0 ? 'border-t border-zinc-100 dark:border-zinc-800' : ''}`}>
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">热门标签</div>
              <div className="flex flex-wrap gap-2">
                {quickTagsData.map((tag, index) => (
                  <button
                    key={index}
                    className="px-2.5 py-1 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-700 dark:text-zinc-300"
                    onClick={() => handleTagOrRecentSearch(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 