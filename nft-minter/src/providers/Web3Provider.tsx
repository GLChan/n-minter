import { ReactNode } from 'react';
import RainbowKitProvider from './RainbowKitProvider';
import { cookieToInitialState } from 'wagmi';
import wagmiConfig from '@/app/_lib/config/wagmi';
import { headers } from 'next/headers';

type ProvidersProps = {
  children: ReactNode;
};

export default async function Providers({ children }: ProvidersProps) {
  const headersStore = await headers();
  const cookie = headersStore.get('cookie');

  const initialState = cookieToInitialState(wagmiConfig, cookie);

  return (
    <RainbowKitProvider initialState={initialState}>
      {children}
    </RainbowKitProvider>
  );
}
