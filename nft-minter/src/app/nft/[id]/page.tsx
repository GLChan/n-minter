import React from "react";
import Image from "next/image";
import Link from "next/link";
import NFTInteraction from "@/app/nft/[id]/_components/NFTInteraction";
import { formatAddress, formatDateTime, formatIPFSUrl } from "@/app/_lib/utils"; // formatPrice
import {
  getNFTAttributes,
  getNFTById,
  getNFTHistory,
  getProfileByUserId,
} from "@/app/_lib/data-service";
import { NFTAttribute, Transaction, UserProfile } from "@/app/_lib/types";
import { getUserInfo } from "@/app/_lib/actions";
import { getTranslations } from "next-intl/server";
import { isAuthAction } from "@/app/_lib/actions/auth";
import { FavoriteButton } from "@/app/_components/ui/FavoriteButton";

interface NFTDetailsProps {
  readonly params: Promise<{ id: string }>;
}

export default async function NFTDetails({ params }: NFTDetailsProps) {
  const t = await getTranslations("NFT");

  const { isAuth } = await isAuthAction();
  let userProfile: UserProfile | null = null;
  if (isAuth) {
    const user = await getUserInfo();
    userProfile = user ? await getProfileByUserId(user.id) : null;
  }

  // const tokenId = '457'

  // history 的 event 类型
  // 铸造, 出售, 上架, 出价, 接受出价, 转让, 降价, 购买, 拍卖开始, 拍卖结束

  const { id } = await params;

  const nft = await getNFTById(id);
  const imageUrl = nft.image_url ? formatIPFSUrl(nft.image_url) : "";

  const creator = nft.creator!;
  const owner = nft.owner!;
  const collection = nft.collection;

  const attributes: NFTAttribute[] = await getNFTAttributes(id);

  const history: Transaction[] = await getNFTHistory(id);

  function getT(key: string, defaultValue?: string) {
    return t.has(key) ? t(key) : defaultValue ?? key;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* 左侧 NFT 图片 */}
        <div className="relative aspect-square rounded-2xl overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={nft.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <></>
          )}
        </div>

        {/* 右侧 NFT 信息 */}
        <div className="flex flex-col gap-6">
          {/* 合集信息 */}
          <div className="flex justify-between items-center">
            {collection && (
              <Link
                href={`/collections/${collection.name}`}
                className="flex items-center gap-2"
              >
                <div className="relative w-6 h-6 rounded-full overflow-hidden">
                  <Image
                    src={collection.logo_image_url ?? ""}
                    alt={collection.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-sm">{collection.name}</span>
              </Link>
            )}

            {/* 收藏按钮 */}
            <FavoriteButton nftId={nft.id} isAuth={isAuth} />
          </div>

          {/* NFT 标题 */}
          <h1 className="text-3xl font-bold">{nft.name}</h1>

          {/* 创作者和拥有者 */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-zinc-500">创作者</span>
              <Link
                href={`/profile/${creator.wallet_address}`}
                className="flex items-center gap-2"
              >
                <div className="relative w-6 h-6 rounded-full overflow-hidden">
                  <Image
                    src={creator.avatar_url ?? ""}
                    alt={creator.username ?? ""}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-sm font-medium">{creator.username}</span>
              </Link>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm text-zinc-500">当前拥有者</span>
              <Link
                href={`/profile/${owner.wallet_address}`}
                className="flex items-center gap-2"
              >
                <div className="relative w-6 h-6 rounded-full overflow-hidden">
                  <Image
                    src={owner.avatar_url ?? ""}
                    alt={owner.username ?? ""}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-sm font-medium">{owner.username}</span>
              </Link>
            </div>
          </div>

          {/* 描述 */}
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">描述</h2>
            <p className="text-zinc-700 dark:text-zinc-300">
              {nft.description}
            </p>
          </div>

          {/* 价格和购买 */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl mt-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-sm text-zinc-500">当前价格</span>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">
                    {nft.list_price ?? '-'}
                  </span>
                  <span className="text-lg">{nft.list_currency ?? "ETH"}</span>
                </div>
              </div>
              <NFTInteraction userProfile={userProfile} nft={nft} />
            </div>
          </div>

          {/* 属性 */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">属性</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {attributes.map((attr, index) => (
                <div
                  key={index}
                  className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3 flex flex-col items-center"
                >
                  <span className="text-xs text-zinc-500 mb-1">
                    {getT(
                      `attributes.${attr.attribute_name}`,
                      attr.attribute_name ?? ""
                    )}
                  </span>
                  <span className="text-sm font-medium">
                    {getT(`attributes_value.${attr.value}`, attr.value ?? "")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 交易历史 */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3">交易历史</h2>
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="max-h-80 overflow-y-auto relative">
                <table className="w-full">
                  <thead className="bg-zinc-50 dark:bg-zinc-900 sticky top-0 z-10">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">
                        事件
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        价格
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        来源
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        目标
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        日期
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-zinc-200 dark:border-zinc-800"
                      >
                        <td className="p-3 text-sm">
                          {getT(
                            `transaction_type.${item.transaction_type}`,
                            item.transaction_type
                          )}
                        </td>
                        <td className="p-3 text-sm">
                          {item.price > 0 ? `${item.price} ETH` : "-"}
                        </td>
                        <td className="p-3 text-sm">
                          {formatAddress(item.seller_address) || "-"}
                        </td>
                        <td className="p-3 text-sm">
                          {formatAddress(item.buyer_address) ?? "-"}
                        </td>
                        <td className="p-3 text-sm">
                          {formatDateTime(item.transaction_time ?? "") ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
