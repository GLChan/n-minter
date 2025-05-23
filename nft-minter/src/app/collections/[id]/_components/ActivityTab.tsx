import React from "react";
import Image from "next/image";

export default function ActivityTab({collectionId} : { collectionId: string }) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 overflow-hidden">
      <div className="p-6">
        <h3 className="font-medium mb-4">最近活动</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="flex items-center gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-700 last:border-0"
            >
              <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                <Image
                  src={`https://images.unsplash.com/photo-${
                    1610000000000 + item * 10000
                  }?w=96&h=96&fit=crop&q=80`}
                  alt="NFT"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">
                    抽象波形 #{100 + item}
                  </span>
                  <span className="text-sm font-medium">
                    {(Math.random() * 5).toFixed(2)} ETH
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    购买者: 0x1a2...b3c4
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {item}小时前
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
