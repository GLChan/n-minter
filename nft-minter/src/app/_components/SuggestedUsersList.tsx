import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/Button";
import { getSuggestedUsers } from "../_lib/actions";

export default async function SuggestedUsersList() {
  const extendedUsers = await getSuggestedUsers();

  return (
    <>
      {extendedUsers.map((user, index) => (
        <div
          key={`${user.id}-${index}`}
          className="flex items-center justify-between p-3 mb-4 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 hover:shadow-md transition-shadow"
        >
          <Link href={`/user/${user.id}`} className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={user.avatar_url || ""}
                alt={user.username || "用户头像"}
                fill
                className="object-cover"
              />
            </div>

            <div>
              <span className="font-medium">{user.username}</span>
              <p className="text-xs text-zinc-500 overflow-hidden whitespace-nowrap overflow-ellipsis w-80 dark:text-zinc-400">
                {user.bio || "NFT 创作者"}
              </p>
            </div>
          </Link>

          <Button variant="secondary" size="sm">
            关注
          </Button>
        </div>
      ))}
    </>
  );
}
