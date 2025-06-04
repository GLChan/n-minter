import { createClient } from "@/app/_lib/supabase/client";
import { notFound } from "next/navigation";
import {
  ActivityLog,
  ActivityLogItem,
  Collection,
  CollectionCategory,
  CollectionInfo,
  CollectionListItem,
  CollectionStats,
  NFTAttribute,
  NFTDetail,
  NFTInfo,
  Transaction,
  UserProfile,
} from "./types";
import {
  ActionType,
  NFTMarketStatus,
  NFTVisibilityStatus,
  SORT_OPTIONS,
  TransactionStatus,
  TransactionType,
} from "./types/enums";

const supabase = createClient();

// add active log
export async function addActivityLog(
  params: Partial<ActivityLog>
): Promise<ActivityLog> {
  const { data, error } = await supabase
    .from("activity_log")
    .insert(params as ActivityLog)
    .select("*")
    .single();

  if (error) {
    console.error("添加活动日志失败:", error);
    throw new Error("添加活动日志失败");
  }

  return data;
}

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

// updateProfile
export async function updateProfile(
  userId: string,
  profileData: Partial<UserProfile>
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .update(profileData)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    console.error("更新用户资料失败:", error);
    throw new Error("更新用户资料失败");
  }

  if (!data) {
    throw new Error("更新用户资料失败，未返回数据");
  }

  addActivityLog({
    user_id: userId,
    action_type: ActionType.UPDATE_PROFILE,
    details: {
      message: "更新了个人简介",
    },
  });

  return data;
}

export async function getUserNFTs({
  page,
  pageSize,
  ownerId,
  creatorId,
  status = NFTVisibilityStatus.Visible,
}: {
  page: number;
  pageSize: number;
  ownerId?: string;
  creatorId?: string;
  status?: string;
}): Promise<NFTInfo[]> {
  let query = supabase
    .from("nfts")
    .select("*, collection:collections(*), profile:profiles!owner_id(*)");

  if (ownerId) {
    query = query.eq("owner_id", ownerId);
  }
  if (creatorId) {
    query = query.eq("creator_id", creatorId);
  }
  if (status) {
    query = query.eq("status", status);
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
    return [];
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
    .eq("id", nftId)
    .select("*")
    .single();
  console.log("listNFT data", data);

  if (error || !data) {
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

  addActivityLog({
    user_id: data.owner_id,
    action_type: ActionType.LIST_NFT,
    nft_id: nftId,
    details: {
      message: `上架了NFT ${data.name}，价格为 ${price} ${currency}`,
      nft_id: nftId,
      price,
      currency,
    },
  });

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

  console.log("unlistNFT data", transaction);

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

  if (error) {
    console.error("获取合集统计数据失败:", error);
  }

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
): Promise<NFTInfo[]> {
  const { data, error } = await supabase
    .from("nfts")
    .select("*, collection:collections(*), profile:profiles!owner_id(*)")
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
    .eq("status", NFTVisibilityStatus.Visible);

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

export async function getUserActivityLog(
  userId: string,
  page: number,
  pageSize: number
): Promise<ActivityLogItem[]> {
  const supabase = createClient();
  const query = supabase
    .from("activity_log")
    .select(
      "*, collection:collections!collection_id(*), nft:nfts!nft_id(*), user:profiles!user_id(*), relateUser:profiles!related_user_id(*)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching activity logs:", error);
    return [];
  }

  return data || [];
}

export async function getNftsByCollectionCategoryId({
  categoryId,
  page,
  pageSize,
  sortBy,
}: {
  categoryId: number;
  page: number;
  pageSize: number;
  sortBy: string;
}): Promise<NFTInfo[]> {
  try {
    // 1. 获取该分类下的所有合集 ID
    const { data: collectionCategoryLinks, error: ccError } = await supabase
      .from("collections")
      .select("id")
      .eq("category_id", categoryId);

    if (ccError) {
      console.error("获取合集分类关联失败:", ccError);
      throw ccError;
    }

    const collectionIds = collectionCategoryLinks.map((link) => link.id);

    // 2. 获取这些合集下的所有 NFT
    const query = supabase
      .from("nfts")
      .select("*, collection:collections(*), profile:profiles!owner_id(*)")
      .eq("status", NFTVisibilityStatus.Visible);

    if (categoryId !== 0) {
      query.in("collection_id", collectionIds);
    }

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
        query.order("created_at", { ascending: false });
        break;
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query.range(from, to);

    const { data: nfts, error: nftsError } = await query;
    if (nftsError) {
      console.error("获取NFT失败:", nftsError);
      throw nftsError;
    }

    return (nfts as NFTInfo[]) || [];
  } catch (error) {
    console.error("通过合集分类获取NFT时发生错误:", error);
    return [];
  }
}

export interface FetchCollectionsParams {
  categoryId?: string | null; // 对应 SQL p_category_id
  userId?: string | null; // 对应 SQL p_user_id
  timeRange?: "24h" | "7d" | "30d" | "all" | string; // 对应 SQL p_time_range
  sortBy?: "volume" | "floor" | "newest" | "owners" | string; // 对应 SQL p_sort_by
  sortDirection?: "ASC" | "DESC"; // 对应 SQL p_sort_direction
  page?: number; // 对应 SQL p_limit
  pageSize?: number; // 对应 SQL p_offset
}

export async function fetchCollectionsWithFilters(
  params: FetchCollectionsParams = {} // 设置默认值为空对象，使所有参数可选
): Promise<CollectionListItem[]> {
  // 准备传递给 RPC 函数的参数对象
  // SQL 函数中的参数名以 'p_' 开头
  const rpcParams: Record<string, unknown> = {};

  if (params.categoryId !== undefined)
    rpcParams.p_category_id = params.categoryId;
  if (params.userId !== undefined) rpcParams.p_user_id = params.userId;
  if (params.timeRange !== undefined) rpcParams.p_time_range = params.timeRange;
  if (params.sortBy !== undefined) rpcParams.p_sort_by = params.sortBy;
  if (params.sortDirection !== undefined)
    rpcParams.p_sort_direction = params.sortDirection;
  if (params.pageSize !== undefined) rpcParams.p_limit = params.pageSize || 10;
  if (params.page !== undefined)
    rpcParams.p_offset = params.page
      ? (params.page - 1) * (params.pageSize || 10)
      : 0;

  // console.log('rpcParams', rpcParams)
  try {
    const { data, error } = await supabase.rpc(
      "get_collections_with_filters_and_sort", // 你的 SQL 函数名
      rpcParams
    );

    if (error) {
      console.error(
        "Supabase RPC call (get_collections_with_filters_and_sort) failed:",
        error
      );
      throw error; // 或者你可以返回一个包含错误的对象，例如 { data: [], error }
    }

    // RPC 调用返回的 data 就是一个数组，其元素结构应与 SQL 函数的 RETURNS TABLE 定义匹配
    return (data as CollectionListItem[]) || []; // 类型断言，并确保在 data 为 null 时返回空数组
  } catch (error) {
    console.error("Error in fetchCollectionsWithFilters:", error);
    // 根据你的错误处理策略，决定是抛出错误还是返回一个错误状态
    // 例如: return Promise.reject(error);
    // 或者: return []; (如果希望静默失败并返回空列表)
    throw error; // 简单起见，先抛出
  }
}
