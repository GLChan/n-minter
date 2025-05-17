import { createClient } from '@/app/_lib/supabase/client';
import { notFound } from "next/navigation";
import { Collection, NFT } from './types';

const supabase = createClient();

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('获取用户失败:', error);
    notFound()
  }
  return user;
}

export async function getUserProfile() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('获取用户资料失败:', error);
    notFound()
  }
  const profile = await getProfileByUserId(data.user.id);
  if (profile) {
    return profile;
  }
  return data;
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

export async function getProfileByUserId(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('获取用户资料失败Id:', error);
    notFound()
  }
  return data;
}

export async function getUserNFTs(page: number, pageSize: number, ownerId?: string): Promise<NFT[]> {
  let query = supabase
    .from('nfts')
    .select('*')

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

export async function getNFTById(id: string): Promise<NFT> {
  const { data, error } = await supabase
    .from('nfts')
    .select('*')
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


// export async function getGuest(email) {
//   const { data, error } = await supabase
//     .from("guests")
//     .select("*")
//     .eq("email", email)
//     .single();

//   // No error here! We handle the possibility of no guest in the sign in callback
//   return data;
// }