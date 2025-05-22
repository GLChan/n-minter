"use server";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { Attribute, AttributeKeyValue, Collection, NFT, NFTAttribute, NFTDetail, NFTInfo, Transaction, UserProfile } from './types';

export async function getUserInfo() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user) throw new Error("You must be logged in");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (error) {
    console.error('获取用户信息时出错:', error);
    redirect('/');
  }

  return data;
}

export async function getFeaturedNFT() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("featured_nft_banners")
    .select("*, nfts!nft_id(*, profiles!owner_id(*))")
    .single()

  if (error) throw new Error("Featured NFT could not be retrieved");

  return data;
}

// Top Today
export async function getTopTodayNFTs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("nfts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  // Score = (w1 * 24h_交易额) + (w2 * 24h_独立买家数) + (w3 * 24h_地板价涨幅) + ...
  if (error) throw new Error("Top Today NFTs could not be retrieved");

  return data;
}

export async function getCollectionsByUserId(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw new Error("Collections could not be retrieved");
  return data;
}


export async function saveNFT(nft: Partial<NFT>): Promise<NFT> {
  const supabase = await createClient();
  const { data: nftData, error: insertError } = await supabase
    .from('nfts')
    .insert(nft as NFT) // 只包含要插入的字段
    .select()
    .single();

  if (insertError) {
    console.error('Error inserting NFT data:', insertError);
    throw new Error(`Failed to insert NFT: ${insertError.message}`); // 抛出包含错误信息的 Error
  }
  return nftData;
}

/**
 * 插入 NFT 属性。
 * @param nftId - NFT 的 ID.
 * @param attributes - 包含属性键值对的对象.
 */
export async function saveNFTAttributes(nftId: string, attributes: AttributeKeyValue[]): Promise<void> {
  const supabase = await createClient();
  // 步骤 0: 将输入的属性对象数组合并为一个单一的 Record<string, string>
  // 如果不同对象中有相同的键，后出现的会覆盖先出现的。
  // const consolidatedAttributes: Record<string, string> = {};
  const attributeNames: string[] = []
  for (const attributeObject of attributes) {
    // { key: '大小', value: '中等' }
    attributeNames.push(attributeObject.key)
  }

  // 获取属性名称
  // const attributeNames = Object.keys(consolidatedAttributes);

  if (attributeNames.length === 0) {
    console.log('没有提供需要保存的属性。');
    return;
  }

  console.log('合并后的待处理属性:', attributeNames);

  // 步骤 1: 从 'attributes' 表中获取已存在的属性
  const { data: existingDbAttributes, error: selectError } = await supabase
    .from('attributes')
    .select('id, name')
    .in('name', attributeNames);

  if (selectError) {
    console.error('获取已存在属性时出错:', selectError);
    throw new Error(`获取已存在属性失败: ${selectError.message}`);
  }

  const attributeMap = new Map<string, number>();
  (existingDbAttributes || []).forEach(attr => {
    attributeMap.set(attr.name, attr.id);
  });
  console.log(`在数据库中找到 ${attributeMap.size} 个已存在的属性。`);

  // 步骤 2: 识别需要创建的新属性名称
  const newAttributeNamesToCreate = attributeNames.filter(name => !attributeMap.has(name));

  // 步骤 3: 如果有新属性，则批量插入
  if (newAttributeNamesToCreate.length > 0) {
    console.log('需要创建的新属性:', newAttributeNamesToCreate);
    const newAttributesToInsert = newAttributeNamesToCreate.map(name => ({ name }));

    const { data: insertedAttributes, error: insertError } = await supabase
      .from('attributes')
      .insert(newAttributesToInsert)
      .select('id, name');

    if (insertError) {
      console.error('插入新属性时出错:', insertError);
      throw new Error(`插入新属性失败: ${insertError.message}`);
    }

    (insertedAttributes || []).forEach(attr => {
      attributeMap.set(attr.name, attr.id);
    });
    console.log(`成功插入 ${insertedAttributes?.length || 0} 个新属性。`);
  }

  // 步骤 4: 准备 'nft_attributes' 以进行批量插入
  const nftAttributesToInsert: Omit<NFTAttribute, 'id' | 'created_at' | 'updated_at'>[] = [];

  const { data: nft, error: nftError } = await supabase
    .from('nfts')
    .select('creator_id')
    .eq('id', nftId)
    .single();

  // 遍历属性名称, 获取属性值
  for (const name of attributeNames) {

    const attribute = attributes.find(attr => attr.key === name);
    const value = attribute?.value; // 值已经是字符串
    const attributeId = attributeMap.get(name);

    if (attributeId === undefined) {
      console.error(`严重错误: 处理后未找到属性 "${name}" 的 ID。这表明存在逻辑缺陷。`);
      throw new Error(`未能解析属性 "${name}" 的 ID`);
    }

    const nftAttribute: Omit<NFTAttribute, 'id' | 'created_at' | 'updated_at'> = {
      nft_id: nftId,
      attribute_id: attributeId,
      attribute_name: name,
      value: value || '', // value 已经是字符串，无需 String(value)
      user_id: nft?.creator_id || '',
    };
    nftAttributesToInsert.push(nftAttribute);
  }

  // 步骤 5: 批量插入 'nft_attributes'
  if (nftAttributesToInsert.length > 0) {
    console.log(`准备插入 ${nftAttributesToInsert.length} 条 nft_attributes。`);
    const { error: nftAttrInsertError } = await supabase
      .from('nft_attributes')
      .insert(nftAttributesToInsert as any[]);

    if (nftAttrInsertError) {
      console.error('插入 nft_attributes 时出错:', nftAttrInsertError);
      throw new Error(`为 NFT ID ${nftId} 插入 nft_attributes 失败: ${nftAttrInsertError.message}`);
    }
    console.log(`成功为 NFT ID: ${nftId} 插入 ${nftAttributesToInsert.length} 条 nft_attributes。`);
  } else {
    console.log('没有 NFT 属性需要为 NFT ID 插入:', nftId);
  }
}

