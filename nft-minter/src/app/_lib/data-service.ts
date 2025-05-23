import { createClient } from "@/app/_lib/supabase/client";
import { notFound } from "next/navigation";
import {
  Attribute,
  AttributeKeyValue,
  Collection,
  CollectionCategory,
  CollectionInfo,
  CollectionStats,
  NFT,
  NFTAttribute,
  NFTDetail,
  NFTInfo,
  Transaction,
  UserProfile,
} from "./types";
import {
  NFTMarketStatus,
  NFTVisibilityStatus,
  SORT_OPTIONS,
  TransactionStatus,
  TransactionType,
} from "./types/enums";

const supabase = createClient();

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    console.error("获取用户失败:", error);
    notFound();
  }
  return user;
}

export async function getUserProfile(): Promise<UserProfile> {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("获取用户资料失败:", error);
    notFound();
  }
  const profile = await getProfileByUserId(data.user.id);
  return profile;
}

export async function getProfileByWallet(walletAddress: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("wallet_address", walletAddress)
    .single();

  if (error) {
    console.error("获取用户资料失败Wallet:", error);
    notFound();
  }

  return data;
}

export async function createGuest(profile: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from("profiles")
    .insert(profile as UserProfile);

  if (error) {
    console.error(error);
    throw new Error("Profiles could not be created");
  }

  return data;
}

export async function getProfileByUserId(userId: string): Promise<UserProfile> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("获取用户资料失败Id:", error);
    notFound();
  }
  return profile;
}

export async function getUserNFTs(
  page: number,
  pageSize: number,
  ownerId?: string
): Promise<NFTInfo[]> {
  let query = supabase
    .from("nfts")
    .select("*, collection:collections(*), profile:profiles!owner_id(*)");

  if (ownerId) {
    query = query.eq("owner_id", ownerId);
  }
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query.order("created_at", { ascending: false }).range(from, to);

  const { data, error } = await query;

  if (error) {
    console.error("获取用户NFT失败:", error);
    notFound();
  }

  return data || [];
}

export async function getNFTById(id: string): Promise<NFTDetail> {
  const { data, error } = await supabase
    .from("nfts")
    .select(
      "*, collection:collections(*), owner:profiles!owner_id(*), creator:profiles!creator_id(*)"
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("获取NFT失败:", error);
    notFound();
  }

  return data;
}

export async function getNFTAttributes(nftId: string): Promise<NFTAttribute[]> {
  const { data: attributes, error } = await supabase
    .from("nft_attributes")
    .select("*")
    .eq("nft_id", nftId);

  if (error) {
    console.error("获取NFT属性失败:", error);
    notFound();
  }

  return attributes || [];
}

export async function getNFTHistory(nftId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("nft_id", nftId)
    .order("transaction_time", { ascending: false });
  if (error) {
    console.error("获取NFT历史失败:", error);
    notFound();
  }

  return data || [];
}

export async function getCollectionByUserId(
  userId: string
): Promise<Collection[]> {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("id", userId);

  if (error) {
    console.error("获取用户合集失败:", error);
    notFound();
  }

  return data;
}

export async function listNFT(
  nftId: string,
  price: number,
  walletAddress: string,
  currency: string
) {
  const { data, error } = await supabase
    .from("nfts")
    .update({
      list_status: NFTMarketStatus.ListedFixedPrice,
      status: NFTVisibilityStatus.Visible,
      list_price: price,
      list_currency: currency,
      lister_address: walletAddress,
      updated_at: new Date().toISOString(),
    })
    .eq("id", nftId);

  if (error) {
    console.error("上架NFT失败:", error);
    notFound();
  }

  // transaction
  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .insert({
      nft_id: nftId,
      price,
      status: TransactionStatus.Successful,
      transaction_time: new Date().toISOString(),
      transaction_type: TransactionType.List,
      buyer_address: "",
      seller_address: walletAddress,
      currency: currency,
      transaction_hash: "",
    });

  if (transactionError) {
    console.error("上架NFT失败:", transactionError);
    notFound();
  }

  return transaction;
}

export async function unlistNFT(nftId: string, walletAddress: string) {
  const { data, error } = await supabase
    .from("nfts")
    .update({
      list_status: NFTMarketStatus.NotListed,
      status: NFTVisibilityStatus.HiddenByUser,
      list_price: null,
      list_currency: null,
      lister_address: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", nftId);

  if (error) {
    console.error("下架NFT失败:", error);
    throw new Error("下架NFT时发生错误");
  }

  // 记录下架交易
  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .insert({
      nft_id: nftId,
      price: 0,
      status: TransactionStatus.Successful,
      transaction_time: new Date().toISOString(),
      transaction_type: TransactionType.Unlist,
      buyer_address: "",
      seller_address: walletAddress,
      currency: "",
      transaction_hash: "",
    });

  if (transactionError) {
    console.error("记录下架交易失败:", transactionError);
    // 不抛出异常，因为NFT已经成功下架
    console.warn("NFT已下架，但未能记录交易历史");
  }

  return data;
}

export async function getCollectionCategories(): Promise<CollectionCategory[]> {
  const { data, error } = await supabase
    .from("collections_categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("获取合集类别失败:", error);
    return [];
  }

  return data;
}

export async function getCollectionById(id: string): Promise<CollectionInfo> {
  const { data, error } = await supabase
    .from("collections")
    .select("*, creator:profiles!creator_id(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("获取合集失败:", error);
    notFound();
  }

  return data;
}

export async function getCollectionStatsById(
  id: string
): Promise<CollectionStats> {
  // 获取合集的统计数据
  // 交易量、地板价、持有者数量等
  // 获取合集下的所有nft 的数量
  const { count: itemCount, error } = await supabase
    .from("nfts")
    .select("*", { count: "exact", head: true })
    .eq("collection_id", id);

  const { data: ownerCount } = await supabase.rpc(
    "get_unique_holders_for_collection",
    {
      target_collection_id: id, // 将参数名与函数定义中的参数名匹配
    }
  );

  return {
    volume: 0,
    floorPrice: 0,
    itemCount: itemCount || 0,
    ownerCount: ownerCount || 0,
  };
}

export async function getNFTsByCollectionIdAndPage(
  collectionId: string,
  page: number,
  pageSize: number
): Promise<NFT[]> {
  const { data, error } = await supabase
    .from("nfts")
    .select("*, collection:collections(*)")
    .eq("collection_id", collectionId)
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    console.error("获取合集NFT失败:", error);
    notFound();
  }

  return data;
}
export async function getNFTsByCollectionId(
  collectionId: string,
  page: number,
  pageSize: number,
  sortBy: string
): Promise<NFTInfo[]> {
  const query = supabase
    .from("nfts")
    .select("*, collection:collections(*), profile:profiles!owner_id(*)")
    .eq("collection_id", collectionId)
    .eq("status", NFTVisibilityStatus.Visible)

  switch (sortBy) {
    case SORT_OPTIONS.RECENT_LISTED:
      query.order("updated_at", { ascending: false });
      break;
    case SORT_OPTIONS.PRICE_ASC:
      query.order("list_price", { ascending: true });
      break;
    case SORT_OPTIONS.PRICE_DESC:
      query.order("list_price", { ascending: false });
      break;
    case SORT_OPTIONS.RECENT_CREATED:
      query.order("created_at", { ascending: false });
      break;
    default:
      query.order("updated_at", { ascending: false });
      break;
  }

  query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error } = await query;

  if (error) {
    console.error("获取合集NFT失败:", error);
    notFound();
  }

  return data;
}
