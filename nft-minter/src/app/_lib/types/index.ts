import { Tables } from "./database.types";

export type Optional<T> = T | undefined | null;

export type NFT = Tables<"nfts">
export type Collection = Tables<"collections">
export type CollectionCategory = Tables<"collections_categories">
export type Attribute = Tables<"attributes"> // attributes key
export type NFTAttribute = Tables<"nft_attributes"> // attributes value 

export type UserProfile = Tables<"profiles">
export type UserCollection = Tables<"user_collections"> 
export type UserFollowing = Tables<"user_following">

export type Transaction = Tables<"transactions">
export type FeaturedNFTBanner = Tables<"featured_nft_banners">

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

export interface CollectionStats {
  volume: number;
  floorPrice: number;
  itemCount: number;
  ownerCount: number;
}