import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/app/_lib/supabase/server';

// 定义预期的请求体结构
interface RequestBody {
  walletAddress: string;
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  try {
    // 1. 从请求体获取钱包地址 (不再需要先验证 auth 用户)
    const body: RequestBody = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: '钱包地址是必需的' }, { status: 400 });
    }

    // 基本地址验证
    const cleanAddress = walletAddress.toLowerCase(); // 规范化地址
    if (!/^0x[a-f0-9]{40}$/.test(cleanAddress)) {
       return NextResponse.json({ error: '无效的钱包地址格式' }, { status: 400 });
    }

    // 2. 检查该钱包地址是否存在 profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('wallet_address', walletAddress) // 基于钱包地址查询
      .maybeSingle(); // 使用 maybeSingle 避免未找到时报错

    // 3. 如果 profile 存在, 返回它
    if (existingProfile) {
      console.log(`Profile found for address ${cleanAddress}:`, existingProfile.id);
      return NextResponse.json(existingProfile);
    } else {
      console.error('获取 profile 时出错:', fetchError);
      return NextResponse.json({ error: '获取 profile 失败' }, { status: 500 });
    }

  } catch (error) {
    console.error('处理 /api/user/profile 时发生意外错误:', error);
    return NextResponse.json({ error: '内部服务器错误' }, { status: 500 });
  }
}
