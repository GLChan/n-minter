require('@testing-library/jest-dom');

// Mock environment variables first
process.env.JWT_SECRET_KEY = 'test-jwt-secret';
process.env.PRIVATE_KEY = 'test-private-key';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.NEXT_PUBLIC_APP_BASE_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_MY_NFT_FACTORY_ADDRESS = '0x1234567890123456789012345678901234567890';
process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890';
process.env.NEXT_PUBLIC_WETH_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890';

// Mock React for Next.js image component
global.React = require('react');

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock Next.js image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', props);
  },
}));

// Mock Wagmi hooks
jest.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
  }),
  useConnect: () => ({
    connect: jest.fn(),
  }),
  useDisconnect: () => ({
    disconnect: jest.fn(),
  }),
}));

// Mock RainbowKit
jest.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: () => React.createElement('button', { children: 'Connect Wallet' }),
}));

// Mock Supabase
jest.mock('@/app/_lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  },
}));