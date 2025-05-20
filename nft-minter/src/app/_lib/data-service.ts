import { createClient } from '@/app/_lib/supabase/client';
import { notFound } from "next/navigation";
import { Attribute, AttributeKeyValue, Collection, NFT, NFTAttribute, NFTDetail, NFTInfo, UserProfile } from './types';

const supabase = createClient();

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('获取用户失败:', error);
    notFound()
  }
  return user;
}

export async function getUserProfile(): Promise<UserProfile> {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('获取用户资料失败:', error);
    notFound()
  }
  const profile = await getProfileByUserId(data.user.id)
  return profile;
}

export async function getProfileByWallet(walletAddress: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();

  if (error) {
    console.error('获取用户资料失败Wallet:', error);
    notFound()
  }

  return data;
}


export async function createGuest(profile: Partial<UserProfile>) {
  const { data, error } = await supabase.from("profiles").insert(profile as UserProfile);

  if (error) {
    console.error(error);
    throw new Error("Profiles could not be created");
  }

  return data;
}


export async function getProfileByUserId(userId: string): Promise<UserProfile> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('获取用户资料失败Id:', error);
    notFound()
  }
  return profile;
}

export async function getUserNFTs(page: number, pageSize: number, ownerId?: string): Promise<NFTInfo[]> {
  let query = supabase
    .from('nfts')
    .select('*, collection:collections(*), profile:profiles!owner_id(*)')

  if (ownerId) {
    query = query.eq('owner_id', ownerId);
  }
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query.order('created_at', { ascending: false })
    .range(from, to);

  const { data, error } = await query

  if (error) {
    console.error('获取用户NFT失败:', error);
    notFound()
  }

  return data || [];
};

export async function getNFTById(id: string): Promise<NFTDetail> {
  const { data, error } = await supabase
    .from('nfts')
    .select('*, collection:collections(*), owner:profiles!owner_id(*), creator:profiles!creator_id(*)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('获取NFT失败:', error);
    notFound()
  }

  return data
}

export async function getCollectionByUserId(userId: string): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('id', userId);

  if (error) {
    console.error('获取用户合集失败:', error);
    notFound()
  }

  return data;
}

export async function saveNFT(nft: Partial<NFT>): Promise<NFT> {
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

  const supabase = createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('获取用户失败:', error);
    notFound()
  }
  

  // 步骤 0: 将输入的属性对象数组合并为一个单一的 Record<string, string>
  // 如果不同对象中有相同的键，后出现的会覆盖先出现的。
  const consolidatedAttributes: Record<string, string> = {};
  for (const attributeObject of attributes) {
    for (const key in attributeObject) {
      // 确保只处理对象自身的属性，而不是原型链上的属性
      if (Object.prototype.hasOwnProperty.call(attributeObject, key)) {
        consolidatedAttributes[key] = attributeObject[key]; // 值已经是字符串
      }
    }
  }

  const attributeNames = Object.keys(consolidatedAttributes);

  if (attributeNames.length === 0) {
    console.log('没有提供需要保存的属性。');
    return;
  }

  console.log('合并后的待处理属性:', consolidatedAttributes);

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

  // 注意：这里我们遍历 consolidatedAttributes 的键 (attributeNames)
  // 或者直接遍历 consolidatedAttributes 的条目
  for (const name in consolidatedAttributes) {
    if (Object.prototype.hasOwnProperty.call(consolidatedAttributes, name)) {
      const value = consolidatedAttributes[name]; // 值已经是字符串
      const attributeId = attributeMap.get(name);

      if (attributeId === undefined) {
        console.error(`严重错误: 处理后未找到属性 "${name}" 的 ID。这表明存在逻辑缺陷。`);
        throw new Error(`未能解析属性 "${name}" 的 ID`);
      }

      const nftAttribute: Omit<NFTAttribute, 'id' | 'created_at' | 'updated_at'> = {
        nft_id: nftId,
        attribute_id: attributeId,
        attribute_name: name,
        value: value, // value 已经是字符串，无需 String(value)
        user_id: nft?.creator_id || '',
      };
      nftAttributesToInsert.push(nftAttribute);
    }
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