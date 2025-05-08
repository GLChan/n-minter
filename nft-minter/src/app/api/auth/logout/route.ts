import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/app/_lib/session';

// 登出API路由处理函数
export async function POST(req: NextRequest) {
  try {
    // 获取会话 - 使用类型断言解决类型不匹配问题
    const cookieStore = cookies();
    // @ts-ignore - iron-session类型与Next.js App Router不完全兼容，但功能正常
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    // 清除会话
    session.siwe = undefined;
    session.issuedAt = undefined;
    session.expirationTime = undefined;
    await session.save(); // 保存更改

    return NextResponse.json({
      success: true,
      message: '用户已成功登出',
    });
  } catch (error) {
    console.error('登出失败:', error);
    return NextResponse.json(
      { error: '服务器错误', success: false },
      { status: 500 }
    );
  }
} 