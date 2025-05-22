import { NextResponse } from 'next/server';
import { createClient } from '@/app/_lib/supabase/server';
import { NFT, Transaction } from '@/app/_lib/types';
import { saveNFT, saveNFTAttributes, saveTransaction } from '@/app/_lib/actions';
import { NFTMarketStatus, NFTVisibilityStatus, TransactionStatus, TransactionType } from '@/app/_lib/types/enums';

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    // 1. 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

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

    // --- 插入 NFT 数据 ---
    const partialNFT: Partial<NFT> = {
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
      owner_id: user.id, // 设置必需的owner_id字段
      creator_id: user.id, // 设置必需的owner_id字段
      collection_id: collectionId || null,
      status: NFTVisibilityStatus.HiddenByUser,
      list_status: NFTMarketStatus.NotListed
    }

    const nftData = await saveNFT(partialNFT)
    console.log('NFT data saved successfully:', nftData);

    // --- 插入 attributes keys ---
    const nftAttributes = await saveNFTAttributes(nftData.id, attributes)
    console.log('NFT attributes 保存成功:', nftAttributes);

    // --- 插入交易数据 ---
    const transaction: Partial<Transaction> = {
      transaction_hash: transactionHash,
      transaction_type: TransactionType.Mint,
      status: TransactionStatus.Pending,
      transaction_time: new Date().toISOString(),
      nft_id: nftData.id,
      buyer_address: ownerAddress, // to
      seller_address: contractAddress, // from
      price: 0,
      currency: 'ETH',
    }
    const transactionData = await saveTransaction(transaction)
    console.log('交易数据保存成功:', transactionData);

    return NextResponse.json({ message: 'NFT 保存成功', data: nftData }, { status: 201 });

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
