"use client";
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';
import { createClient } from '@/app/_lib/supabase/client';
import { UserProfile } from '@/app/_lib/types';

// 类型定义
interface AuthState {
  isBackendVerified: boolean;
  verifiedUserData: { wallet: string } | null;
  userProfile: UserProfile | null;
  isSiweLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

// 创建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 提供者组件
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClient();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  // Auth 状态
  const [isBackendVerified, setIsBackendVerified] = useState<boolean>(false);
  const [verifiedUserData, setVerifiedUserData] = useState<{ wallet: string } | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isSiweLoading, setIsSiweLoading] = useState<boolean>(false);

  // 检查当前会话是否已认证
  const checkAuth = useCallback(async (): Promise<boolean> => {
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('AuthContext: 检查会话状态:', session);
    if (error) {
      console.error('AuthContext: 从 Supabase 获取会话失败:', error);
      setIsBackendVerified(false);
      setVerifiedUserData(null);
      return false;
    }
    if (session) {
      setIsBackendVerified(true);
      setVerifiedUserData({ wallet: session.user.id });
      return true;
    } else {
      setIsBackendVerified(false);
      setVerifiedUserData(null);
      return false;
    }
  }, [supabase]);

  // 在钱包连接状态改变时处理
  // useEffect(() => {
  //   if (isConnected && address && !isBackendVerified) {
  //     // 只有在钱包连接且未认证时检查会话状态
  //     checkAuth();
  //   } else if (!isConnected && isBackendVerified) {
  //     // 钱包断开连接时，重置认证状态
  //     setIsBackendVerified(false);
  //     setVerifiedUserData(null);
  //   }
  // }, [isConnected, address, isBackendVerified]);

  // 替换 useEffect：首次检查会话并订阅 Supabase 身份验证状态变化
  // useEffect(() => {
  //   checkAuth();
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
  //     if (session) {
  //       setIsBackendVerified(true);
  //       setVerifiedUserData({ wallet: session.user.id });
  //     } else {
  //       setIsBackendVerified(false);
  //       setVerifiedUserData(null);
  //       setUserProfile(null);
  //     }
  //   });
  //   return () => subscription.unsubscribe();
  // }, [supabase, checkAuth]);

  // SIWE登录逻辑
  const login = useCallback(async (): Promise<void> => {
    if (!address || !chain?.id || isSiweLoading) {
      if (isBackendVerified) {
        console.log("AuthContext: 已经认证，无需登录");
        return;
      }
      if (!address || !chain?.id) {
        console.log("AuthContext: 钱包未连接或链ID未知，无法登录");
        return;
      }
      if (isSiweLoading) {
        console.log("AuthContext: 登录过程已在进行中");
        return;
      }
    }

    // 先检查是否已有有效会话
    const isAlreadyAuthenticated = await checkAuth();
    if (isAlreadyAuthenticated) {
      console.log("AuthContext: 已存在有效会话，无需重新登录");

      const profileRes = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      })

      if (!profileRes.ok) {
        const errorData = await profileRes.json().catch(() => ({ error: '获取 profile 失败, 无法解析错误响应' }));
        throw new Error(errorData.error || '获取 profile 失败');
      } else {
        const profileData = await profileRes.json();
        setUserProfile(profileData)
      }
      return;
    }

    setIsSiweLoading(true);
    console.log("AuthContext: 开始 SIWE 登录流程...");

    try {
      // 1. 获取随机数(nonce)
      const nonceRes = await fetch('/api/auth/nonce');
      if (!nonceRes.ok) {
        const errorData = await nonceRes.json().catch(() => ({ error: '获取 nonce 失败, 无法解析错误响应' }));
        throw new Error(errorData.error || '获取 nonce 失败');
      }
      const { nonce } = await nonceRes.json();
      if (!nonce) throw new Error('API 未返回 nonce');

      // 2. 创建 SIWE 消息
      const domain = typeof window !== 'undefined' ? window.location.host : '';
      const uri = typeof window !== 'undefined' ? window.location.origin : '';

      const siweMessage = new SiweMessage({
        domain,
        address: address,
        uri,
        version: '1',
        chainId: chain.id,
        nonce: nonce,
        issuedAt: new Date().toISOString(),
      });

      // 3. 准备消息并签名
      const messageToSign = siweMessage.prepareMessage();
      const signature = await signMessageAsync({ message: messageToSign });

      // 4. 验证签名
      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSign, signature }),
        credentials: 'include', // 确保包含 cookie
      });

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json().catch(() => ({ error: '服务器验证失败, 无法解析错误响应' }));
        throw new Error(errorData.error || '服务器验证失败');
      }

      const verificationData = await verifyRes.json();
      console.log('AuthContext: SIWE 登录成功:', verificationData);


      const { access_token, refresh_token, wallet } = verificationData.data
      if (verificationData.success && wallet) {

        const { data, error: setError } = await supabase.auth.setSession({
          access_token, refresh_token
        })

        if (setError) {
          console.error('在客户端设置会话失败:', setError);
          // 处理在客户端设置会话时发生的错误
          return;
        }

        console.log('会话已在客户端成功设置:', data.session);
        console.log('当前用户:', data.user); // data.user 也会被设置

        setIsBackendVerified(true);
        setVerifiedUserData({ wallet: wallet });

        // 4. 获取个人信息
        const profileRes = await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: wallet }),
        })
        if (!profileRes.ok) {
          const errorData = await profileRes.json().catch(() => ({ error: '获取 profile 失败, 无法解析错误响应' }));
          throw new Error(errorData.error || '获取 profile 失败');
        } else {
          const profileData = await profileRes.json();
          setUserProfile(profileData)
        }

        console.log("AuthContext: SIWE 登录成功并已验证后端");
      } else {
        throw new Error(verificationData.message || '验证成功但API未返回正确的用户信息或状态');
      }

    } catch (error) {
      if (error instanceof Error) {
        console.error("AuthContext: SIWE 登录错误:", error.message);
      }
      setIsBackendVerified(false);
      setVerifiedUserData(null);
      throw error; // 重新抛出错误以便调用者处理
    } finally {
      setIsSiweLoading(false);
    }
  }, [address, chain, isSiweLoading, signMessageAsync]);

  // 登出逻辑
  const logout = useCallback(async () => {
    try {

      await supabase.auth.signOut()
    } catch (error) {
      console.error('AuthContext: 登出API调用失败:', error);
    }

    // 重置状态并断开钱包连接
    setIsBackendVerified(false);
    setVerifiedUserData(null);
    disconnect();
    console.log("AuthContext: 用户已登出");
  }, [disconnect]);

  // 提供上下文值
  const contextValue: AuthContextType = {
    isBackendVerified,
    userProfile,
    verifiedUserData,
    isSiweLoading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义钩子以便组件使用
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }
  return context;
}; 