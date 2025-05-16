import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/app/_lib/types/database.types';
import { generateWalletP } from './utils';

/**
 * 在SIWE认证成功后，将用户同步到Supabase的认证系统
 * 这样客户端调用supabase.auth.getSession()就能获取到会话
 */
export async function syncSiweToSupabaseAuth(
  supabaseAdmin: SupabaseClient<Database>,
  walletAddress: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ success: boolean; session?: any; error?: any }> {
  try {
    // 查询是否已有该钱包地址的用户
    const { data: existingUsers, error: queryError } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('wallet_address', walletAddress)
      .limit(1);

    if (queryError) {
      console.error('查询用户时出错:', queryError);
      return { success: false, error: queryError };
    }

    let userId = existingUsers?.[0]?.user_id;

    const pwd = generateWalletP(walletAddress)

    console.log('userId - pwd', userId, pwd)

    // 如果没有找到用户，创建一个新的Supabase用户
    if (!userId) {
      // 为钱包地址生成一个唯一的邮箱格式
      const email = `${walletAddress.toLowerCase()}@ethereum.wallet`;

      // 创建新用户
      const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: pwd, // 随机密码
        email_confirm: true, // 自动确认邮箱
        user_metadata: {
          wallet_address: walletAddress,
        }
      });

      if (createError || !authData.user) {
        console.error('创建用户失败:', createError);
        return { success: false, error: createError };
      }

      userId = authData.user.id;

      // 创建用户资料
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userId,
          wallet_address: walletAddress,
          username: `user_${walletAddress.substring(2, 8)}`, // 生成临时用户名
        });

      if (profileError) {
        console.error('创建用户资料失败:', profileError);
        return { success: false, error: profileError };
      }
    }

    // 使用Supabase API签发会话令牌
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.signInWithPassword({
      email: `${walletAddress.toLowerCase()}@ethereum.wallet`,
      password: pwd
    });

    if (sessionError) {
      console.error('创建会话失败:', sessionError);
      return { success: false, error: sessionError };
    }

    return {
      success: true,
      session: sessionData,
    };

  } catch (error) {
    console.error('同步SIWE到Supabase认证时出错:', error);
    return { success: false, error };
  }
}
