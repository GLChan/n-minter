import { Tables } from "./database.types";


export type NFT = Tables<"nfts">
export type Collection = Tables<"collections">
export type Attribute = Tables<"attributes"> // attributes key
export type NFTAttribute = Tables<"nft_attributes"> // attributes value 

export type UserProfile = Tables<"profiles">
export type UserCollection = Tables<"user_collections"> 
export type UserFollowing = Tables<"user_following">

export type Transaction = Tables<"transactions">

// export interface NFTInfo extends NFT {
  // collections: Collection | null;
  // profiles: UserProfile | null;
// }