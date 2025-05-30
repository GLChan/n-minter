import { NFTCard } from "@/app/_components/ui/NFTCard";
import { getUserNFTs } from "@/app/_lib/data-service";
import { UserProfile } from "@/app/_lib/types";
import React from "react";

export default async function Holdings({
  user,
  currentPage,
}: {
  user: UserProfile;
  currentPage: number;
}) {
  const holdings = await getUserNFTs({
    page: currentPage,
    pageSize: 10,
    ownerId: user.id,
  });

  return (
    <div className="mt-6">
      {holdings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {holdings.map((nft) => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
        </div>
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400 mt-6">
          <span className="font-bold">{user.username}</span>{" "}
          还没有持有任何藏品。
        </p>
      )}
    </div>
  );
}
