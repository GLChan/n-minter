import useSupabaseClient, { getSupabaseBrowserClient } from '@/app/_lib/supabase/client';
import { notFound } from "next/navigation";
import { Database, Tables } from "./types/database.types";

// export function getCurrentUserId() {
//   const supabase = useSupabaseClient();

//   const { data: user, error } = await supabase.auth.getUser();

//   if (user) {
//     return user.id;  // 返回当前用户的 ID
//   } else {
//     console.log('No user is logged in');
//     return null;  // 如果没有登录用户，返回 null
//   }
// }

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
    // .eq('user_id', '84597181-2ff5-4742-aeee-74be03bb1d71')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('获取用户资料失败Id:', error);
    notFound()
  }

  return data;
}

export async function getUserNFTs(page: number, pageSize: number, ownerId?: string): Promise<Tables<'nfts'>[]> {
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

export async function getNFTById(id: string): Promise<Tables<'nfts'>> {
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

// export async function getGuest(email) {
//   const { data, error } = await supabase
//     .from("guests")
//     .select("*")
//     .eq("email", email)
//     .single();

//   // No error here! We handle the possibility of no guest in the sign in callback
//   return data;
// }