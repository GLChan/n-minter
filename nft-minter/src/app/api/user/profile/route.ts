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
      .eq('wallet_address', cleanAddress) // 基于钱包地址查询
      .maybeSingle(); // 使用 maybeSingle 避免未找到时报错

    if (fetchError) {
      console.error('获取 profile 时出错:', fetchError);
      return NextResponse.json({ error: '获取 profile 失败' }, { status: 500 });
    }

    // 3. 如果 profile 存在, 返回它
    if (existingProfile) {
      console.log(`Profile found for address ${cleanAddress}:`, existingProfile.id);
      return NextResponse.json(existingProfile);
    }

    // 4. 如果 profile 不存在, 创建它
    console.log(`Profile not found for address ${cleanAddress}. Creating...`);
    // 基于地址生成默认用户名
    const defaultUsername = `user_${cleanAddress.substring(2, 8)}`;

    // 注意：这里使用具有 ANON_KEY 的客户端插入。
    // 确保 'profiles' 表的 INSERT RLS 策略允许（或者暂时没有 INSERT 策略）。
    // 如果需要关联 auth_user_id，则需要在此之前或之后进行用户认证和更新。
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        // id 会自动生成 (uuid_generate_v4())
        wallet_address: cleanAddress,
        username: defaultUsername, // 设置默认用户名
        // auth_user_id: null,      // 初始状态下不关联 Supabase Auth 用户
        // 如果需要, 添加其他默认字段 (bio, avatar_url 等)
      })
      .select() // 返回新创建的记录
      .single();

    if (insertError) {
      console.error('创建 profile 时出错:', insertError);
       // 检查唯一约束冲突 (理论上不应发生，因为我们先查询了)
       if (insertError.code === '23505') {
         return NextResponse.json({ error: '钱包地址已存在冲突。' }, { status: 409 });
       }
      return NextResponse.json({ error: '创建 profile 失败' }, { status: 500 });
    }

    console.log(`Profile created successfully for address ${cleanAddress}:`, newProfile.id);
    return NextResponse.json(newProfile);

  } catch (error) {
    console.error('处理 /api/user/profile 时发生意外错误:', error);
    return NextResponse.json({ error: '内部服务器错误' }, { status: 500 });
  }
}
