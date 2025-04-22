'use client';

import Image from 'next/image';
import Link from 'next/link';

interface NFTCardProps {
  id: string;
  name: string;
  image: string;
  creator: string;
  price?: string;
  currency?: string;
  collection?: string;
  timeLeft?: string;
}

const NFTCard = ({ 
  id, 
  name, 
  image, 
  creator, 
  price, 
  currency = 'ETH',
  collection,
  timeLeft
}: NFTCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black transition-all hover:shadow-lg">
      <Link href={`/nft/${id}`}>
        <div className="aspect-square overflow-hidden">
          <Image
            src={image}
            alt={name}
            width={500}
            height={500}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">{name}</h3>
            {timeLeft && (
              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                {timeLeft}
              </span>
            )}
          </div>
          
          {collection && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {collection}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="truncate">创作者: {creator}</span>
            </div>
            
            {price && (
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {price} {currency}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default NFTCard; 