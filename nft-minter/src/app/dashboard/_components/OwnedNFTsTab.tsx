import React, { Suspense } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react'; // ChevronLeft, ChevronRight, 
import { NFTCard } from '@/app/_components/ui/NFTCard';
import { NFTSkeleton } from './NFTSkeleton';
import { getCurrentUser, getUserNFTs } from '@/app/_lib/data-service';
import { InfiniteScrollList } from '@/app/_components/InfiniteScrollList';
import { UserProfile } from '@/app/_lib/types';
import Spinner from '@/app/_components/Spinner';

export default async function OwnedNFTsTab({ page, profile }: { page: number, profile: UserProfile }) {

  // 渲染主要内容
  // return (
  //   <div>
  //     

  //     {loading ? (

  //     ) : error ? (
  //       <div className="text-center py-8">
  //         <p className="text-red-500">加载 NFT 时出错:</p>
  //         {/* <p className="text-sm mt-1">{error}</p>
  //         <button
  //           onClick={() => refetch()}
  //           className="mt-4 px-4 py-2 bg-primary text-white rounded-md text-sm"
  //         >
  //           重试
  //         </button> */}
  //       </div>
  //     ) : nfts.length > 0 ? (
  // <>
  //   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
  //     {nfts.map((nft) => (
  //       <NFTCard
  //         key={nft.id}
  //         nft={nft}
  //       />
  //     ))}
  //   </div>

  //   {/* {renderPagination()} */}
  // </>
  //     ) : (
  //       <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
  //         <p className="text-zinc-500 dark:text-zinc-400 mb-4">您目前还没有任何 NFT</p>
  //         <Link
  //           href="/create"
  //           className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
  //         >
  //           开始创建 NFT
  //         </Link>
  //       </div>
  //     )}
  //   </div>
  // );

  const nfts = await getUserNFTs(page, 10, profile.id)
  
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {nfts.map((nft) => (
          <NFTCard key={nft.id} nft={nft}/>
        ))}
      </div>
    </div>
  )
  // return (
  //   <div>
  //     <InfiniteScrollList
  //       fetchFn={(page, pageSize) => getUserNFTs(page, pageSize)} // 获取NFT的函数
  //       pageSize={10} // 每次加载10个
  //       loadingPlaceholder={
  //         <>
  //           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
  //             {Array.from({ length: 10 }).map((_, index) => (
  //               <NFTSkeleton key={index} />
  //             ))}
  //           </div>
  //           <div className="flex justify-center mt-6">
  //             <Loader2 className="w-6 h-6 animate-spin text-primary" />
  //             <span className="ml-2 text-zinc-500 dark:text-zinc-400">加载中...</span>
  //           </div>
  //         </>
  //       }
  //       container={
  //         (child: React.ReactNode) => (
  //           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
  //             {child}
  //           </div>
  //         )
  //       }
  //       renderItem={(nft) => (
  //         <NFTCard
  //           key={nft.id}
  //           nft={nft}
  //         />
  //       )}
  //       errorMessage="加载失败，请稍后再试" // 自定义错误信息
  //       noMoreCreateButton={
  //         () => (
  //           <Link
  //             href="/create"
  //             className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
  //           >
  //             开始创建 NFT
  //           </Link>
  //         )
  //       }
  //     />
  //   </div>
  // );
} 