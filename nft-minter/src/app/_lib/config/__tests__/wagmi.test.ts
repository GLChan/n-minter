/**
 * @jest-environment jsdom
 */

import { createConfig, createStorage, cookieStorage, http } from 'wagmi';
import {
  sepolia,
  baseSepolia,
  scrollSepolia,
  optimismSepolia,
  arbitrumSepolia,
  zkSyncSepoliaTestnet,
  polygonMumbai,
  mainnet,
  polygon,
  optimism,
  arbitrum,
  holesky
} from 'viem/chains';

// Mock wagmi dependencies
jest.mock('wagmi', () => ({
  createConfig: jest.fn(),
  createStorage: jest.fn(),
  cookieStorage: {},
  http: jest.fn(),
}));

// Mock viem/chains
jest.mock('viem/chains', () => ({
  sepolia: { id: 11155111, name: 'Sepolia' },
  baseSepolia: { id: 84532, name: 'Base Sepolia' },
  scrollSepolia: { id: 534351, name: 'Scroll Sepolia' },
  optimismSepolia: { id: 420, name: 'Optimism Sepolia' },
  arbitrumSepolia: { id: 421614, name: 'Arbitrum Sepolia' },
  zkSyncSepoliaTestnet: { id: 300, name: 'zkSync Sepolia' },
  polygonMumbai: { id: 80001, name: 'Polygon Mumbai' },
  mainnet: { id: 1, name: 'Ethereum' },
  polygon: { id: 137, name: 'Polygon' },
  optimism: { id: 10, name: 'Optimism' },
  arbitrum: { id: 42161, name: 'Arbitrum' },
  holesky: { id: 17000, name: 'Holesky' },
}));

const mockCreateConfig = createConfig as jest.MockedFunction<typeof createConfig>;
const mockCreateStorage = createStorage as jest.MockedFunction<typeof createStorage>;
const mockHttp = http as jest.MockedFunction<typeof http>;

const mockWagmiConfig = {
  chains: [],
  connectors: [],
  storage: {},
  transports: {},
};

const mockStorage = { getItem: jest.fn(), setItem: jest.fn() };
const mockTransport = { type: 'http' };

