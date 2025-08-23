/**
 * @jest-environment node
 */

import { createClient } from '@supabase/supabase-js';

// Mock dependencies
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/app/_lib/types/database.types', () => ({
  Database: {},
}));

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockSupabaseClient = {
  auth: { signIn: jest.fn() },
  from: jest.fn(),
};

describe('Supabase Admin Client', () => {
  const originalConsoleWarn = console.warn;
  let originalWindow: any;

  beforeAll(() => {
    originalWindow = (global as any).window;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    console.warn = jest.fn();
    mockCreateClient.mockReturnValue(mockSupabaseClient as any);
    jest.resetModules();
  });

  afterEach(() => {
    console.warn = originalConsoleWarn;
    jest.dontMock('../../config/env');
  });

  afterAll(() => {
    if (originalWindow) {
      (global as any).window = originalWindow;
    }
  });

  describe('Server-side initialization', () => {
    beforeEach(() => {
      // Ensure server environment (no window)
      delete (global as any).window;
    });

    it('should initialize admin client with correct configuration', async () => {
      jest.doMock('../../config/env', () => ({
        env: {
          NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
          SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        },
      }));

      const { supabaseAdmin } = await import('../admin');

      expect(createClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-service-role-key',
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );
      expect(supabaseAdmin).toBe(mockSupabaseClient);
    });

    it('should warn when environment variables are missing', async () => {
      jest.doMock('../../config/env', () => ({
        env: {
          NEXT_PUBLIC_SUPABASE_URL: '',
          SUPABASE_SERVICE_ROLE_KEY: '',
        },
      }));

      const { supabaseAdmin } = await import('../admin');

      expect(console.warn).toHaveBeenCalledWith(
        'Supabase Admin Client: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. ' +
        'The admin client will not be functional. Ensure these are set in your server environment.'
      );
      expect(supabaseAdmin).toBeNull();
    });

    it('should warn when SUPABASE_URL is missing', async () => {
      jest.doMock('../../config/env', () => ({
        env: {
          NEXT_PUBLIC_SUPABASE_URL: undefined,
          SUPABASE_SERVICE_ROLE_KEY: 'test-key',
        },
      }));

      const { supabaseAdmin } = await import('../admin');

      expect(console.warn).toHaveBeenCalledWith(
        'Supabase Admin Client: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. ' +
        'The admin client will not be functional. Ensure these are set in your server environment.'
      );
      expect(supabaseAdmin).toBeNull();
    });

    it('should warn when SERVICE_ROLE_KEY is missing', async () => {
      jest.doMock('../../config/env', () => ({
        env: {
          NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
          SUPABASE_SERVICE_ROLE_KEY: undefined,
        },
      }));

      const { supabaseAdmin } = await import('../admin');

      expect(console.warn).toHaveBeenCalledWith(
        'Supabase Admin Client: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. ' +
        'The admin client will not be functional. Ensure these are set in your server environment.'
      );
      expect(supabaseAdmin).toBeNull();
    });

    it('should handle empty string environment variables', async () => {
      jest.doMock('../../config/env', () => ({
        env: {
          NEXT_PUBLIC_SUPABASE_URL: '',
          SUPABASE_SERVICE_ROLE_KEY: 'valid-key',
        },
      }));

      const { supabaseAdmin } = await import('../admin');

      expect(console.warn).toHaveBeenCalled();
      expect(supabaseAdmin).toBeNull();
    });

    it('should handle null environment variables', async () => {
      jest.doMock('../../config/env', () => ({
        env: {
          NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
          SUPABASE_SERVICE_ROLE_KEY: null,
        },
      }));

      const { supabaseAdmin } = await import('../admin');

      expect(console.warn).toHaveBeenCalled();
      expect(supabaseAdmin).toBeNull();
    });
  });

  describe('Client-side initialization', () => {
    beforeEach(() => {
      // Simulate browser environment
      (global as any).window = {};
    });

    afterEach(() => {
      delete (global as any).window;
    });

    it('should warn when imported on client-side', async () => {
      jest.doMock('../../config/env', () => ({
        env: {
          NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
          SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        },
      }));

      const { supabaseAdmin } = await import('../admin');

      expect(console.warn).toHaveBeenCalledWith(
        'Supabase admin client is being referenced on the client-side. This should not happen.'
      );
      expect(supabaseAdmin).toBeNull();
      expect(createClient).not.toHaveBeenCalled();
    });
  });

  describe('getSupabaseAdmin helper function', () => {
    beforeEach(() => {
      delete (global as any).window;
    });

    it('should return admin client when properly initialized', async () => {
      jest.doMock('../../config/env', () => ({
        env: {
          NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
          SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        },
      }));

      const { getSupabaseAdmin } = await import('../admin');

      const result = getSupabaseAdmin();

      expect(result).toBe(mockSupabaseClient);
    });

    it('should throw error when admin client is not initialized', async () => {
      jest.doMock('../../config/env', () => ({
        env: {
          NEXT_PUBLIC_SUPABASE_URL: '',
          SUPABASE_SERVICE_ROLE_KEY: '',
        },
      }));

      const { getSupabaseAdmin } = await import('../admin');

      expect(() => getSupabaseAdmin()).toThrow(
        'Supabase Admin Client is not initialized. ' +
        'Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set for server-side operations.'
      );
    });
  });

  describe('Module exports', () => {
    beforeEach(() => {
      delete (global as any).window;
    });

    it('should export supabaseAdmin and getSupabaseAdmin', async () => {
      jest.doMock('../../config/env', () => ({
        env: {
          NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
          SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        },
      }));

      const adminModule = await import('../admin');

      expect(adminModule).toHaveProperty('supabaseAdmin');
      expect(adminModule).toHaveProperty('getSupabaseAdmin');
      expect(typeof adminModule.getSupabaseAdmin).toBe('function');
    });
  });

  describe('Module singleton behavior', () => {
    beforeEach(() => {
      delete (global as any).window;
    });

    it('should only initialize once in same process', async () => {
      jest.doMock('../../config/env', () => ({
        env: {
          NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
          SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
        },
      }));

      const module1 = await import('../admin');
      const module2 = await import('../admin');

      expect(module1.supabaseAdmin).toBe(module2.supabaseAdmin);
      expect(createClient).toHaveBeenCalledTimes(1);
    });
  });
});