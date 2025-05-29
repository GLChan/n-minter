import React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/app/_lib/utils";
import { fetchCollectionsWithFilters } from "../_lib/data-service";

interface Collection {
  id: string;
  name: string;
  image: string;
  volume: number;
  floorPrice: number;
  timeFrame: string;
}

const mockCollections: Collection[] = [
  {
    id: "1",
    name: "base",
    image:
      "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400&auto=format&fit=crop&q=80",
    volume: 6300000,
    floorPrice: 2303730,
    timeFrame: "6d",
  },
  {
    id: "2",
    name: "frog",
    image:
      "https://images.unsplash.com/photo-1502780402662-acc01c084a25?w=400&auto=format&fit=crop&q=80",
    volume: 185500,
    floorPrice: 257814,
    timeFrame: "1d",
  },
  {
    id: "3",
    name: "$cum",
    image:
      "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&auto=format&fit=crop&q=80",
    volume: 198800,
    floorPrice: 257074,
    timeFrame: "5d",
  },
  {
    id: "4",
    name: "base",
    image:
      "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400&auto=format&fit=crop&q=80",
    volume: 6300000,
    floorPrice: 2303730,
    timeFrame: "6d",
  },
  {
    id: "5",
    name: "frog",
    image:
      "https://images.unsplash.com/photo-1502780402662-acc01c084a25?w=400&auto=format&fit=crop&q=80",
    volume: 185500,
    floorPrice: 257814,
    timeFrame: "1d",
  },
  {
    id: "6",
    name: "$cum",
    image:
      "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&auto=format&fit=crop&q=80",
    volume: 198800,
    floorPrice: 257074,
    timeFrame: "5d",
  },
  {
    id: "7",
    name: "base",
    image:
      "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400&auto=format&fit=crop&q=80",
    volume: 6300000,
    floorPrice: 2303730,
    timeFrame: "6d",
  },
  {
    id: "8",
    name: "frog",
    image:
      "https://images.unsplash.com/photo-1502780402662-acc01c084a25?w=400&auto=format&fit=crop&q=80",
    volume: 185500,
    floorPrice: 257814,
    timeFrame: "1d",
  },
  {
    id: "9",
    name: "$cum",
    image:
      "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&auto=format&fit=crop&q=80",
    volume: 198800,
    floorPrice: 257074,
    timeFrame: "5d",
  },
  {
    id: "10",
    name: "base",
    image:
      "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400&auto=format&fit=crop&q=80",
    volume: 6300000,
    floorPrice: 2303730,
    timeFrame: "6d",
  },
  {
    id: "11",
    name: "frog",
    image:
      "https://images.unsplash.com/photo-1502780402662-acc01c084a25?w=400&auto=format&fit=crop&q=80",
    volume: 185500,
    floorPrice: 257814,
    timeFrame: "1d",
  },
  {
    id: "12",
    name: "$cum",
    image:
      "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&auto=format&fit=crop&q=80",
    volume: 198800,
    floorPrice: 257074,
    timeFrame: "5d",
  },
];
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
                  src={collection.logo_image_url || ""}
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
                      ${formatPrice(collection.volume)}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-zinc-500 mb-1">Floor</span>
                    <span className="font-medium">
                      ${formatPrice(collection.floor_price)}
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
