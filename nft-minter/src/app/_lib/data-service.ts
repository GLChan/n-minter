import { getSupabaseBrowserClient } from '@/app/_lib/supabase/client';
import { notFound } from "next/navigation";
import { Collection, NFT } from './types';

export async function getCurrentUserId() {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error('获取用户失败:', error);
    notFound()
  }

  return data;
}

export async function getProfileByWallet(walletAddress: string) {
  const supabase = getSupabaseBrowserClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    // .eq('user_id', '84597181-2ff5-4742-aeee-74be03bb1d71')
    .eq('wallet_address', walletAddress)
    .single();

  if (error) {
    console.error('获取用户资料失败Wallet:', error);
    notFound()
  }

  return data;
}

export async function getProfileByUserId(userId: string) {
  const supabase = getSupabaseBrowserClient();

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
  const supabase = getSupabaseBrowserClient();
  let query = supabase
    .from('nfts')
    .select('*')

  if (ownerId) {
    query = query.eq('owner_id', ownerId);
  }
  const from = page * pageSize;
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
  const supabase = getSupabaseBrowserClient();
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
  const supabase = getSupabaseBrowserClient();

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