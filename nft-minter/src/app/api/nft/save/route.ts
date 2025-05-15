import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/app/_lib/supabase/server'; // <-- Corrected path

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  try {
    const body = await request.json();
    console.log('Received NFT data to save:', body);

    const {
      tokenId,
      tokenURI,
      ownerAddress,
      contractAddress,
      chainId, // 从前端获取 Chain ID
      name,
      description,
      imageUrl, // 假设前端会传递
      // attributes,
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


    // --- Find associated profile ---
    let profileId: string | null = null;
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('wallet_address', ownerAddress)
      .single(); // Assuming wallet_address is unique

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116: Row not found, which is okay here
      console.error('Error fetching profile:', profileError);
      // Decide if this should be a hard error or just proceed without profile_id
      // return NextResponse.json({ error: 'Failed to fetch user profile.', details: profileError.message }, { status: 500 });
    } else if (profileData) {
      profileId = profileData.id;
      console.log('Found profile ID:', profileId, 'for address:', ownerAddress);
    } else {
      console.warn('No profile found for address:', ownerAddress);
    }


    // --- Insert NFT data ---
    const { data: nftData, error: insertError } = await supabase
      .from('nfts')
      .insert([{
        // token_id: tokenId.toString(), // Ensure token_id is stored consistently (e.g., as string or numeric)
        token_uri: tokenURI,
        owner_address: ownerAddress,
        contract_address: contractAddress,
        chain_id: chainId,
        name: name,
        description: description,
        image_url: imageUrl,
        metadata: metadata,
        // attributes: attributes, // Assumes attributes is already a valid JSON object or null
        transaction_hash: transactionHash,
        // profile_id: profileId, // Include the found profile_id (can be null)
      }])
      .select() // Optionally return the inserted data
      .single(); // Expecting a single row insert

    if (insertError) {
      console.error('Error inserting NFT data:', insertError);
      // Check for unique constraint violation (e.g., duplicate transaction_hash or contract/token_id/chain)
      if (insertError.code === '23505') { // PostgreSQL unique violation code
        return NextResponse.json({ error: 'This NFT or transaction has already been saved.' }, { status: 409 }); // Conflict
      }
      return NextResponse.json({ error: 'Failed to save NFT data to database.', details: insertError.message }, { status: 500 });
    }

    console.log('NFT data saved successfully:', nftData);
    return NextResponse.json({ message: 'NFT data saved successfully', data: nftData }, { status: 201 }); // 201 Created

  } catch (error) {
    console.error('Error in /api/nft/save:', error);
    if (error instanceof SyntaxError) { // Handle invalid JSON body
      return NextResponse.json({ error: 'Invalid JSON format in request body.' }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
    }
  }
} 