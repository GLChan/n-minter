"use client"

import React, { useState } from 'react';
import { Navbar } from '@/app/_components/Navbar';
import { Footer } from '@/app/_components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { OwnedNFTsTab } from './_components/OwnedNFTsTab';
import { ActivityTab } from './_components/ActivityTab';
import { OffersTab } from './_components/OffersTab';

// Placeholder for Tab Component
interface TabButtonProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  hasNotification?: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({ children, active, onClick, hasNotification }) => (
  <button
    onClick={onClick}
    className={`relative px-4 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none ${active
        ? 'text-primary border-b-2 border-primary'
        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
      }`}
  >
    {children}
    {hasNotification && (
      <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-zinc-900"></span>
    )}
  </button>
);

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('owned');

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-6 mb-8">
            {/* ... (Avatar, Name, Address) ... */}
            {/* Stats might need data passed down or fetched here/in header component */}
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-zinc-200 dark:border-zinc-800 mb-8">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              <TabButton active={activeTab === 'owned'} onClick={() => setActiveTab('owned')}>拥有的</TabButton>
              <TabButton active={activeTab === 'activity'} onClick={() => setActiveTab('activity')}>活动</TabButton>
              <TabButton 
                active={activeTab === 'offers'} 
                onClick={() => setActiveTab('offers')} 
              >
                收到的报价
              </TabButton>
            </nav>
          </div>

          {/* Tab Content - Render the active tab component */} 
          <div>
            {activeTab === 'owned' && <OwnedNFTsTab />} 
            {activeTab === 'activity' && <ActivityTab />} 
            {activeTab === 'offers' && <OffersTab />} 
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 