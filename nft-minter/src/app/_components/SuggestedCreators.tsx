'use client';

import Image from 'next/image';
import Link from 'next/link';

// 示例创作者数据
const CREATORS = [
  {
    id: '1',
    name: 'zhang3',
    avatar: '/images/avatar1.jpg',
    followers: 1245,
    verified: true
  },
  {
    id: '2',
    name: 'li4',
    avatar: '/images/avatar2.jpg',
    followers: 879,
    verified: true
  },
  {
    id: '3',
    name: 'wang5',
    avatar: '/images/avatar3.jpg',
    followers: 2352,
    verified: false
  },
  {
    id: '4',
    name: 'zhou6',
    avatar: '/images/avatar4.jpg',
    followers: 543,
    verified: false
  }
];

const SuggestedCreators = () => {
  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">推荐创作者</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CREATORS.map((creator) => (
            <div key={creator.id} className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full overflow-hidden">
                  <Image
                    src={creator.avatar}
                    alt={creator.name}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                </div>
                {creator.verified && (
                  <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M9.41 12.82l2.41 2.4 4.77-4.76c.34-.34.34-.9 0-1.24-.34-.34-.9-.34-1.24 0l-3.53 3.53-1.17-1.17c-.34-.34-.9-.34-1.24 0-.34.34-.34.9 0 1.24z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{creator.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{creator.followers} 粉丝</p>
              
              <button className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-900 dark:text-white text-sm font-medium transition-colors">
                关注
              </button>
              
              <Link href={`/creator/${creator.id}`} className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                查看作品
              </Link>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/creators" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium">
            发现更多创作者 →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SuggestedCreators; 