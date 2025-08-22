"use client";
import { getUserInfo } from "@/app/_lib/actions";
import { UserProfile } from "@/app/_lib/types";
import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext<UserProfile | null>(null);

export function UserProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    
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
  }, [isHydrated]); // 依赖 isHydrated，确保只在客户端执行

  // 在用户信息加载完成前或未 hydrated 时，显示 children 但不提供用户信息
  if (!isHydrated || loading) {
    return <UserContext.Provider value={null}>{children}</UserContext.Provider>;
  }

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
