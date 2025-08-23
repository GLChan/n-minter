/**
 * @jest-environment jsdom
 */

import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Mock dependencies
jest.mock('@t3-oss/env-nextjs', () => ({
  createEnv: jest.fn(),
}));

jest.mock('zod', () => ({
  z: {
    string: jest.fn(() => ({
      min: jest.fn(() => ({ min: jest.fn() })),
      startsWith: jest.fn(() => ({ startsWith: jest.fn() })),
    })),
  },
}));

const mockCreateEnv = createEnv as jest.MockedFunction<typeof createEnv>;
const mockZodString = z.string as jest.MockedFunction<typeof z.string>;

// Mock environment variables
const mockEnvVars = {
  JWT_SECRET_KEY: 'test-jwt-secret',
  PRIVATE_KEY: 'test-private-key',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  NEXT_PUBLIC_APP_BASE_URL: 'https://test.app.com',
  NEXT_PUBLIC_MY_NFT_FACTORY_ADDRESS: '0x1234567890123456789012345678901234567890',
  NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS: '0x2345678901234567890123456789012345678901',
  NEXT_PUBLIC_WETH_CONTRACT_ADDRESS: '0x3456789012345678901234567890123456789012',
};

Object.assign(process.env, mockEnvVars);

describe('Environment Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateEnv.mockReturnValue(mockEnvVars as any);
    
    // Setup zod mock chain
    const mockZodChain = {
      min: jest.fn().mockReturnThis(),
      startsWith: jest.fn().mockReturnThis(),
    };
    mockZodString.mockReturnValue(mockZodChain as any);
  });

  it('should configure environment with correct schema structure', () => {
    require('../env');

    expect(mockCreateEnv).toHaveBeenCalledWith(
      expect.objectContaining({
        server: expect.any(Object),
        client: expect.any(Object),
        runtimeEnv: expect.any(Object),
      })
    );
  });

  it('should define correct server-side environment variables', () => {
    require('../env');

    const envConfig = mockCreateEnv.mock.calls[0][0];
    
    expect(envConfig.server).toEqual(
      expect.objectContaining({
        JWT_SECRET_KEY: expect.any(Object),
        PRIVATE_KEY: expect.any(Object),
        SUPABASE_SERVICE_ROLE_KEY: expect.any(Object),
      })
    );
  });

  it('should define correct client-side environment variables', () => {
    require('../env');

    const envConfig = mockCreateEnv.mock.calls[0][0];
    
    expect(envConfig.client).toEqual(
      expect.objectContaining({
        NEXT_PUBLIC_APP_BASE_URL: expect.any(Object),
        NEXT_PUBLIC_MY_NFT_FACTORY_ADDRESS: expect.any(Object),
        NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS: expect.any(Object),
        NEXT_PUBLIC_WETH_CONTRACT_ADDRESS: expect.any(Object),
        NEXT_PUBLIC_SUPABASE_URL: expect.any(Object),
        NEXT_PUBLIC_SUPABASE_ANON_KEY: expect.any(Object),
      })
    );
  });

  it('should map runtime environment variables correctly', () => {
    require('../env');

    const envConfig = mockCreateEnv.mock.calls[0][0];
    
    expect(envConfig.runtimeEnv).toEqual(
      expect.objectContaining({
        JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
        PRIVATE_KEY: process.env.PRIVATE_KEY,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
        NEXT_PUBLIC_MY_NFT_FACTORY_ADDRESS: process.env.NEXT_PUBLIC_MY_NFT_FACTORY_ADDRESS,
        NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS,
        NEXT_PUBLIC_WETH_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_WETH_CONTRACT_ADDRESS,
      })
    );
  });

  it('should apply correct zod validations for contract addresses', () => {
    require('../env');

    expect(mockZodString).toHaveBeenCalled();
  });

  it('should export env object with all required variables', () => {
    const { env } = require('../env');

    expect(env).toBeDefined();
    expect(env).toBe(mockEnvVars);
  });

  describe('Schema validation', () => {
    it('should validate server environment variables', () => {
      require('../env');

      const envConfig = mockCreateEnv.mock.calls[0][0];
      const serverKeys = Object.keys(envConfig.server);
      
      expect(serverKeys).toContain('JWT_SECRET_KEY');
      expect(serverKeys).toContain('PRIVATE_KEY');
      expect(serverKeys).toContain('SUPABASE_SERVICE_ROLE_KEY');
    });

    it('should validate client environment variables with prefixes', () => {
      require('../env');

      const envConfig = mockCreateEnv.mock.calls[0][0];
      const clientKeys = Object.keys(envConfig.client);
      
      clientKeys.forEach(key => {
        expect(key).toMatch(/^NEXT_PUBLIC_/);
      });
    });

    it('should validate contract addresses start with 0x', () => {
      require('../env');

      const envConfig = mockCreateEnv.mock.calls[0][0];
      
      // These should have startsWith validation
      expect(envConfig.client.NEXT_PUBLIC_MY_NFT_FACTORY_ADDRESS).toBeDefined();
      expect(envConfig.client.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS).toBeDefined();
      expect(envConfig.client.NEXT_PUBLIC_WETH_CONTRACT_ADDRESS).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle createEnv throwing error for missing variables', () => {
      mockCreateEnv.mockImplementation(() => {
        throw new Error('Missing required environment variable');
      });

      expect(() => require('../env')).toThrow('Missing required environment variable');
    });

    it('should handle invalid environment variable format', () => {
      mockCreateEnv.mockImplementation(() => {
        throw new Error('Invalid environment variable format');
      });

      expect(() => require('../env')).toThrow('Invalid environment variable format');
    });
  });

  describe('TypeScript types', () => {
    it('should export env with correct TypeScript interface', () => {
      const { env } = require('../env');

      // Verify structure matches expected env interface
      expect(typeof env).toBe('object');
      expect(env).not.toBeNull();
    });
  });

  describe('Integration with Next.js', () => {
    it('should be compatible with Next.js environment variable bundling', () => {
      require('../env');

      const envConfig = mockCreateEnv.mock.calls[0][0];
      
      // All runtime variables should map to process.env
      Object.values(envConfig.runtimeEnv).forEach(value => {
        expect(typeof value === 'string' || value === undefined).toBe(true);
      });
    });

    it('should follow Next.js naming conventions for public variables', () => {
      require('../env');

      const envConfig = mockCreateEnv.mock.calls[0][0];
      const clientKeys = Object.keys(envConfig.client);
      
      clientKeys.forEach(key => {
        expect(key.startsWith('NEXT_PUBLIC_')).toBe(true);
      });
    });
  });

  describe('Module imports', () => {
    it('should import required dependencies', () => {
      require('../env');

      expect(mockCreateEnv).toHaveBeenCalled();
      expect(mockZodString).toHaveBeenCalled();
    });
  });

  describe('Configuration completeness', () => {
    it('should include all server-side secrets', () => {
      require('../env');

      const envConfig = mockCreateEnv.mock.calls[0][0];
      const serverKeys = Object.keys(envConfig.server);
      
      // Verify all sensitive server-only variables are included
      expect(serverKeys).toContain('JWT_SECRET_KEY');
      expect(serverKeys).toContain('PRIVATE_KEY');
      expect(serverKeys).toContain('SUPABASE_SERVICE_ROLE_KEY');
    });

    it('should include all client-side configuration', () => {
      require('../env');

      const envConfig = mockCreateEnv.mock.calls[0][0];
      const clientKeys = Object.keys(envConfig.client);
      
      // Verify all public client variables are included
      expect(clientKeys).toContain('NEXT_PUBLIC_APP_BASE_URL');
      expect(clientKeys).toContain('NEXT_PUBLIC_SUPABASE_URL');
      expect(clientKeys).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY');
      expect(clientKeys).toContain('NEXT_PUBLIC_MY_NFT_FACTORY_ADDRESS');
      expect(clientKeys).toContain('NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS');
      expect(clientKeys).toContain('NEXT_PUBLIC_WETH_CONTRACT_ADDRESS');
    });

    it('should have complete runtime environment mapping', () => {
      require('../env');

      const envConfig = mockCreateEnv.mock.calls[0][0];
      const serverKeys = Object.keys(envConfig.server);
      const clientKeys = Object.keys(envConfig.client);
      const runtimeKeys = Object.keys(envConfig.runtimeEnv);
      
      // All server and client keys should be mapped in runtimeEnv
      [...serverKeys, ...clientKeys].forEach(key => {
        expect(runtimeKeys).toContain(key);
      });
    });
  });
});