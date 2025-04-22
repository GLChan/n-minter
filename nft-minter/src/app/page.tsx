import React from 'react';
import { Navbar } from './_components/Navbar';
import { Hero } from './_components/Hero';
import { TrendingCollections } from './_components/TrendingCollections';
import { SuggestedUsers } from './_components/SuggestedUsers';
import { Footer } from './_components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TrendingCollections />
            </div>
            
            <div className="lg:col-span-1">
              <SuggestedUsers />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
