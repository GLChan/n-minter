import { createClient } from '@/app/_lib/supabase/client';
import { notFound } from "next/navigation";
import { Attribute, AttributeKeyValue, Collection, NFT, NFTAttribute, NFTDetail, NFTInfo, UserProfile } from './types';

const supabase = createClient();

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('获取用户失败:', error);
    notFound()
  }
  return user;
}

export async function getUserProfile(): Promise<UserProfile> {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('获取用户资料失败:', error);
    notFound()
  }
  const profile = await getProfileByUserId(data.user.id)
  return profile;
}

export async function getProfileByWallet(walletAddress: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();

  if (error) {
    console.error('获取用户资料失败Wallet:', error);
    notFound()
  }

  return data;
}


export async function createGuest(profile: Partial<UserProfile>) {
  const { data, error } = await supabase.from("profiles").insert(profile as UserProfile);

  if (error) {
    console.error(error);
    throw new Error("Profiles could not be created");
  }

  return data;
}


export async function getProfileByUserId(userId: string): Promise<UserProfile> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('获取用户资料失败Id:', error);
    notFound()
  }
  return profile;
}

export async function getUserNFTs(page: number, pageSize: number, ownerId?: string): Promise<NFTInfo[]> {
  let query = supabase
    .from('nfts')
    .select('*, collection:collections(*), profile:profiles!owner_id(*)')

  if (ownerId) {
    query = query.eq('owner_id', ownerId);
  }
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query.order('created_at', { ascending: false })
    .range(from, to);

  const { data, error } = await query

  if (error) {
    console.error('获取用户NFT失败:', error);
    notFound()
  }

  return data || [];
};

export async function getNFTById(id: string): Promise<NFTDetail> {
  const { data, error } = await supabase
    .from('nfts')
    .select('*, collection:collections(*), owner:profiles!owner_id(*), creator:profiles!creator_id(*)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('获取NFT失败:', error);
    notFound()
  }

  return data
}

export async function getCollectionByUserId(userId: string): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('id', userId);

  if (error) {
    console.error('获取用户合集失败:', error);
    notFound()
  }

  return data;
}