/**
 * 保存交易数据
 * @param nftId - NFT 的 ID.
 * @param transactionHash - 交易哈希.
 */
export async function saveTransaction(transaction: Partial<Transaction>) {
  const supabase = await createClient();
  const { data: transactionData, error: transactionError } = await supabase
    .from('transactions')
    .insert({
      ...transaction
    })
    .select()
    .single();

  if (transactionError) {
    console.error('保存交易数据时出错:', transactionError);
    throw new Error(`保存交易数据失败: ${transactionError.message}`);
  }
  return transactionData;
}


/**
 * 检查用户是否已收藏指定NFT
 * @param userId 用户ID
 * @param nftId NFT ID
 * @returns 布尔值，表示是否已收藏
 */
export async function isNFTFavorited(userId: string, nftId: string): Promise<boolean> {
  const supabase = await createClient();

  if (!userId || !nftId) return false;
  
  const { data, error } = await supabase
    .from('user_collections')
    .select('id')
    .eq('user_id', userId)
    .eq('nft_id', nftId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116是未找到记录的错误代码
    console.error('检查NFT收藏状态失败:', error);
  }
  
  return !!data; // 如果data存在，表示已收藏
}

/**
 * 添加NFT到用户收藏
 * @param userId 用户ID
 * @param nftId NFT ID
 * @returns 添加的收藏记录
 */
export async function addNFTToFavorites(userId: string, nftId: string) {
  const supabase = await createClient();

  if (!userId || !nftId) {
    throw new Error('用户ID和NFT ID不能为空');
  }
  
  // 先检查是否已收藏，避免重复添加
  const alreadyFavorited = await isNFTFavorited(userId, nftId);
  if (alreadyFavorited) {
    return { success: true, message: 'NFT已在收藏中' };
  }
  
  const { data, error } = await supabase
    .from('user_collections')
    .insert({
      user_id: userId,
      nft_id: nftId
    })
    .select();
    
  if (error) {
    console.error('添加NFT到收藏失败:', error);
    throw new Error('添加NFT到收藏失败');
  }
  
  return { success: true, data };
}

/**
 * 从用户收藏中移除NFT
 * @param userId 用户ID
 * @param nftId NFT ID
 * @returns 操作结果
 */
export async function removeNFTFromFavorites(userId: string, nftId: string) {
  const supabase = await createClient();

  if (!userId || !nftId) {
    throw new Error('用户ID和NFT ID不能为空');
  }
  
  const { error } = await supabase
    .from('user_collections')
    .delete()
    .eq('user_id', userId)
    .eq('nft_id', nftId);
    
  if (error) {
    console.error('从收藏中移除NFT失败:', error);
    throw new Error('从收藏中移除NFT失败');
  }
  
  return { success: true };
}

/**
 * 获取用户收藏的NFT列表
 * @param userId 用户ID
 * @returns 收藏的NFT列表
 */
export async function getUserFavoriteNFTs(userId: string): Promise<NFTInfo[]> {
  const supabase = await createClient();

  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('user_collections')
    .select('nft_id, nfts!nft_id(*, collection:collections(*), profile:profiles!owner_id(*))')
    .eq('user_id', userId);
    
  if (error) {
    console.error('获取用户收藏NFT失败:', error);
    return [];
  }
  
  if (!data || data.length === 0) {
    return [];
  }
  
  // 获取所有收藏NFT的ID
  const nftIds = data.map(item => item.nft_id);
  
  // 查询这些NFT的详细信息
  const { data: nfts, error: nftsError } = await supabase
    .from('nfts')
    .select('*, collection:collections(*), profile:profiles!owner_id(*)')
    .in('id', nftIds);
    
  if (nftsError) {
    console.error('获取收藏NFT详情失败:', nftsError);
    return [];
  }
  
  return nfts || [];
}