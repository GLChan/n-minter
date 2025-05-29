import React from "react";
import { getUserCollections } from "@/app/_lib/actions";
import { UserProfile } from "@/app/_lib/types";
import CollectionCard from "@/app/_components/CollectionCard";
import { Button } from "@/app/_components/ui/Button";
import Link from "next/link";

export async function CollectionsTab({ profile }: { profile: UserProfile }) {
  const collections = await getUserCollections(profile.id);
  console.log("collections", collections);
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">我的合集</h2>

      {collections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collections.map((collection) => (
            <CollectionCard collection={collection} />
          ))}
        </div>
      )}

      {collections.length === 0 && (
        <div className="text-center text-gray-500">
          你还没有创建任何合集
          <br />
          <Link href="/create-collection" className="mt-4 inline-block">
            <Button>创建合集</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
