"use client"
import { usePathname } from "next/navigation";
import Link from 'next/link';

// TabButton组件
interface TabButtonProps {
  children: React.ReactNode;
  active?: boolean;
  href: string;
}

const TabButton = ({ children, active, href }: TabButtonProps) => (
  <Link
    href={href} // 点击时更新 URL searchParams
    scroll={false} // 防止页面滚动
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors 
                      ${active
        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 hover:text-zinc-700 dark:hover:text-zinc-200'}
    `}
  >
    {children}

  </Link>
);

export function Tabs({ currentTab, tabs }: { currentTab: string, tabs: { name: string, slug: string }[] }) {
  const pathname = usePathname(); // 获取当前路径，例如 /profile

  return (
    <>

      {/* Tabs */}
      <div className="mt-8 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="flex space-x-2 overflow-x-auto pb-px">
            {
              tabs.map((tab) => (
                <TabButton
                  key={tab.slug}
                  href={`${pathname}?tab=${tab.slug}`}
                  active={currentTab === tab.slug}
                >
                  {tab.name}
                </TabButton>
              ))
            }
            {/* onClick={() => handleTabChange('collected')}
            >
            已收藏
          </TabButton>
          <TabButton
            active={activeTab === 'created'}
            onClick={() => handleTabChange('created')}
          >
            已创建
          </TabButton>
          <TabButton
            active={activeTab === 'activity'}
            onClick={() => handleTabChange('activity')}
          >
            活动
          </TabButton>
          <TabButton
            active={activeTab === 'settings'}
            onClick={() => handleTabChange('settings')}
          >
            设置
          </TabButton> */}
          </div>
        </div>
      </div >

    </>
  )
}