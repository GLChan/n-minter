import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/app/_lib/session';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/app/_lib/database.types';

// 提供请求处理函数
export async function GET(request: NextRequest) {
  // 获取URL中的分页参数
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  
  // 验证参数
  const validPage = page > 0 ? page : 1;
  const validLimit = limit > 0 && limit <= 100 ? limit : 10;
  
  try {
    // 获取会话验证用户身份
    const cookieStore = cookies();
    // @ts-ignore - iron-session类型与Next.js App Router不完全兼容
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    
    if (!session.siwe || !session.siwe.address) {
      return NextResponse.json({ error: '用户未认证' }, { status: 401 });
    }
    
    // 使用会话中的钱包地址
    const ownerAddress = session.siwe.address;
    
    // 创建Supabase客户端
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    // 计算分页查询范围
    const from = (validPage - 1) * validLimit;
    const to = from + validLimit - 1;
    
    // 查询符合条件的NFT总数
    const { count, error: countError } = await supabase
      .from('nfts')
      .select('*', { count: 'exact', head: true })
      .eq('owner_address', ownerAddress);
      
    if (countError) {
      console.error('获取NFT总数失败:', countError);
      return NextResponse.json({ error: '获取NFT列表失败', details: countError.message }, { status: 500 });
    }
    
    // 查询分页NFT数据
    const { data: nfts, error: nftError } = await supabase
      .from('nfts')
      .select('*')
      .eq('owner_address', ownerAddress)
      .order('created_at', { ascending: false })
      .range(from, to);
      
    if (nftError) {
      console.error('获取NFT列表失败:', nftError);
      return NextResponse.json({ error: '获取NFT列表失败', details: nftError.message }, { status: 500 });
    }
    
    // 计算总页数
    const total = count || 0;
    const totalPages = Math.ceil(total / validLimit);
    
    // 返回分页数据
    return NextResponse.json({
      data: nfts,
      page: validPage,
      limit: validLimit,
      total,
      totalPages
    }, { status: 200 });
  
  } catch (error: any) {
    console.error('获取NFT列表时出错:', error);
    return NextResponse.json(
      { 
        error: '获取NFT列表时发生意外错误', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
} 