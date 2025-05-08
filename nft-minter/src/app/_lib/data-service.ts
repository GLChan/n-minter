import useSupabaseClient from '@/app/_lib/supabase/client';
import { notFound } from "next/navigation";

export async function getUserProfile(walletAddress: String) {
  const supabase = useSupabaseClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    // .eq('user_id', '84597181-2ff5-4742-aeee-74be03bb1d71')
    .eq('wallet_address', walletAddress)
    .single();

  if (error) {
    console.error('获取用户资料失败:', error);
    notFound()
  }

  return data;
}