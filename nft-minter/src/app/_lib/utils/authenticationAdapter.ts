import { createAuthenticationAdapter } from '@rainbow-me/rainbowkit';
import { SiweMessage } from 'siwe';
import { signInAction, signOutAction } from '@/app/_lib/actions/auth';
import { eventEmitter } from '../config/clients/eventEmitter';
import { EMITTER_EVENTS } from '../constants';

export const authenticationAdapter = createAuthenticationAdapter({
  getNonce: async () => {
    const response = await fetch('/api/auth/nonce');
    const data: { nonce: string } = await response.json();

    return new Promise((resolve) => resolve(data.nonce));
  },
  createMessage: ({ nonce, address, chainId }) => {
    return new SiweMessage({
      domain: window.location.host,
      address,
      statement: 'Sign in with Ethereum to the app.',
      uri: window.location.origin,
      version: '1',
      chainId,
      nonce
    });
  },
  getMessageBody: ({ message }) => {
    return message.prepareMessage();
  },
  verify: async ({ message, signature }) => {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, signature })
    });

    if (!response.ok) {
      throw new Error('Failed to verify signature');
    }
    const data = await response.json();

    await signInAction({
      address: data.address,
      chainId: data.chainId,
      nonce: data.nonce
    });

    eventEmitter.emit(EMITTER_EVENTS.SIGN_IN);
    
    return true
  },
  signOut: async () => {
    await fetch('/api/auth/logout');
    await signOutAction();
    eventEmitter.emit(EMITTER_EVENTS.SIGN_OUT);
  }
});
