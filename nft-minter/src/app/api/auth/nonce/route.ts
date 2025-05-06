import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateNonce } from 'siwe';

// 生成用于SIWE流程的随机一次性nonce
export async function GET() {
  try {
    const nonce = generateNonce();
    
    // 将nonce存储在HTTP-only cookie中，以便在验证时获取
    const response = NextResponse.json({ nonce });
    
    // 设置cookie，注意这里不会有类型问题，因为不是在异步代码内调用
    response.cookies.set("siwe-nonce", nonce, {
      httpOnly: true,  // 仅http访问，不允许JavaScript访问
      secure: process.env.NODE_ENV === "production", // 生产环境中只在https连接上发送
      maxAge: 60 * 5,  // 5分钟有效期
      path: "/",       // 整个站点可用
      sameSite: "strict", // 防止CSRF
    });
    
    console.log(`生成的nonce: ${nonce}`);
    return response;
  } catch (error) {
    console.error("生成nonce失败:", error);
    return NextResponse.json({ error: "无法生成nonce" }, { status: 500 });
  }
} 