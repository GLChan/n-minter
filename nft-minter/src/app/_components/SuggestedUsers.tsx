"use client"
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/Button';

interface User {
  id: string;
  username: string;
  avatar: string;
}

// 扩展模拟用户数据
const mockUsers: User[] = [
  {
    id: '1',
    username: 'nicoeon',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces&q=80'
  },
  {
    id: '2',
    username: 'mundoviolento',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces&q=80'
  },
  {
    id: '3',
    username: 'innamosina',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&q=80'
  },
  {
    id: '4',
    username: 'artcreator',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces&q=80'
  },
  {
    id: '5',
    username: 'metaverse',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces&q=80'
  },
  {
    id: '6',
    username: 'cryptolover',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80'
  }
];

export const SuggestedUsers = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  
  // 复制用户列表以创建无限滚动效果
  const extendedUsers = [...mockUsers, ...mockUsers, ...mockUsers];
  
  useEffect(() => {
    let animationId: number;
    let lastTimestamp = 0;
    
    const animate = (timestamp: number) => {
      if (!isPaused && scrollRef.current) {
        // 控制滚动速度，每50毫秒移动1像素
        if (!lastTimestamp || timestamp - lastTimestamp > 50) {
          lastTimestamp = timestamp;
          
          // 更新滚动位置
          setCurrentPosition(prevPosition => {
            const newPosition = prevPosition + 1;
            
            // 当第一组用户完全滚出视图时，重置位置到第二组开始
            if (newPosition >= scrollRef.current!.clientHeight) {
              return 0;
            }
            
            return newPosition;
          });
        }
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPaused]);
  
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <section className="w-full py-8">
      <h2 className="text-xl font-semibold mb-6">推荐关注</h2>
      
      <div 
        className="relative h-80 overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          ref={scrollRef}
          className="absolute top-0 left-0 w-full transition-all duration-200"
          style={{ transform: `translateY(-${currentPosition}px)` }}
        >
          {extendedUsers.map((user, index) => (
            <div 
              key={`${user.id}-${index}`} 
              className="flex items-center justify-between p-3 mb-4 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 hover:shadow-md transition-shadow"
            >
              <Link href={`/profile/${user.username}`} className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image 
                    src={user.avatar} 
                    alt={user.username}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div>
                  <span className="font-medium">{user.username}</span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">NFT 创作者</p>
                </div>
              </Link>
              
              <Button 
                variant="secondary" 
                size="sm"
              >
                关注
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 