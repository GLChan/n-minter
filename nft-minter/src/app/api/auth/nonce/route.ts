import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { randomBytes } from 'crypto';
import { sessionOptions } from '@/app/_lib/session';

// 生成随机nonce
function generateNonce(): string {
  return randomBytes(32).toString('hex');
}

// nonce会话类型
interface NonceSession {
  nonce?: string;
}

// 获取nonce的API路由处理函数
export async function GET() {
  try {
    // 生成新的nonce
    const nonce = generateNonce();
    
    // 将nonce存储在会话中 (可选，但增加安全性)
    const cookieStore = await cookies();
    const session = await getIronSession<NonceSession>(cookieStore, sessionOptions);
    session.nonce = nonce;
    await session.save();
    
    // 返回nonce给客户端用于SIWE消息创建
    return NextResponse.json({ nonce });
  } catch (error) {
    console.error('生成nonce失败:', error);
    return NextResponse.json(
      { error: '服务器错误，无法生成nonce' },
      { status: 500 }
    );
  }
} 