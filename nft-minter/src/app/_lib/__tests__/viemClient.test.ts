/**
 * @jest-environment jsdom
 */

import { 
  createWalletClient, 
  createPublicClient, 
  http,
  type PublicClient,
  type WalletClient
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { 
  mainnet, 
  polygon, 
  sepolia, 
  holesky,
  baseSepolia,
  scrollSepolia,
  optimismSepolia,
  arbitrumSepolia,
  polygonMumbai
} from 'viem/chains';

import { chainsMap, getViemClients } from '../viemClient';

// Mock dependencies
jest.mock('viem', () => ({
  createWalletClient: jest.fn(),
  createPublicClient: jest.fn(),
  http: jest.fn(),
}));

jest.mock('viem/accounts', () => ({
  privateKeyToAccount: jest.fn(),
}));

jest.mock('@/app/_lib/config/env', () => ({
  env: {
    PRIVATE_KEY: 'test-private-key-without-0x',
  },
}));

const mockCreateWalletClient = createWalletClient as jest.MockedFunction<typeof createWalletClient>;
const mockCreatePublicClient = createPublicClient as jest.MockedFunction<typeof createPublicClient>;
const mockHttp = http as jest.MockedFunction<typeof http>;
const mockPrivateKeyToAccount = privateKeyToAccount as jest.MockedFunction<typeof privateKeyToAccount>;

const mockAccount = {
  address: '0x123456789abcdef' as const,
  type: 'privateKey' as const,
};

const mockPublicClient = {
  chain: mainnet,
  transport: {},
} as PublicClient;

const mockWalletClient = {
  account: mockAccount,
  chain: mainnet,
  transport: {},
} as WalletClient;

const mockTransport = { type: 'http' };

describe('Viem Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHttp.mockReturnValue(mockTransport as any);
    mockPrivateKeyToAccount.mockReturnValue(mockAccount as any);
    mockCreatePublicClient.mockReturnValue(mockPublicClient);
    mockCreateWalletClient.mockReturnValue(mockWalletClient);
  });

  describe('chainsMap', () => {
    it('should contain all supported chain configurations', () => {
      expect(chainsMap).toHaveProperty('1', mainnet);
      expect(chainsMap).toHaveProperty('137', polygon);
      expect(chainsMap).toHaveProperty('11155111', sepolia);
      expect(chainsMap).toHaveProperty('17000', holesky);
      expect(chainsMap).toHaveProperty('84532', baseSepolia);
      expect(chainsMap).toHaveProperty('534351', scrollSepolia);
      expect(chainsMap).toHaveProperty('420', optimismSepolia);
      expect(chainsMap).toHaveProperty('421614', arbitrumSepolia);
      expect(chainsMap).toHaveProperty('80001', polygonMumbai);
    });

    it('should have correct chain objects for each supported network', () => {
      Object.values(chainsMap).forEach(chain => {
        expect(chain).toHaveProperty('id');
        expect(chain).toHaveProperty('name');
        expect(chain).toHaveProperty('nativeCurrency');
        expect(typeof chain.id).toBe('number');
        expect(typeof chain.name).toBe('string');
      });
    });

    it('should map string chain IDs to correct chain objects', () => {
      expect(chainsMap['1']).toBe(mainnet);
      expect(chainsMap['137']).toBe(polygon);
      expect(chainsMap['11155111']).toBe(sepolia);
      expect(chainsMap['17000']).toBe(holesky);
    });
  });

  describe('getViemClients', () => {
    it('should create clients for supported chain ID', () => {
      const chainId = 1; // Mainnet
      const result = getViemClients(chainId);

      expect(mockPrivateKeyToAccount).toHaveBeenCalledWith('0xtest-private-key-without-0x');
      expect(mockCreatePublicClient).toHaveBeenCalledWith({
        chain: mainnet,
        transport: mockTransport,
      });
      expect(mockCreateWalletClient).toHaveBeenCalledWith({
        account: mockAccount,
        chain: mainnet,
        transport: mockTransport,
      });

      expect(result).toEqual({
        account: mockAccount,
        chain: mainnet,
        publicClient: mockPublicClient,
        walletClient: mockWalletClient,
      });
    });

    it('should handle private key with 0x prefix', () => {
      // Mock env with 0x prefix
      jest.doMock('@/app/_lib/config/env', () => ({
        env: {
          PRIVATE_KEY: '0xtest-private-key-with-0x',
        },
      }));

      const chainId = 1;
      getViemClients(chainId);

      expect(mockPrivateKeyToAccount).toHaveBeenCalledWith('0xtest-private-key-with-0x');
    });

    it('should handle private key without 0x prefix', () => {
      // Mock env without 0x prefix
      jest.doMock('@/app/_lib/config/env', () => ({
        env: {
          PRIVATE_KEY: 'test-private-key-without-0x',
        },
      }));

      const chainId = 1;
      getViemClients(chainId);

      expect(mockPrivateKeyToAccount).toHaveBeenCalledWith('0xtest-private-key-without-0x');
    });

    it('should work with different supported chain IDs', () => {
      const testCases = [
        { chainId: 1, expectedChain: mainnet },
        { chainId: 137, expectedChain: polygon },
        { chainId: 11155111, expectedChain: sepolia },
        { chainId: 17000, expectedChain: holesky },
      ];

      testCases.forEach(({ chainId, expectedChain }) => {
        jest.clearAllMocks();
        mockHttp.mockReturnValue(mockTransport as any);
        mockPrivateKeyToAccount.mockReturnValue(mockAccount as any);
        mockCreatePublicClient.mockReturnValue({ ...mockPublicClient, chain: expectedChain });
        mockCreateWalletClient.mockReturnValue({ ...mockWalletClient, chain: expectedChain });

        const result = getViemClients(chainId);

        expect(mockCreatePublicClient).toHaveBeenCalledWith({
          chain: expectedChain,
          transport: mockTransport,
        });
        expect(mockCreateWalletClient).toHaveBeenCalledWith({
          account: mockAccount,
          chain: expectedChain,
          transport: mockTransport,
        });
        expect(result.chain).toBe(expectedChain);
      });
    });

    it('should throw error for unsupported chain ID', () => {
      const unsupportedChainId = 999;

      expect(() => getViemClients(unsupportedChainId)).toThrow('不支持的链 ID：999');
    });

    it('should create HTTP transport for both clients', () => {
      const chainId = 1;
      getViemClients(chainId);

      expect(mockHttp).toHaveBeenCalledTimes(2);
      expect(mockHttp).toHaveBeenCalledWith();
    });

    it('should return all required client components', () => {
      const chainId = 1;
      const result = getViemClients(chainId);

      expect(result).toHaveProperty('account');
      expect(result).toHaveProperty('chain');
      expect(result).toHaveProperty('publicClient');
      expect(result).toHaveProperty('walletClient');

      expect(result.account).toBe(mockAccount);
      expect(result.chain).toBe(mainnet);
      expect(result.publicClient).toBe(mockPublicClient);
      expect(result.walletClient).toBe(mockWalletClient);
    });

    describe('Error handling', () => {
      it('should handle privateKeyToAccount errors', () => {
        mockPrivateKeyToAccount.mockImplementation(() => {
          throw new Error('Invalid private key');
        });

        expect(() => getViemClients(1)).toThrow('Invalid private key');
      });

      it('should handle createPublicClient errors', () => {
        mockCreatePublicClient.mockImplementation(() => {
          throw new Error('Failed to create public client');
        });

        expect(() => getViemClients(1)).toThrow('Failed to create public client');
      });

      it('should handle createWalletClient errors', () => {
        mockCreateWalletClient.mockImplementation(() => {
          throw new Error('Failed to create wallet client');
        });

        expect(() => getViemClients(1)).toThrow('Failed to create wallet client');
      });
    });

    describe('Chain validation', () => {
      it('should validate chain ID as number', () => {
        expect(() => getViemClients(1.5)).toThrow('不支持的链 ID：1.5');
        expect(() => getViemClients(-1)).toThrow('不支持的链 ID：-1');
        expect(() => getViemClients(0)).toThrow('不支持的链 ID：0');
      });

      it('should handle edge case chain IDs', () => {
        const edgeCases = [
          Number.MAX_SAFE_INTEGER,
          Number.MIN_SAFE_INTEGER,
          NaN,
          Infinity,
          -Infinity,
        ];

        edgeCases.forEach(chainId => {
          expect(() => getViemClients(chainId)).toThrow(`不支持的链 ID：${chainId}`);
        });
      });
    });

    describe('Environment variable handling', () => {
      it('should handle empty private key', () => {
        jest.doMock('@/app/_lib/config/env', () => ({
          env: {
            PRIVATE_KEY: '',
          },
        }));

        expect(() => getViemClients(1)).not.toThrow();
        expect(mockPrivateKeyToAccount).toHaveBeenCalledWith('0x');
      });

      it('should handle private key with mixed case hex', () => {
        jest.doMock('@/app/_lib/config/env', () => ({
          env: {
            PRIVATE_KEY: '0xAbCdEf123456',
          },
        }));

        getViemClients(1);

        expect(mockPrivateKeyToAccount).toHaveBeenCalledWith('0xAbCdEf123456');
      });
    });

    describe('Integration test', () => {
      it('should create fully functional client objects for mainnet', () => {
        const chainId = 1;
        const result = getViemClients(chainId);

        // Verify the structure matches expected viem client interfaces
        expect(result.publicClient).toBeDefined();
        expect(result.walletClient).toBeDefined();
        expect(result.account).toBeDefined();
        expect(result.chain).toBeDefined();

        // Verify chain is correct
        expect(result.chain.id).toBe(1);
        expect(result.chain.name).toBe('Ethereum');
      });

      it('should create clients for all supported testnets', () => {
        const testnetChainIds = [11155111, 17000, 84532, 534351, 420, 421614, 80001];

        testnetChainIds.forEach(chainId => {
          expect(() => getViemClients(chainId)).not.toThrow();
        });
      });
    });
  });

  describe('Module exports', () => {
    it('should export chainsMap and getViemClients', () => {
      expect(chainsMap).toBeDefined();
      expect(typeof getViemClients).toBe('function');
    });

    it('should have correct TypeScript types', () => {
      expect(typeof chainsMap).toBe('object');
      expect(typeof getViemClients).toBe('function');
    });
  });
});