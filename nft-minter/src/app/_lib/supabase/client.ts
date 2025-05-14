import { useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../types/database.types';

// 设置客户端cookie处理
const cookieOptions = {
  name: 'sb-session',
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 7, // 7天
};

// 为每个客户端创建一个新的Supabase实例
export function getSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // 启用客户端cookie处理
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return '';
          const cookies = document.cookie.split(';').map(c => c.trim());
          const cookie = cookies.find(c => c.startsWith(`${name}=`));
          return cookie ? cookie.split('=')[1] : '';
        },
        set(name: string, value: string, options: any) {
          if (typeof document === 'undefined') return;
          let cookie = `${name}=${value}`;
          if (options.maxAge) {
            cookie += `; Max-Age=${options.maxAge}`;
          }
          if (options.path) {
            cookie += `; Path=${options.path}`;
          }
          if (options.sameSite) {
            cookie += `; SameSite=${options.sameSite}`;
          }
          if (options.secure) {
            cookie += '; Secure';
          }
          document.cookie = cookie;
        },
        remove(name: string, options: any) {
          if (typeof document === 'undefined') return;
          // 设置过期的cookie来删除
          this.set(name, '', { ...options, maxAge: -1 });
        }
      }
    }
  );
}

// React钩子，保证在组件中复用同一个实例
function useSupabaseClient() {
  return useMemo(getSupabaseBrowserClient, []);
}

export default useSupabaseClient;