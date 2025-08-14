import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getReceivedOffers } from "@/app/_lib/actions";
import { formatIPFSUrl, formatTimeAgo, weiToEth } from "@/app/_lib/utils";
import { OfferActionButtons } from "./OfferActionButtons";

export async function OffersTab() {
  const receivedOffers = await getReceivedOffers();
  
  console.log("Received offers:", receivedOffers);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">收到的报价</h2>
      {receivedOffers && receivedOffers.length > 0 ? (
        <div className="space-y-4">
          {receivedOffers.map((offer) => (
            <div
              key={offer.id}
              className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800"
            >
              {offer.nft && (
                <>
                  <Link href={`/nft/${offer.nft.id}`} className="flex-shrink-0">
                    <Image
                      src={formatIPFSUrl(offer.nft.image_url)}
                      alt={offer.nft.name}
                      width={64}
                      height={64}
                      className="rounded-md object-cover w-16 h-16"
                    />
                  </Link>
                  <div className="flex-grow min-w-[200px]">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      收到对{" "}
                      <Link
                        href={`/nft/${offer.nft.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {offer.nft.name}
                      </Link>{" "}
                      的报价
                    </p>
                    <p className="text-lg font-semibold my-1">
                      {offer.price_wei ? weiToEth(offer.price_wei) : "--"}{" "}
                      ETH
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      来自{" "}
                      <span className="font-mono">
                        {offer.offerer?.username}
                      </span>{" "}
                      • {formatTimeAgo(offer.created_at)}
                    </p>
                  </div>
                </>
              )}
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 ml-auto">
                <OfferActionButtons offer={offer}/>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400 mt-6 text-center">
          您目前没有收到任何报价。
        </p>
      )}
    </div>
  );
}
