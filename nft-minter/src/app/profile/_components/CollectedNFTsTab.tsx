import React from "react";
import { NFTCard } from "@/app/_components/ui/NFTCard";
import { getUserFavoriteNFTs, getUserInfo } from "@/app/_lib/actions";

export async function CollectedNFTsTab() {
  const user = await getUserInfo();
  const favs = await getUserFavoriteNFTs(user.id);

  console.log("favs", favs);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 sr-only">收藏的 NFT</h2>
      {favs.length > 0 ? (
        // 网格布局，响应不同屏幕尺寸
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favs.map((nft) => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
        </div>
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400 mt-6">
          还没有收藏任何 NFT。
        </p>
      )}
    </div>
  );
}
