'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { State, WagmiProvider } from 'wagmi';
import {
  RainbowKitAuthenticationProvider
} from '@rainbow-me/rainbowkit';
import { type ReactNode, useState } from 'react';
import ReactQueryProvider from './ReactQueryProvider';
import wagmiConfig from '@/app/_lib/config/wagmi';
import { authenticationAdapter } from '@/app/_lib/utils/authenticationAdapter';
import useAsyncEffect from '@/app/_lib/hooks/useAsyncEffect';
import { isAuthAction } from '@/app/_lib/actions/auth';
import { Optional } from '@/app/_lib/types';
import { eventEmitter } from '@/app/_lib/config/clients/eventEmitter';
import { EMITTER_EVENTS } from '@/app/_lib/constants';
import CompatibleRainbowKit from './CompatibleRainbowKit';

type RainbowKitProviderProps = {
  children: ReactNode;
  initialState: State | undefined;
};

export default function RainbowKitProvider({
  children,
  initialState
}: RainbowKitProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState<Optional<boolean>>();

  useAsyncEffect(async () => {
    const { isAuth } = await isAuthAction();

    setIsAuth(isAuth);
    setIsLoading(false);

    eventEmitter.on(EMITTER_EVENTS.SIGN_IN, () => setIsAuth(true));

    eventEmitter.on(EMITTER_EVENTS.SIGN_OUT, () => setIsAuth(false));

    return () => {
      eventEmitter.removeListener(EMITTER_EVENTS.SIGN_IN);
    };
  }, []);

  const status = isLoading
    ? 'loading'
    : isAuth
      ? 'authenticated'
      : 'unauthenticated';

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <ReactQueryProvider>
        <RainbowKitAuthenticationProvider
          adapter={authenticationAdapter}
          status={status}
        >
          <CompatibleRainbowKit coolMode>
            {children}
          </CompatibleRainbowKit>
        </RainbowKitAuthenticationProvider>
      </ReactQueryProvider>
    </WagmiProvider>
  );
}
