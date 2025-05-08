import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { SiweMessage } from "siwe";
import { sessionOptions, SessionData } from "@/app/_lib/session";

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

      // 设置会话
      const cookieStore = cookies();
      // @ts-ignore - iron-session类型与Next.js App Router不完全兼容，但功能正常
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

      // 返回成功响应
      const successResponse = NextResponse.json({
        success: true,
        message: "验证成功，用户已认证",
        wallet: validatedMessage.address,
      });

      return successResponse;
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