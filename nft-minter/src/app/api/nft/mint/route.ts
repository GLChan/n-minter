import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/app/_lib/supabase';

// 定义预期的请求体结构
interface RequestBody {
  name: string;
  description?: string;
  imageUrl: string; // 假设图片已上传并提供了 URL
  attributes?: Record<string, string>[]; // 例如: [{ trait_type: 'Color', value: 'Blue' }]
  collectionId?: string; // 可选的合集 UUID
}

export async function POST(request: Request) {

  const supabase = await createSupabaseServerClient();

  try {
    // 1. 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 2. 从请求体获取 NFT 数据
    const body: RequestBody = await request.json();
    const { name, description, imageUrl, attributes, collectionId } = body;

    // 3. 验证必需字段
    if (!name || !imageUrl) {
      return NextResponse.json({ error: '名称和图片 URL 是必需的' }, { status: 400 });
    }

    // --- 实际铸造准备的占位符 ---
    // 真实场景中:
    // - 如果发送的是图片数据而非 URL, 可能需要处理文件上传。
    // - 构建最终的元数据 JSON (包含属性)。
    // - 将元数据 JSON 上传到 IPFS 或 Supabase Storage 以获取 metadataUrl。
    // - 目前, 我们仅存储提供的数据。

    const nftMetadata = {
        name: name,
        description: description || null,
        image: imageUrl,
        attributes: attributes || [],
        // 根据你的标准添加其他字段
    };

    // 4. 插入到 'nfts' 表 (作为待处理记录, 暂无 token_id/contract)
    //    之后需要一个单独的机制 (webhook, 交易后的前端回调)
    //    来更新此记录的区块链详情。
    const { data: newNftRecord, error: insertError } = await supabase
      .from('nfts')
      .insert({
        creator_id: user.id, // 关联到已认证的创建者
        owner_id: user.id,   // 初始状态下, 创建者即所有者
        name: name,
        description: description,
        image_url: imageUrl,
        // metadata_url: metadataUrl, // <-- 在此存储实际的元数据 URL
        metadata: nftMetadata, // 存储构建好的元数据 JSON
        // collection_id: collectionId, // TODO: 如果需要, 在 nfts 表 schema 中添加 collection_id
        // status: 'pending_mint', // TODO: 在 nfts 表中添加 status 列
        // chain_id, contract_address, token_id 初始为 null
      })
      .select() // 返回创建的记录
      .single();

    if (insertError) {
      console.error('插入待处理 NFT 时出错:', insertError);
      return NextResponse.json({ error: '准备 NFT 铸造失败' }, { status: 500 });
    }

    // 5. 返回成功响应 (例如, 待处理记录的 ID 或元数据 URL)
    return NextResponse.json({
        message: 'NFT 铸造流程已启动。',
        nftData: newNftRecord // 返回创建的数据库记录 ID
        // metadataUrl: metadataUrl // 返回元数据 URL 供前端调用合约使用
    });

  } catch (error) {
    console.error('处理 /api/nft/mint 时发生意外错误:', error);
    return NextResponse.json({ error: '内部服务器错误' }, { status: 500 });
  }
} 