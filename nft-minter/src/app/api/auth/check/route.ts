import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/app/_lib/session';

// 检查认证状态的API路由处理函数
export async function GET(req: NextRequest) {
  try {
    // 获取会话 - 使用类型断言解决类型不匹配问题
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    // 检查会话中是否有SIWE信息
    if (!session.siwe || !session.siwe.address) {
      return NextResponse.json({
        authenticated: false,
        message: '用户未认证',
      });
    }

    // 检查会话是否过期 (如果存储了过期时间)
    if (session.expirationTime) {
      const now = new Date();
      const expiry = new Date(session.expirationTime);
      
      if (now > expiry) {
        return NextResponse.json({
          authenticated: false,
          message: '会话已过期',
        });
      }
    }

    // 返回认证成功和用户信息
    return NextResponse.json({
      authenticated: true,
      wallet: session.siwe.address,
      message: '用户已认证',
    });
  } catch (error) {
    console.error('认证检查失败:', error);
    return NextResponse.json(
      { error: '服务器错误', authenticated: false },
      { status: 500 }
    );
  }
} 