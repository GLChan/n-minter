'use client';

import { RainbowKitProvider, DisclaimerComponent } from '@rainbow-me/rainbowkit';
import type { ReactNode } from 'react';

type CompatibleRainbowKitProps = {
  coolMode?: boolean;
  children: ReactNode;
};


const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
  <Text>
    By connecting your wallet, you agree to the{' '}
    <Link href="https://termsofservice.xyz">Terms of Service</Link> and
    acknowledge you have read and understand the protocol{' '}
    <Link href="https://disclaimer.xyz">Disclaimer</Link>
  </Text>
);

// 这个组件用于解决React 19与RainbowKit的类型兼容性问题
export default function CompatibleRainbowKit({ children, ...props }: CompatibleRainbowKitProps) {
  // 使用类型断言来解决React 19中ReactNode包含bigint类型的问题
  const compatibleChildren = children as any;

  return <RainbowKitProvider {...props}
    showRecentTransactions={true}
    appInfo={{
      appName: 'NFT Minter',
      disclaimer: Disclaimer,

    }}>
    {compatibleChildren}
  </RainbowKitProvider>;
} 