import Link from "next/link";
import React from "react";
import { CollectionListItem } from "../_lib/types";
import Image from "next/image";
import { formatPrice } from "../_lib/utils";

export default function CollectionCard({
  collection,
}: {
  collection: CollectionListItem;
}) {
  return (
    <Link
      key={collection.id}
      href={`/collections/${collection.id}`}
      className="bg-white dark:bg-zinc-800 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-700 transition-all hover:shadow-lg"
    >
      {/* 合集封面图 */}
      <div className="relative h-48 w-full overflow-hidden">
        {collection.logo_image_url && (
          <Image
            src={collection.logo_image_url}
            alt={collection.name}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        )}
      </div>

      {/* 合集信息 */}
      <div className="p-4">
        {/* 创作者头像和名称 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative w-6 h-6 rounded-full overflow-hidden">
            <Image
              src={collection.creator?.avatar_url || ""}
              alt={collection.creator?.username || ""}
              fill
              className="object-cover"
              sizes="24px"
            />
          </div>
          <span className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
            {collection.creator?.username}
          </span>
        </div>

        {/* 合集名称 */}
        <h3 className="font-medium text-lg mb-2 truncate">{collection.name}</h3>

        {/* 合集描述 */}
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
          {collection.description}
        </p>

        {/* 合集统计数据 */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex flex-col">
            <span className="text-zinc-500 dark:text-zinc-400">地板价</span>
            <span className="font-medium">
              ${formatPrice(collection.floorPrice)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500 dark:text-zinc-400">总交易量</span>
            <span className="font-medium">
              ${formatPrice(collection.volume)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500 dark:text-zinc-400">物品数量</span>
            <span className="font-medium">
              {collection.itemCount}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500 dark:text-zinc-400">持有者</span>
            <span className="font-medium">
              {collection.ownerCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
