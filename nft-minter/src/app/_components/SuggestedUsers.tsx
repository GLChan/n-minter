"use client";
import React, { useState, useEffect, useRef } from "react";

export const SuggestedUsers: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);

  useEffect(() => {
    let animationId: number;
    let lastTimestamp = 0;

    const animate = (timestamp: number) => {
      if (!isPaused && scrollRef.current) {
        // 控制滚动速度，每50毫秒移动1像素
        if (!lastTimestamp || timestamp - lastTimestamp > 50) {
          lastTimestamp = timestamp;

          // 更新滚动位置
          setCurrentPosition((prevPosition) => {
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
          {children}
        </div>
      </div>
    </section>
  );
};
