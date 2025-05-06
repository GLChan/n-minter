import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'; // Use Route Handler client
// import { Database } from '@/app/_lib/database.types'; // Adjust path if needed

export async function GET(request: Request) {
  // const cookieStore = cookies();
  // const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

  // try {
  //   // 1. 获取当前认证的用户信息
  //   const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  //   if (sessionError) {
  //     console.error("Error getting session:", sessionError);
  //     return NextResponse.json({ error: 'Failed to get user session.' }, { status: 500 });
  //   }

  //   if (!session) {
  //     // If no session, could mean user is not logged in
  //     return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  //   }

  //   // 2. (关键步骤) 获取与认证用户关联的钱包地址
  //   //    这假设你的 'profiles' 表有一个 'user_id' 列关联到 auth.users.id
  //   //    并且有一个 'wallet_address' 列
  //   const userId = session.user.id;
  //   const { data: profileData, error: profileError } = await supabase
  //     .from('profiles')
  //     .select('wallet_address')
  //     .eq('id', userId) // Adjust if your foreign key column is named differently, e.g., 'user_id'
  //     .single();

  //   if (profileError) {
  //      console.error("Error fetching profile for user:", userId, profileError);
  //      // PGRST116 means no profile found for the auth user
  //      if (profileError.code === 'PGRST116') {
  //        return NextResponse.json({ error: 'User profile not found or not linked.' }, { status: 404 });
  //      }
  //      return NextResponse.json({ error: 'Failed to fetch user profile.' }, { status: 500 });
  //   }

  //   if (!profileData || !profileData.wallet_address) {
  //      console.error("Profile found but missing wallet address for user:", userId);
  //      return NextResponse.json({ error: 'User profile is missing wallet address.' }, { status: 404 });
  //   }

  //   const ownerAddress = profileData.wallet_address;
  //   console.log(`API: Fetching NFTs for authenticated user ${userId} with address ${ownerAddress}`);

  //   // 3. 使用获取到的钱包地址查询 nfts 表
  //   const { data: nfts, error: nftError } = await supabase
  //     .from('nfts')
  //     .select('*') // Select all columns or specify needed ones
  //     .eq('owner_address', ownerAddress.toLowerCase()) // Filter by owner address
  //     .order('created_at', { ascending: false }); // Order by creation date

  //   if (nftError) {
  //     console.error("Error fetching NFTs for address:", ownerAddress, nftError);
  //     return NextResponse.json({ error: 'Failed to fetch NFTs.', details: nftError.message }, { status: 500 });
  //   }

  //   // 4. 返回 NFT 数据
  //   return NextResponse.json(nfts || [], { status: 200 });

  // } catch (error: any) {
  //   console.error('Error in /api/user/nfts:', error);
  //   return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  // }
} 