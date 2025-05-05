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

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
if (!projectId) {
  throw new Error("Error: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set in .env.local");
}

const config = getDefaultConfig({
  appName: 'NFT Minter',
  projectId: projectId,
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    zora,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia, holesky, hoodi, localhost] : []),
  ],
  ssr: true,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const rainbowKitTheme = darkTheme({
    accentColor: '#3b82f6',
    accentColorForeground: 'white',
    borderRadius: 'medium',
    fontStack: 'system',
  });

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={rainbowKitTheme}
          modalSize="compact"
        >
          {mounted && children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 