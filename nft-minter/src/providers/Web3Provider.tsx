'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  getDefaultConfig,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  zora,
  sepolia,
  holesky,
  hoodi,
  localhost
} from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import type { Chain } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
if (!projectId) {
  throw new Error("Error: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set in .env.local");
}

const enableTestnets = process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true';

// 定义支持的链
const supportedChains = enableTestnets
  ? [
      mainnet,
      polygon,
      optimism,
      arbitrum,
      base,
      zora,
      sepolia,
      holesky,
      // hoodi,
      // localhost,
    ] as const
  : [mainnet, polygon, optimism, arbitrum, base, zora] as const;

// 创建配置
const config = getDefaultConfig({
  appName: 'NFT Minter',
  projectId: projectId,
  chains: supportedChains,
  ssr: false,
});

// 安全地检查 config 结构
// console.log('Wagmi config keys:', Object.keys(config));
// console.log('Wagmi config chains:', config.chains);

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const rainbowKitTheme = darkTheme({
    accentColor: '#3b82f6',
    accentColorForeground: 'white',
    borderRadius: 'medium',
    fontStack: 'system',
  });

  if (!mounted) {
    return null;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={rainbowKitTheme}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 