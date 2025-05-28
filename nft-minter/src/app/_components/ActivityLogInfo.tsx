import React from 'react';
import Link from 'next/link';
import { ActivityLogItem, Collection, NFT, UserProfile } from '../_lib/types';
import { formatTimeAgo } from '../_lib/utils';

export default function ActivityLogInfo({ activity }: { activity: ActivityLogItem }) {
  
  const { user, nft, collection, related_user, details, created_at, action_type } = activity;

  const price = 0 // details?.price;
  const currency = 'ETH' // details?.currency || 'ETH';
  const timeAgo = formatTimeAgo(created_at);

  const User = <UserLink user={user} userId={activity.user_id} />;
  const Nft = <NftLink nft={nft} nftId={activity.nft_id} details={details} />;
  const Collection = <CollectionLink collection={collection} collectionId={activity.collection_id} details={details} />;
  const RelatedUser = <UserLink user={related_user} userId={activity.related_user_id} />;

  // 使用 React Fragment (<> ... </>) 来包裹 JSX 元素和文本
  switch (action_type) {
    case 'MINT_NFT':
      return <>{User} 铸造了新的 NFT {Nft}。 <span className="time-ago">({timeAgo})</span></>;

    case 'LIST_NFT':
      return <>{User} 上架了 {Nft}，售价 {price || '未知'} {currency}。 <span className="time-ago">({timeAgo})</span></>;

    case 'UNLIST_NFT':
      return <>{User} 下架了 {Nft}。 <span className="time-ago">({timeAgo})</span></>;

    case 'SELL_NFT':
      return <>{User} 将 {Nft} 卖给了 {RelatedUser}，价格为 {price || '未知'} {currency}。 <span className="time-ago">({timeAgo})</span></>;

    case 'BUY_NFT':
      return <>{User} 从 {RelatedUser} 手中购买了 {Nft}，价格为 {price || '未知'} {currency}。 <span className="time-ago">({timeAgo})</span></>;
      
    case 'COLLECT_NFT': // 假设 '收藏' 是购买
        return <>{User} 收藏了 {Nft} 来自 {RelatedUser}。 <span className="time-ago">({timeAgo})</span></>;

    case 'TRANSFER_NFT':
      return <>{User} 将 {Nft} 转移给了 {RelatedUser}。 <span className="time-ago">({timeAgo})</span></>;

    case 'UPDATE_PROFILE':
      return <>{User} 更新了个人资料。 <span className="time-ago">({timeAgo})</span></>;

    case 'FOLLOW_USER':
      return <>{User} 关注了 {RelatedUser}。 <span className="time-ago">({timeAgo})</span></>;

    case 'UNFOLLOW_USER':
      return <>{User} 取消关注了 {RelatedUser}。 <span className="time-ago">({timeAgo})</span></>;

    case 'FAVORITE_COLLECTION':
      return <>{User} 收藏了合集 {Collection}。 <span className="time-ago">({timeAgo})</span></>;
      
    case 'CREATE_COLLECTION':
      return <>{User} 创建了新的合集 {Collection}。 <span className="time-ago">({timeAgo})</span></>;

    default:
      console.warn("未知的活动类型:", action_type);
      return <>{User} 执行了一个未知操作。 <span className="time-ago">({timeAgo})</span></>;
  }
}


// --- 辅助 Link 组件 ---

// 用户链接
const UserLink: React.FC<{ user?: UserProfile | null; userId?: string | null }> = ({ user, userId }) => {
  const id = user?.id || userId;
  const name = user?.username || `用户 ${id?.substring(0, 6)}`;
  if (!id) return <span>未知用户</span>;
  return <Link href={`/user/${id}`} className="activity-link user-link font-bold">{name}</Link>;
};

// NFT 链接
const NftLink: React.FC<{ nft?: NFT | null; nftId?: string | null; details?: any }> = ({ nft, nftId, details }) => {
  const id = nft?.id || nftId;
  const name = nft?.name || details?.nft_name || `NFT #${id?.substring(0, 6)}`;
  if (!id) return <span>某个 NFT</span>;
  return <Link href={`/nft/${id}`} className="activity-link nft-link font-bold">{name}</Link>;
};

// 合集链接
const CollectionLink: React.FC<{ collection?: Collection | null; collectionId?: string | null; details?: any }> = ({ collection, collectionId, details }) => {
  const id = collection?.id || collectionId;
  const name = collection?.name || details?.collection_name || `合集 #${id?.substring(0, 6)}`;
  if (!id) return <span>某个合集</span>;
  return <Link href={`/collection/${id}`} className="activity-link collection-link font-bold">{name}</Link>;
};

