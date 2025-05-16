import React from 'react';
import { Hero } from './_components/Hero';
import { TrendingCollections } from './_components/TrendingCollections';
import { SuggestedUsers } from './_components/SuggestedUsers';

export default function Home() {
  return (
    <>
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
    </>
  );
}
