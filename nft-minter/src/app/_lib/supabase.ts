
import { createServerClient, createBrowserClient, type CookieOptions } from '@supabase/ssr';
// 从 next/headers 导入 cookies 函数
import { cookies } from 'next/headers';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'; // 可以导入类型

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// 修正后的辅助函数，用于在服务器端（Server Components, Route Handlers, API Routes）创建 Supabase 客户端
export async function createSupabaseServerClient() {
  // 在函数内部调用 cookies() 获取当前的 cookie store
  const cookieStore: ReadonlyRequestCookies = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // 注意：这里使用的是 ANON key
    {
      cookies: {
        // getAll 方法：直接使用 next/headers 的 cookieStore.getAll()
        getAll() {
          return cookieStore.getAll();
        },

        // setAll 方法：遍历需要设置的 cookie 数组，并逐个调用 next/headers 的 cookieStore.set()
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // 注意：这里调用的是 cookieStore.set (单个设置)
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
            // 在服务器组件中设置 cookie 可能会失败（例如在静态生成期间），可以忽略此处的错误
            // 但如果你依赖中间件刷新会话，这通常是安全的。
            console.warn(`[Supabase Server Client] Failed to set cookies:`, error);
          }
        },

        // 注意：新的签名不再需要单独的 remove 方法，
        // 因为 remove 操作可以通过 set 一个空的 value 和过期的 maxAge 来实现，
        // @supabase/ssr 内部会处理好登出等操作的 cookie 清理。
      },
    }
  );
}

// 注意：这里不包含 Service Role Client 的创建，
// 因为它使用敏感密钥，应谨慎使用并放在更受保护的地方。
// 如果确实需要，可以单独创建并确保只在绝对安全的服务器端环境调用。 