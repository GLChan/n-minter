import React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice, weiToEth } from "@/app/_lib/utils";
import { fetchCollectionsWithFilters } from "../_lib/data-service";

export default async function TrendingCollectionCards() {
  const collections = await fetchCollectionsWithFilters({
    sortBy: "volume",
    timeRange: "24d",
    sortDirection: "DESC",
  });

  return (
    <>
      {collections.map((collection) => (
        <div
          key={collection.id}
          className="min-w-[240px] md:min-w-[280px] snap-start"
        >
          <Link
            key={collection.id}
            href={`/collections/${collection.id}`}
            className="group"
          >
            <div className="flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="relative h-48 w-full">
                <Image
                  src={collection.logo_image_url ?? ""}
                  alt={collection.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              <div className="p-4">
                <div className="flex justify-between items-baseline mb-3">
                  <h3 className="font-medium">{collection.name}</h3>
                  <span className="text-zinc-500 text-sm">
                    {/* {collection.timeFrame} */}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="text-zinc-500 mb-1">Volume</span>
                    <span className="font-medium">
                      ${formatPrice(weiToEth(collection.volume))}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-zinc-500 mb-1">Floor</span>
                    <span className="font-medium">
                      ${formatPrice(weiToEth(collection.floor_price))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </>
  );
}
