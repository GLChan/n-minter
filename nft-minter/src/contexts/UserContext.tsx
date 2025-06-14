"use client";
import { getUserInfo } from "@/app/_lib/actions";
import { UserProfile } from "@/app/_lib/types";
import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext<UserProfile | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 组件挂载后，从 NextAuth 的 session API 端点获取用户信息
    // NextAuth 默认提供 /api/auth/session 这个端点
    async function fetchUser() {
      console.log("Fetching user session...");
      try {
        const res = await getUserInfo();
        if (res) {
          // 注意：session API 返回的数据可能在 user 对象里，也可能直接是 session
          setUser(res);
        }
      } catch (error) {
        console.error("Failed to fetch user session", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []); // 空依赖数组，确保只在首次加载时执行一次

  // 在用户信息加载完成前，可以显示一个加载状态或什么都不显示
  if (loading) {
    return <>{children}</>; // 或者返回一个带骨架屏的 children
  }

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
