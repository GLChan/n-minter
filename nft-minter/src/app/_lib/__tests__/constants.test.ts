import {
  sessionCookieName,
  secureCookieName,
  PINATA_IPFS_GATEWAY_BASE,
  COOKIE_KEYS,
  EMITTER_EVENTS,
  JWT_CONFIG,
  MY_NFT_FACTORY_ABI,
  MY_NFT_FACTORY_ADDRESS,
  MARKETPLACE_ABI,
  MARKETPLACE_CONTRACT_ADDRESS,
  MARKETPLACE_NAME,
  MARKETPLACE_VERSION,
  MY_NFT_ABI,
  ERC20_ABI,
  CHAINS_MAP,
  ZERO_ADDRESS,
  SECONDS_IN_A_DAY
} from '../constants';

describe('Constants', () => {
  describe('Cookie names', () => {
    it('should have correct cookie names', () => {
      expect(sessionCookieName).toBe('session');
      expect(secureCookieName).toBe('secure');
    });
  });

  describe('IPFS Gateway', () => {
    it('should have correct IPFS gateway URL', () => {
      expect(PINATA_IPFS_GATEWAY_BASE).toBe('https://azure-many-sole-7.mypinata.cloud/ipfs/');
      expect(PINATA_IPFS_GATEWAY_BASE).toMatch(/^https:\/\//);
    });
  });

  describe('Cookie keys', () => {
    it('should have correct cookie keys', () => {
      expect(COOKIE_KEYS.JWT).toBe('jwt');
      expect(typeof COOKIE_KEYS).toBe('object');
    });
  });

  describe('Emitter events', () => {
    it('should have correct event names', () => {
      expect(EMITTER_EVENTS.SIGN_IN).toBe('sign_in');
      expect(EMITTER_EVENTS.SIGN_OUT).toBe('sign_out');
    });
  });

  describe('JWT Configuration', () => {
    it('should have JWT config properties', () => {
      expect(JWT_CONFIG.ISSUER).toBe('YOUR_ISSUER');
      expect(JWT_CONFIG.AUDIENCE).toBe('YOUR_AUDIENCE');
    });
  });

  describe('Smart Contract ABIs', () => {
    it('should have NFT Factory ABI', () => {
      expect(MY_NFT_FACTORY_ABI).toBeDefined();
      expect(Array.isArray(MY_NFT_FACTORY_ABI)).toBe(true);
    });

    it('should have Marketplace ABI', () => {
      expect(MARKETPLACE_ABI).toBeDefined();
      expect(Array.isArray(MARKETPLACE_ABI)).toBe(true);
    });

    it('should have MyNFT ABI', () => {
      expect(MY_NFT_ABI).toBeDefined();
      expect(Array.isArray(MY_NFT_ABI)).toBe(true);
    });

    it('should have ERC20 ABI', () => {
      expect(ERC20_ABI).toBeDefined();
      expect(Array.isArray(ERC20_ABI)).toBe(true);
      expect(ERC20_ABI.length).toBeGreaterThan(0);
    });

    it('should have essential ERC20 functions', () => {
      const functionNames = ERC20_ABI.map(item => item.name).filter(Boolean);
      expect(functionNames).toContain('allowance');
      expect(functionNames).toContain('approve');
    });

    it('should have essential Marketplace functions', () => {
      const functionNames = MARKETPLACE_ABI.map(item => item.name).filter(Boolean);
      expect(functionNames.length).toBeGreaterThan(0);
    });
  });

  describe('Contract Addresses', () => {
    it('should have valid contract addresses', () => {
      expect(MY_NFT_FACTORY_ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(MARKETPLACE_CONTRACT_ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });
  });

  describe('Marketplace Info', () => {
    it('should have marketplace metadata', () => {
      expect(MARKETPLACE_NAME).toBe('GL NFT Marketplace');
      expect(MARKETPLACE_VERSION).toBe('1.0');
    });
  });

  describe('Chain Map', () => {
    it('should have correct chain mappings', () => {
      expect(CHAINS_MAP['1']).toBe('mainnet');
      expect(CHAINS_MAP['137']).toBe('polygon');
      expect(CHAINS_MAP['10']).toBe('optimism');
      expect(CHAINS_MAP['42161']).toBe('arbitrum');
      expect(CHAINS_MAP['11155111']).toBe('sepolia');
    });

    it('should have numeric keys as strings', () => {
      Object.keys(CHAINS_MAP).forEach(key => {
        expect(typeof key).toBe('string');
        expect(/^\d+$/.test(key)).toBe(true);
      });
    });

    it('should have string values', () => {
      Object.values(CHAINS_MAP).forEach(value => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Common Constants', () => {
    it('should have correct zero address', () => {
      expect(ZERO_ADDRESS).toBe('0x0000000000000000000000000000000000000000');
      expect(ZERO_ADDRESS).toMatch(/^0x0+$/);
      expect(ZERO_ADDRESS.length).toBe(42);
    });

    it('should have correct seconds in a day', () => {
      expect(SECONDS_IN_A_DAY).toBe(86400);
      expect(SECONDS_IN_A_DAY).toBe(24 * 60 * 60);
    });
  });

  describe('Type validations', () => {
    it('should have correct types for all constants', () => {
      expect(typeof sessionCookieName).toBe('string');
      expect(typeof secureCookieName).toBe('string');
      expect(typeof PINATA_IPFS_GATEWAY_BASE).toBe('string');
      expect(typeof MARKETPLACE_NAME).toBe('string');
      expect(typeof MARKETPLACE_VERSION).toBe('string');
      expect(typeof ZERO_ADDRESS).toBe('string');
      expect(typeof SECONDS_IN_A_DAY).toBe('number');
      expect(typeof COOKIE_KEYS).toBe('object');
      expect(typeof EMITTER_EVENTS).toBe('object');
      expect(typeof JWT_CONFIG).toBe('object');
      expect(typeof CHAINS_MAP).toBe('object');
    });
  });
});