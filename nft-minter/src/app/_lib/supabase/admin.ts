// src/app/_lib/supabase/admin.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/app/_lib/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdminInstance: SupabaseClient<Database> | null = null;

// 确保只在服务器端初始化
if (typeof window === 'undefined') {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn(
      "Supabase Admin Client: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY is missing. " +
      "The admin client will not be functional. Ensure these are set in your server environment."
    );
  } else {
    supabaseAdminInstance = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        // detectSessionInUrl: false, // 对 service role client 不重要
      },
    });
  }
} else {
  // 不应在客户端代码中导入此文件或尝试初始化 Admin Client
  console.warn("Supabase admin client is being referenced on the client-side. This should not happen.");
}

export const supabaseAdmin = supabaseAdminInstance;

// 辅助函数，在服务器端代码中使用前进行检查
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!supabaseAdmin) {
    throw new Error(
      "Supabase Admin Client is not initialized. " +
      "Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set for server-side operations."
    );
  }
  return supabaseAdmin;
}