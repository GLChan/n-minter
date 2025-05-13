import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { SiweMessage } from "siwe";
import { sessionOptions, SessionData } from "@/app/_lib/session";
import { getSupabaseAdmin } from "@/app/_lib/supabase/admin";
import { syncSiweToSupabaseAuth } from "@/app/_lib/siwe-to-supabase-auth";

// SIWE验证API处理函数
export async function POST(req: NextRequest) {
  try {
    const { message, signature } = await req.json();

    if (!message || !signature) {
      return NextResponse.json(
        { success: false, error: "缺少消息或签名" },
        { status: 400 }
      );
    }

    // 验证SIWE签名
    const siweMessage = new SiweMessage(message);
    try {
      const { data: validatedMessage } = await siweMessage.verify({
        signature,
      });

      // 设置SIWE会话
      const cookieStore = await cookies();
      const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

      // 设置7天的过期时间
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7);

      // 保存用户信息到会话
      session.siwe = {
        address: validatedMessage.address
      };
      session.issuedAt = new Date().toISOString();
      session.expirationTime = expirationDate.toISOString();

      // 保存会话
      await session.save();

      // 获取管理员客户端
      const supabaseAdmin = getSupabaseAdmin();

      // 将SIWE认证同步到Supabase Auth
      const { success: syncSuccess, session: supabaseSession, error: syncError } =
        await syncSiweToSupabaseAuth(supabaseAdmin, validatedMessage.address);

      if (!syncSuccess || syncError) {
        console.warn('同步SIWE到Supabase认证失败，但SIWE认证本身成功:', syncError);
      } else {
        console.log('成功同步SIWE到Supabase认证:', supabaseSession);

        // 创建响应对象
        const successResponse = NextResponse.json({
          success: true,
          message: "验证成功，用户已认证",
          data: {
            wallet: validatedMessage.address,
            access_token: supabaseSession?.session?.access_token,
            refresh_token: supabaseSession?.session?.refresh_token,
          }
        });

        // // 设置Supabase会话cookie
        // if (supabaseSession?.session?.access_token) {
        //   // 设置访问令牌
        //   successResponse.cookies.set('sb-access-token', supabaseSession.session.access_token, {
        //     maxAge: 60 * 60 * 24 * 7, // 7天
        //     path: '/',
        //     sameSite: 'lax',
        //     secure: process.env.NODE_ENV === 'production',
        //     httpOnly: false,
        //   });

        //   // 设置刷新令牌
        //   successResponse.cookies.set('sb-refresh-token', supabaseSession.session.refresh_token, {
        //     maxAge: 60 * 60 * 24 * 7, // 7天
        //     path: '/',
        //     sameSite: 'lax',
        //     secure: process.env.NODE_ENV === 'production',
        //     httpOnly: true,
        //   });
        // }

        return successResponse;
      }

      // 如果Supabase同步失败，仍返回SIWE认证成功的响应
      return NextResponse.json({
        success: true,
        message: "验证成功，用户已认证",
        wallet: validatedMessage.address,
      });
    } catch (error) {
      console.error("SIWE验证错误:", error);
      return NextResponse.json(
        { success: false, error: "签名验证失败" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("处理请求错误:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}