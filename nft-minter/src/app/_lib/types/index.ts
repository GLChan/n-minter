import { Tables } from "./database.types";
import { NFTOrderStatus } from "./enums";

export type Optional<T> = T | undefined | null;

export type NFT = Tables<"nfts">
export type Collection = Tables<"collections">
export type CollectionCategory = Tables<"collections_categories">
export type Attribute = Tables<"attributes"> // attributes key
export type NFTAttribute = Tables<"nft_attributes"> // attributes value 
export type Order = Tables<"orders">

export type UserProfile = Tables<"profiles">
export type UserCollection = Tables<"user_collections"> 
export type UserFollowing = Tables<"user_following">

export type Transaction = Tables<"transactions">
export type FeaturedNFTBanner = Tables<"featured_nft_banners">

export type ActivityLog = Tables<"activity_log">


// NFT列表页
export interface NFTInfo extends NFT {
  collection: Collection | null;
  profile: UserProfile | null;
}

// NFT详情页
export interface NFTDetail extends NFT {
  collection: Collection | null;
  owner: UserProfile | null;
  creator: UserProfile | null;
}

// 属性键值对
export interface AttributeKeyValue {
  [key: string]: string; // 例如：{ "颜色": "红色", "稀有度": "史诗" }
}

export interface CollectionInfo extends Collection {
  creator: UserProfile | null;
}

export interface CollectionListItem extends Collection {
  creator: UserProfile | null;
  floor_price: number;
  volume: number;
  item_count: number;
  owner_count: number;
}

export interface CollectionStats {
  volume: number;
  floorPrice: number;
  itemCount: number;
  ownerCount: number;
}

export interface ActivityLogItem extends ActivityLog {
  user?: UserProfile | null;
  related_user?: UserProfile | null;
  nft?: NFT | null;
  collection?: Collection | null;
}

export interface UserFollowStats {
  followersCount: number;
  followingCount: number;
  error?: string;
}

export interface OrderItem extends Order {
  nft: NFTInfo | null;
  offerer: UserProfile | null;
  status: NFTOrderStatus;
}

export type OrderPayload = {
  /** 卖家钱包地址 */
  seller: `0x${string}`;

  /** * 买家钱包地址。
   * 如果是公开挂单，任何人都可以购买，则此字段应为零地址: 
   * '0x0000000000000000000000000000000000000000' 
   */
  buyer: `0x${string}`;

  /** 被交易的 NFT 的合约地址 */
  nftAddress: `0x${string}`;

  /** 被交易的 NFT 的 Token ID */
  tokenId: bigint;

  /** * 支付货币的 ERC20 代币合约地址。
   * 例如 WETH 的地址。
   */
  currency: `0x${string}`;

  /** * 价格，以货币的最小单位表示 (例如 wei for WETH)。
   * 必须使用 bigint 类型。
   */
  price: bigint;

  /**
   * 从合约中获取的、属于签名者的当前 nonce。
   * 用于防止签名重放攻击。
   */
  nonce: bigint;

  /** * 订单的过期时间戳 (Unix aTimestamp, 以秒为单位)。
   * 必须使用 bigint 类型。
   */
  deadline: bigint;
};