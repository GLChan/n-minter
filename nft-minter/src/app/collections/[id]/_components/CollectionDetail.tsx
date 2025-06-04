import React from "react";
import { CollectionInfo } from "@/app/_lib/types";
import { formatDate } from "@/app/_lib/utils";

export default function CollectionDetail({
  collection,
}: {
  collection: CollectionInfo;
}) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 overflow-hidden mb-8">
      <div className="p-6">
        <h3 className="font-medium mb-4">合集信息</h3>
        <div className="space-y-4">
          <div className="flex justify-between pb-4 border-b border-zinc-100 dark:border-zinc-700">
            <span className="text-zinc-500 dark:text-zinc-400">合约地址</span>
            <span className="font-medium">{collection.contract_address}</span>
          </div>
          <div className="flex justify-between pb-4 border-b border-zinc-100 dark:border-zinc-700">
            <span className="text-zinc-500 dark:text-zinc-400">代币标准</span>
            <span className="font-medium">ERC-721</span>
          </div>
          <div className="flex justify-between pb-4 border-b border-zinc-100 dark:border-zinc-700">
            <span className="text-zinc-500 dark:text-zinc-400">区块链</span>
            <span className="font-medium">以太坊</span>
          </div>
          <div className="flex justify-between pb-4 border-b border-zinc-100 dark:border-zinc-700">
            <span className="text-zinc-500 dark:text-zinc-400">创建日期</span>
            <span className="font-medium">
              {formatDate(collection.created_at)}
            </span>
          </div>
          <div className="flex justify-between pb-4 border-b border-zinc-100 dark:border-zinc-700">
            <span className="text-zinc-500 dark:text-zinc-400">创作者版税</span>
            <span className="font-medium">
              {collection.royalty_fee_bps
                ? collection.royalty_fee_bps / 100
                : "-"}
              %
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">分类</span>
            <span className="font-medium">{collection.category_id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