describe('Wagmi Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateConfig.mockReturnValue(mockWagmiConfig as any);
    mockCreateStorage.mockReturnValue(mockStorage as any);
    mockHttp.mockReturnValue(mockTransport as any);
  });

  it('should create wagmi config with correct configuration', () => {
    require('../wagmi');

    expect(mockCreateConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        chains: expect.any(Array),
        ssr: true,
        storage: mockStorage,
        transports: expect.any(Object),
      })
    );
  });

  it('should include all mainnet chains', () => {
    require('../wagmi');

    const config = mockCreateConfig.mock.calls[0][0];
    const chainIds = config.chains.map((chain: any) => chain.id);

    expect(chainIds).toContain(1); // mainnet
    expect(chainIds).toContain(137); // polygon
    expect(chainIds).toContain(10); // optimism
    expect(chainIds).toContain(42161); // arbitrum
  });

  it('should include all testnet chains', () => {
    require('../wagmi');

    const config = mockCreateConfig.mock.calls[0][0];
    const chainIds = config.chains.map((chain: any) => chain.id);

    expect(chainIds).toContain(17000); // holesky
    expect(chainIds).toContain(11155111); // sepolia
    expect(chainIds).toContain(84532); // baseSepolia
    expect(chainIds).toContain(534351); // scrollSepolia
    expect(chainIds).toContain(420); // optimismSepolia
    expect(chainIds).toContain(421614); // arbitrumSepolia
    expect(chainIds).toContain(300); // zkSyncSepoliaTestnet
    expect(chainIds).toContain(80001); // polygonMumbai
  });

  it('should enable SSR mode', () => {
    require('../wagmi');

    const config = mockCreateConfig.mock.calls[0][0];
    expect(config.ssr).toBe(true);
  });

  it('should use cookie storage', () => {
    require('../wagmi');

    expect(mockCreateStorage).toHaveBeenCalledWith({
      storage: cookieStorage
    });
  });

  it('should configure HTTP transports for all chains', () => {
    require('../wagmi');

    const config = mockCreateConfig.mock.calls[0][0];
    const chains = config.chains;
    const transports = config.transports;

    chains.forEach((chain: any) => {
      expect(transports).toHaveProperty(chain.id);
      expect(mockHttp).toHaveBeenCalled();
    });
  });

  it('should create HTTP transport for each chain', () => {
    require('../wagmi');

    const config = mockCreateConfig.mock.calls[0][0];
    const expectedChainCount = 12; // Total number of chains

    // Should call http() for each chain
    expect(mockHttp).toHaveBeenCalledTimes(expectedChainCount);
    expect(mockHttp).toHaveBeenCalledWith();
  });

  it('should export default config', () => {
    const wagmiModule = require('../wagmi');

    expect(wagmiModule.default).toBe(mockWagmiConfig);
  });

  describe('Chain configuration', () => {
    it('should include production chains in correct order', () => {
      require('../wagmi');

      const config = mockCreateConfig.mock.calls[0][0];
      const chains = config.chains;

      // Production chains should come first
      expect(chains[0]).toBe(mainnet);
      expect(chains[1]).toBe(polygon);
      expect(chains[2]).toBe(optimism);
      expect(chains[3]).toBe(arbitrum);
    });

    it('should include testnet chains after production chains', () => {
      require('../wagmi');

      const config = mockCreateConfig.mock.calls[0][0];
      const chains = config.chains;

      const testnetStartIndex = 4; // After 4 mainnet chains
      expect(chains[testnetStartIndex]).toBe(holesky);
      expect(chains[testnetStartIndex + 1]).toBe(sepolia);
    });

    it('should have unique chain IDs', () => {
      require('../wagmi');

      const config = mockCreateConfig.mock.calls[0][0];
      const chainIds = config.chains.map((chain: any) => chain.id);
      const uniqueChainIds = new Set(chainIds);

      expect(chainIds.length).toBe(uniqueChainIds.size);
    });

    it('should have valid chain objects', () => {
      require('../wagmi');

      const config = mockCreateConfig.mock.calls[0][0];
      const chains = config.chains;

      chains.forEach((chain: any) => {
        expect(chain).toHaveProperty('id');
        expect(chain).toHaveProperty('name');
        expect(typeof chain.id).toBe('number');
        expect(typeof chain.name).toBe('string');
        expect(chain.id).toBeGreaterThan(0);
      });
    });
  });

  describe('Transport configuration', () => {
    it('should map each chain ID to HTTP transport', () => {
      require('../wagmi');

      const config = mockCreateConfig.mock.calls[0][0];
      const chains = config.chains;
      const transports = config.transports;

      chains.forEach((chain: any) => {
        expect(transports[chain.id]).toBe(mockTransport);
      });
    });

    it('should not have extra transports for non-configured chains', () => {
      require('../wagmi');

      const config = mockCreateConfig.mock.calls[0][0];
      const chains = config.chains;
      const transports = config.transports;
      const transportKeys = Object.keys(transports);
      const chainIds = chains.map((chain: any) => chain.id.toString());

      expect(transportKeys.sort()).toEqual(chainIds.sort());
    });
  });

  describe('Storage configuration', () => {
    it('should create storage with cookie storage', () => {
      require('../wagmi');

      expect(mockCreateStorage).toHaveBeenCalledWith({
        storage: cookieStorage
      });
    });

    it('should use storage in config', () => {
      require('../wagmi');

      const config = mockCreateConfig.mock.calls[0][0];
      expect(config.storage).toBe(mockStorage);
    });
  });

  describe('SSR configuration', () => {
    it('should enable server-side rendering', () => {
      require('../wagmi');

      const config = mockCreateConfig.mock.calls[0][0];
      expect(config.ssr).toBe(true);
    });
  });

  describe('Module structure', () => {
    it('should have correct imports', () => {
      require('../wagmi');

      expect(mockCreateConfig).toHaveBeenCalled();
      expect(mockCreateStorage).toHaveBeenCalled();
      expect(mockHttp).toHaveBeenCalled();
    });

    it('should export config as default export', () => {
      const wagmiModule = require('../wagmi');

      expect(wagmiModule.default).toBeDefined();
      expect(wagmiModule.default).toBe(mockWagmiConfig);
    });
  });

  describe('Error handling', () => {
    it('should handle createConfig errors', () => {
      mockCreateConfig.mockImplementation(() => {
        throw new Error('Failed to create config');
      });

      expect(() => require('../wagmi')).toThrow('Failed to create config');
    });

    it('should handle http transport creation errors', () => {
      mockHttp.mockImplementation(() => {
        throw new Error('Failed to create transport');
      });

      expect(() => require('../wagmi')).toThrow('Failed to create transport');
    });

    it('should handle storage creation errors', () => {
      mockCreateStorage.mockImplementation(() => {
        throw new Error('Failed to create storage');
      });

      expect(() => require('../wagmi')).toThrow('Failed to create storage');
    });
  });

  describe('Chain network coverage', () => {
    it('should support major L1 networks', () => {
      require('../wagmi');

      const config = mockCreateConfig.mock.calls[0][0];
      const chainIds = config.chains.map((chain: any) => chain.id);

      expect(chainIds).toContain(1); // Ethereum
      expect(chainIds).toContain(137); // Polygon
    });

    it('should support major L2 networks', () => {
      require('../wagmi');

      const config = mockCreateConfig.mock.calls[0][0];
      const chainIds = config.chains.map((chain: any) => chain.id);

      expect(chainIds).toContain(10); // Optimism
      expect(chainIds).toContain(42161); // Arbitrum
    });

    it('should support comprehensive testnet coverage', () => {
      require('../wagmi');

      const config = mockCreateConfig.mock.calls[0][0];
      const chainIds = config.chains.map((chain: any) => chain.id);

      // Major testnets
      expect(chainIds).toContain(11155111); // Sepolia
      expect(chainIds).toContain(17000); // Holesky
      expect(chainIds).toContain(80001); // Polygon Mumbai

      // L2 testnets
      expect(chainIds).toContain(84532); // Base Sepolia
      expect(chainIds).toContain(420); // Optimism Sepolia
      expect(chainIds).toContain(421614); // Arbitrum Sepolia
    });
  });
});