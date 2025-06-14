import React from "react";
import Link from "next/link";
import { ActivityLogItem, Collection, NFT, UserProfile } from "../_lib/types";
import { formatTimeAgo, weiToEth } from "../_lib/utils";
import { ActionType } from "../_lib/types/enums";

type Details = {
  price: number;
  currency: string;
};

export default function ActivityLogInfo({
  activity,
}: Readonly<{
  activity: ActivityLogItem;
}>) {
  const {
    user,
    nft,
    collection,
    related_user,
    created_at,
    action_type,
    details,
  } = activity;

  let price = 0;
  let currency = "ETH";
  const timeAgo = formatTimeAgo(created_at);

  const User = <UserLink user={user} userId={activity.user_id} />;
  const Nft = <NftLink nft={nft} nftId={activity.nft_id} />;
  const Collection = (
    <CollectionLink
      collection={collection}
      collectionId={activity.collection_id}
    />
  );
  const RelatedUser = (
    <UserLink user={related_user} userId={activity.related_user_id} />
  );

  if (details) {
    const detailObj = (details as Details) || {};
    price = detailObj.price ?? 0;
    currency = detailObj.currency ?? "ETH";
  }

  // 使用 React Fragment (<> ... </>) 来包裹 JSX 元素和文本
  switch (action_type) {
    case ActionType.MINT_NFT:
      return (
        <>
          {User} 铸造了新的 NFT {Nft}。{" "}
          <span className="time-ago">({timeAgo})</span>
        </>
      );

    case ActionType.LIST_NFT:
      return (
        <>
          {User} 上架了 {Nft}，售价 {price ?? "未知"} {currency}。{" "}
          <span className="time-ago">({timeAgo})</span>
        </>
      );

    case ActionType.UNLIST_NFT:
      return (
        <>
          {User} 下架了 {Nft}。 <span className="time-ago">({timeAgo})</span>
        </>
      );

    case ActionType.SELL_NFT:
      return (
        <>
          {User} 将 {Nft} 卖给了 {RelatedUser}，价格为 {price ?? "未知"}{" "}
          {currency}。 <span className="time-ago">({timeAgo})</span>
        </>
      );

    case ActionType.BUY_NFT:
      return (
        <>
          {User} 从 {RelatedUser} 手中购买了 {Nft}，价格为 {price ?? "未知"}{" "}
          {currency}。 <span className="time-ago">({timeAgo})</span>
        </>
      );

    case "COLLECT_NFT":
      return (
        <>
          {User} 收藏了 {Nft} 来自 {RelatedUser}。{" "}
          <span className="time-ago">({timeAgo})</span>
        </>
      );

    case ActionType.TRANSFER_NFT:
      return (
        <>
          {User} 将 {Nft} 转移给了 {RelatedUser}。{" "}
          <span className="time-ago">({timeAgo})</span>
        </>
      );

    case ActionType.UPDATE_PROFILE:
      return (
        <>
          {User} 更新了个人资料。 <span className="time-ago">({timeAgo})</span>
        </>
      );

    case ActionType.FOLLOW_USER:
      return (
        <>
          {User} 关注了 {RelatedUser}。{" "}
          <span className="time-ago">({timeAgo})</span>
        </>
      );

    case ActionType.UNFOLLOW_USER:
      return (
        <>
          {User} 取消关注了 {RelatedUser}。{" "}
          <span className="time-ago">({timeAgo})</span>
        </>
      );

    case ActionType.FAVORITE_COLLECTION:
      return (
        <>
          {User} 收藏了合集 {Collection}。{" "}
          <span className="time-ago">({timeAgo})</span>
        </>
      );

    case ActionType.CREATE_COLLECTION:
      return (
        <>
          {User} 创建了新的合集 {Collection}。{" "}
          <span className="time-ago">({timeAgo})</span>
        </>
      );

    case ActionType.CREATE_OFFER:
      return (
        <>
          {User} 创建了对 {Nft} 的出价，价格为 {price ? weiToEth(`${price}`) : "未知"} {currency}。{" "}
          <span className="time-ago">({timeAgo})</span>
        </>
      );
    default:
      console.warn("未知的活动类型:", action_type);
      return (
        <>
          {User} 执行了一个未知操作。{" "}
          <span className="time-ago">({timeAgo})</span>
        </>
      );
  }
}

// 用户链接
const UserLink: React.FC<{
  user?: UserProfile | null;
  userId?: string | null;
}> = ({ user, userId }) => {
  const id = user?.id ?? userId;
  const name = user?.username ?? `用户 ${id?.substring(0, 6)}`;
  if (!id) return <span>未知用户</span>;
  return (
    <Link href={`/user/${id}`} className="activity-link user-link font-bold">
      {name}
    </Link>
  );
};

// NFT 链接
const NftLink: React.FC<{ nft?: NFT | null; nftId?: string | null }> = ({
  nft,
  nftId,
}) => {
  const id = nft?.id ?? nftId;
  const name = nft?.name ?? `NFT #${id?.substring(0, 6)}`;
  if (!id) return <span>某个 NFT</span>;
  return (
    <Link href={`/nft/${id}`} className="activity-link nft-link font-bold">
      {name}
    </Link>
  );
};

// 合集链接
const CollectionLink: React.FC<{
  collection?: Collection | null;
  collectionId?: string | null;
}> = ({ collection, collectionId }) => {
  const id = collection?.id ?? collectionId;
  const name = collection?.name ?? `合集 #${id?.substring(0, 6)}`;
  if (!id) return <span>某个合集</span>;
  return (
    <Link
      href={`/collections/${id}`}
      className="activity-link collection-link font-bold"
    >
      {name}
    </Link>
  );
};
