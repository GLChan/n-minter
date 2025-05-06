import { NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { createSupabaseServerClient } from '@/app/_lib/supabase';
import type { Database } from '@/app/_lib/database.types.ts';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Ensure Supabase URL and Service Role Key are set in environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing Supabase URL or Service Role Key environment variables.");
  // Optionally throw an error during build/startup if preferred
}

// 为 Supabase Admin Client 单独创建一个实例
// 注意：此 Admin Client 只能在安全的服务器环境中使用
let supabaseAdmin: SupabaseClient<Database>;
if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
} else {
  // 如果环境变量没有正确加载，后续依赖 supabaseAdmin 的操作会失败
  // 这里可以进行错误处理或记录
  console.error("Supabase Admin Client 未能初始化，缺少环境变量。");
}


// Interface for the expected request body
interface VerifyRequest {
  message: string;        // SIWE消息字符串
  signature: `0x${string}`; // 以太坊签名
}

export async function POST(request: Request) {
  // 如果 Admin Client 未初始化，则无法继续
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "服务器配置错误，无法处理请求。" }, { status: 500 });
  }

  let nonce: string | undefined;
  try {
    // 获取请求体
    const { message, signature }: VerifyRequest = await request.json();

    // 创建Supabase客户端
    const supabase = await createSupabaseServerClient();

    // 获取存储在cookie中的nonce
    // 直接从请求头中获取cookie字符串
    const cookieHeader = request.headers.get('cookie') || '';
    nonce = getCookieValue(cookieHeader, 'siwe-nonce');


    if (!nonce) {
      return NextResponse.json({ error: "无效的nonce，请重新获取或确保cookie被正确发送" }, { status: 400 });
    }

    // 解析并验证SIWE消息
    const siweMessage = new SiweMessage(message);
    try {
      const verificationResult = await siweMessage.verify({
        signature,
        nonce: nonce,  // 使用从cookie中获取的nonce
      });

      // 清除nonce cookie，确保不会被重用
      const response = NextResponse.json({ success: false });
      response.cookies.delete("siwe-nonce");

      // 如果验证失败
      if (!verificationResult.success) {
        console.error("SIWE验证失败:", verificationResult.error);
        const errorResponse = NextResponse.json(
          { error: "签名验证失败", details: verificationResult.error?.type },
          { status: 401 }
        );
        errorResponse.cookies.set('siwe-nonce', '', { path: '/', maxAge: -1 });
        return errorResponse;
      }

      // SIWE 验证成功，清理 nonce cookie 将在最终响应中完成
      // 提取钱包地址和链ID
      const walletAddress = verificationResult.data.address.toLowerCase();
      const chainId = verificationResult.data.chainId;
      console.log(`地址 ${walletAddress} 在链 ${chainId} 上成功验证SIWE`);

      // 检查用户是否已存在

      let userIdToAuth: string | null = null;
      let responseMessage: string;
      let isNewSupabaseUser = false;
      let newSessionTokens: { access_token: string; refresh_token: string; expires_in: number } | null = null;

      const { data: { user: existingUser } } = await supabase.auth.getUser();

      // 如果用户不存在，创建新用户
      if (!existingUser) {
        console.log("SIWE: 未检测到活跃的 Supabase 会话。尝试通过钱包登录或注册。");
        // 没有活跃会话，根据钱包地址查找或创建用户
        const { data: existingProfileByWallet, error: profileQueryError } = await supabaseAdmin
          .from('profiles')
          .select('user_id')
          .eq('wallet_address', walletAddress)
          .single();

        if (profileQueryError && profileQueryError.code !== 'PGRST116') {
          console.error("通过钱包地址查询 Profile 时出错:", profileQueryError);
          throw new Error("查询钱包关联的 Profile 时数据库出错");
        }

        if (existingProfileByWallet) {
          userIdToAuth = existingProfileByWallet.user_id;
          responseMessage = "通过钱包成功登录。";
          console.log(`用户 ${userIdToAuth} 已存在 (钱包: ${walletAddress}). 正在登录.`);
          // TODO: 为此 userIdToAuth 生成并返回会话令牌 (access_token, refresh_token)
          // 这是一个关键步骤，以便客户端可以调用 supabase.auth.setSession()
          // 例如: const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token: stored_refresh_token_for_user }); (如果可以获取)
          // 或: const { data, error } = await supabaseAdmin.auth.admin.MAGIC_LINK_OR_EQUIVALENT_FOR_SESSION(userIdToAuth);
          // 目前 Supabase Admin API 没有直接为此生成令牌的方法，您可能需要自定义JWT或研究其他策略

        } else {

          isNewSupabaseUser = true;
          console.log("SIWE: 未检测到活跃的 Supabase 会话。尝试通过钱包登录或注册。");

          // 使用一个特定的、可识别的域名后缀，而不是 example.com
          const placeholderEmail = `${walletAddress}@wallet.yourapp.com`; // <--- 替换 "yourapp.com" 为您的实际域名或一个内部标识

          const { data: newAuthUserData, error: creationError } = await supabaseAdmin.auth.admin.createUser({
            email: placeholderEmail,
            password: crypto.randomUUID(), // 用户不会使用此密码
            email_confirm: true, // 将邮箱标记为已确认，避免发送邮件到占位符地址
            user_metadata: {
              wallet_address: walletAddress,
              chain_id: chainId,
              // 初始可以不设置 username，或设置一个默认值
              username: `user_${walletAddress.substring(2, 8)}`,
            },
          });

          if (creationError) {
            console.error("Supabase Admin API 创建用户失败:", creationError);
            throw new Error(`创建用户失败: ${creationError.message}`);
          }
          userIdToAuth = newAuthUserData.user.id;

          // 创建用户资料
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              user_id: userIdToAuth,
              wallet_address: walletAddress,
              username: `user_${walletAddress.substring(2, 8)}`,
            });

          if (profileError) {
            console.error("创建用户资料失败:", profileError);
            // 继续，因为用户已创建，资料可以稍后更新
          }

          console.log(`新 Supabase 用户 ${userIdToAuth} 已为钱包 ${walletAddress} 创建。`);
          // TODO: 为新创建的 userIdToAuth 生成并返回会话令牌

        }
      } else {
        console.log(`用户已存在，ID: ${existingUser.id}`);

        console.log(`SIWE: 检测到活跃的 Supabase 会话，用户 ID: ${existingUser.id}. 尝试关联钱包.`);
        userIdToAuth = existingUser.id;
        responseMessage = "钱包已成功关联到您当前的会话。";

        // 检查数据库中是否已有此钱包地址的资料
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("wallet_address", walletAddress)
          .single();

        // 如果没有资料，创建一个
        if (!existingProfile) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              user_id: existingUser.id,
              wallet_address: walletAddress,
              username: `user_${walletAddress.substring(2, 8)}`,
            });

          if (profileError) {
            console.error("创建用户资料失败:", profileError);
            // 继续，因为用户已验证，资料可以稍后更新
          }
        }

        // 更新用户元数据，添加钱包地址
        await supabase.auth.updateUser({
          data: {
            wallet_address: walletAddress,
            chain_id: chainId,
          },
        });
      }

      // 创建成功响应并设置成功标志
      const successResponse = NextResponse.json({
        success: true,
        message: "验证成功，用户已认证",
        wallet: walletAddress,
      });

      return successResponse;
    } catch (verifyError: any) {
      console.error("SIWE消息验证错误:", verifyError);
      return NextResponse.json({ error: `SIWE验证失败: ${verifyError.message}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error("SIWE验证过程中出错:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "请求体格式不正确" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "验证过程中发生错误", details: error.message },
      { status: 500 }
    );
  }
}

// 辅助函数：从cookie字符串中获取特定cookie的值
function getCookieValue(cookieString: string, name: string): string | undefined {
  const match = cookieString.match(new RegExp('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)'));
  return match ? match[2] : undefined;
} 