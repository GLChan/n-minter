"use client";

import { Button } from "@/app/_components/ui/Button";
import {
  addUserFollow,
  isUserFollow,
  removeUserFollow,
} from "@/app/_lib/actions";
import { isAuthAction } from "@/app/_lib/actions/auth";
import { useState, useEffect } from "react";

export default function FollowButton({ userId }: { userId: string }) {
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function checkFollowStatus() {
      // 获取当前登录状态
      const { isAuth } = await isAuthAction();
      if (!isAuth) {
        setIsFollowing(false);
        return;
      }
      const followed = await isUserFollow(userId);
      setIsFollowing(followed);
    }
    checkFollowStatus();
  }, [userId]);

  function handleClick() {
    if (isLoading) return;
    setIsLoading(true);

    if (isFollowing) {
      // 取消关注逻辑
      removeUserFollow(userId)
        .then(() => {
          setIsFollowing(false);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("取消关注失败:", error);
          setIsLoading(false);
        });
    } else {
      // 关注逻辑
      addUserFollow(userId)
        .then(() => {
          setIsFollowing(true);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("关注失败:", error);
          setIsLoading(false);
        });
    }
  }

  return (
    <Button size="lg" onClick={handleClick} isLoading={isLoading}>
      {isFollowing ? "取消关注" : "关注"}
    </Button>
  );
}
