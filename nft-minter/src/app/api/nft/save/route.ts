import { NextResponse } from 'next/server';
import { createClient } from '@/app/_lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    console.log('Received NFT data to save:', body);

    const {
      tokenId,
      tokenURI,
      ownerAddress,
      contractAddress,
      chainId,
      name,
      description,
      imageUrl,
      attributes,
      collectionId,
      metadata,
      transactionHash,
      status = 'completed'
    } = body;

    // --- Input Validation (Basic) ---
    if (!tokenId || !tokenURI || !ownerAddress || !contractAddress || !name || !transactionHash || !chainId) {
      return NextResponse.json({ error: 'Missing required NFT data fields.' }, { status: 400 });
    }
    if (typeof ownerAddress !== 'string' || !ownerAddress.startsWith('0x')) {
      return NextResponse.json({ error: 'Invalid owner address format.' }, { status: 400 });
    }
    if (typeof contractAddress !== 'string' || !contractAddress.startsWith('0x')) {
      return NextResponse.json({ error: 'Invalid contract address format.' }, { status: 400 });
    }
    if (typeof transactionHash !== 'string' || !transactionHash.startsWith('0x')) {
      return NextResponse.json({ error: 'Invalid transaction hash format.' }, { status: 400 });
    }
    if (typeof chainId !== 'number') {
      return NextResponse.json({ error: 'Invalid chain ID format.' }, { status: 400 });
    }

    // --- Find associated profile ---
    let profileId: string | null = null;
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('wallet_address', ownerAddress)
      .single(); // Assuming wallet_address is unique

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116: Row not found, which is okay here
      console.error('Error fetching profile:', profileError);
      // 如果找不到用户资料，可以考虑创建一个
      console.log('尝试创建新用户资料...');
      try {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            wallet_address: ownerAddress,
            username: `User_${ownerAddress.slice(2, 8)}`,
          }])
          .select('id')
          .single();
          
        if (createError) {
          console.error('创建用户资料失败:', createError);
        } else if (newProfile) {
          profileId = newProfile.id;
          console.log('创建并获取新用户ID:', profileId);
        }
      } catch (e) {
        console.error('创建用户资料过程中出错:', e);
      }
    } else if (profileData) {
      profileId = profileData.id;
      console.log('Found profile ID:', profileId, 'for address:', ownerAddress);
    } else {
      console.warn('No profile found for address:', ownerAddress);
      return NextResponse.json({ 
        error: '无法找到或创建用户资料。NFT必须关联到一个用户。', 
        details: 'owner_id字段不能为空' 
      }, { status: 400 });
    }

    // 确保 profileId 不为空
    if (!profileId) {
      return NextResponse.json({ 
        error: '用户资料ID不存在。NFT必须关联到一个用户。', 
        details: 'owner_id字段不能为空' 
      }, { status: 400 });
    }

    // --- Insert NFT data ---
    const { data: nftData, error: insertError } = await supabase
      .from('nfts')
      .insert([{
        token_id: tokenId.toString(),
        token_uri: tokenURI,
        owner_address: ownerAddress, 
        contract_address: contractAddress,
        chain_id: chainId,
        name: name,
        description: description || '',
        image_url: imageUrl,
        metadata: metadata || {},
        transaction_hash: transactionHash,
        owner_id: profileId, // 设置必需的owner_id字段
        creator_id: profileId, // 设置必需的owner_id字段
        collection_id: collectionId,
        status: status
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting NFT data:', insertError);
      // Check for unique constraint violation
      if (insertError.code === '23505') { // PostgreSQL unique violation code
        return NextResponse.json({ error: 'This NFT or transaction has already been saved.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to save NFT data to database.', details: insertError.message }, { status: 500 });
    }

    console.log('NFT data saved successfully:', nftData);
    return NextResponse.json({ message: 'NFT data saved successfully', data: nftData }, { status: 201 });

  } catch (error) {
    console.error('Error in /api/nft/save:', error);
    if (error instanceof SyntaxError) { // Handle invalid JSON body
      return NextResponse.json({ error: 'Invalid JSON format in request body.' }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: '未知错误' }, { status: 500 });
  }
} 