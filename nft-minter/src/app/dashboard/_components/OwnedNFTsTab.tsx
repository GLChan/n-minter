'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
// Removed Supabase client imports
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { Database } from '@/app/_lib/database.types'; 
import { NFTCard } from '@/app/_components/ui/NFTCard'; // Adjust path if needed

// Define the structure of the NFT data expected from the API
// This should match the structure returned by /api/user/nfts
// which currently matches the 'nfts' table row structure.
interface NFT {
    id: string;
    created_at: string;
    token_id: number | string; // Adjust based on actual type in DB/API response
    token_uri: string;
    owner_address: string;
    contract_address: string;
    chain_id: number;
    name: string | null;
    description: string | null;
    image_url: string | null;
    metadata: any | null; // Adjust 'any' if you have a specific metadata type
    transaction_hash: string;
    profile_id: string | null;
}

export function OwnedNFTsTab() {
  // Still use useAccount to check connection status before calling API
  const { isConnected } = useAccount(); 

  const [ownedNFTs, setOwnedNFTs] = useState<NFT[]>([]);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);
  const [fetchNFTError, setFetchNFTError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTsViaApi = async () => {
      // Only fetch if connected
      if (!isConnected) {
        setOwnedNFTs([]);
        setIsLoadingNFTs(false);
        return;
      }

      setIsLoadingNFTs(true);
      setFetchNFTError(null);
      setOwnedNFTs([]);

      try {
        // Call the new API route
        const response = await fetch('/api/user/nfts');

        if (!response.ok) {
          let errorMsg = `Error: ${response.status} ${response.statusText}`;
          try {
             const errorData = await response.json();
             errorMsg = errorData.error || errorData.message || errorMsg;
          } catch (e) { /* Ignore json parsing error if body is not json */ }
          throw new Error(errorMsg);
        }

        const data: NFT[] = await response.json();
        setOwnedNFTs(data || []);

      } catch (err: any) {
        setFetchNFTError(err.message || "An error occurred while fetching NFTs via API.");
        console.error("Error fetching owned NFTs via API:", err);
      } finally {
        setIsLoadingNFTs(false);
      }
    };

    fetchNFTsViaApi();
  // Rerun effect when connection status changes
  }, [isConnected]); 

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 sr-only">我拥有的 NFT</h2>
      {isLoadingNFTs ? (
        <p className="text-zinc-500 dark:text-zinc-400 mt-6 text-center">正在加载您的 NFT...</p>
      ) : fetchNFTError ? (
        <p className="text-red-500 mt-6 text-center">加载 NFT 时出错: {fetchNFTError}</p>
      ) : ownedNFTs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {ownedNFTs.map((nft) => (
             // Passing props to NFTCard remains the same logic as before
             // Still requires knowing the exact props needed by NFTCard
            <NFTCard 
              key={nft.id} 
              id={nft.id} 
              title={nft.name || 'Untitled NFT'}
              image={nft.image_url || '/placeholder-image.png'}
              creator={nft.owner_address} // Placeholder
              price={0} // Placeholder
              timeAgo={new Date(nft.created_at).toLocaleTimeString()} // Placeholder
            />
          ))}
        </div>
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400 mt-6 text-center">您目前还没有任何 NFT。 <Link href="/create" className='text-primary hover:underline'>现在就去创建一个吧！</Link></p>
      )}
    </div>
  );
} 