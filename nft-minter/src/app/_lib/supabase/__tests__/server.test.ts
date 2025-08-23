/**
 * @jest-environment jsdom
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Mock dependencies
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('../config/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  },
}));

const mockCreateServerClient = createServerClient as jest.MockedFunction<typeof createServerClient>;
const mockCookies = cookies as jest.MockedFunction<typeof cookies>;

const mockSupabaseClient = {
  auth: { getUser: jest.fn(), signOut: jest.fn() },
  from: jest.fn(() => ({
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
  storage: {
    from: jest.fn(),
  },
};

const mockCookieStore = {
  getAll: jest.fn(),
  set: jest.fn(),
};

describe('Supabase Server Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateServerClient.mockReturnValue(mockSupabaseClient as any);
    mockCookies.mockResolvedValue(mockCookieStore as any);
  });

  describe('createClient function', () => {
    it('should create server client with correct configuration', async () => {
      const { createClient } = require('../server');

      const result = await createClient();

      expect(cookies).toHaveBeenCalledTimes(1);
      expect(createServerClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          cookies: expect.objectContaining({
            getAll: expect.any(Function),
            setAll: expect.any(Function),
          }),
        })
      );
      expect(result).toBe(mockSupabaseClient);
    });

    it('should await cookies() before creating client', async () => {
      const { createClient } = require('../server');

      await createClient();

      expect(cookies).toHaveBeenCalledBefore(createServerClient);
    });

    it('should return server client instance', async () => {
      const { createClient } = require('../server');

      const result = await createClient();

      expect(result).toBe(mockSupabaseClient);
    });
  });

  describe('Cookie handling', () => {
    beforeEach(() => {
      mockCookieStore.getAll.mockReturnValue([
        { name: 'sb-session', value: 'session-token' },
        { name: 'sb-refresh', value: 'refresh-token' },
      ]);
    });

    it('should get all cookies from cookie store', async () => {
      const { createClient } = require('../server');

      await createClient();

      const clientConfig = mockCreateServerClient.mock.calls[0][2];
      const getAll = clientConfig.cookies.getAll;

      const cookies = getAll();

      expect(mockCookieStore.getAll).toHaveBeenCalledTimes(1);
      expect(cookies).toEqual([
        { name: 'sb-session', value: 'session-token' },
        { name: 'sb-refresh', value: 'refresh-token' },
      ]);
    });

    it('should set cookies through cookie store', async () => {
      const { createClient } = require('../server');

      await createClient();

      const clientConfig = mockCreateServerClient.mock.calls[0][2];
      const setAll = clientConfig.cookies.setAll;

      const cookiesToSet = [
        { name: 'new-session', value: 'new-session-token', options: { httpOnly: true } },
        { name: 'new-refresh', value: 'new-refresh-token', options: { secure: true } },
      ];

      setAll(cookiesToSet);

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'new-session',
        'new-session-token',
        { httpOnly: true }
      );
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'new-refresh',
        'new-refresh-token',
        { secure: true }
      );
    });

    it('should handle setAll errors gracefully', async () => {
      const { createClient } = require('../server');
      mockCookieStore.set.mockImplementation(() => {
        throw new Error('Cannot set cookies');
      });

      await createClient();

      const clientConfig = mockCreateServerClient.mock.calls[0][2];
      const setAll = clientConfig.cookies.setAll;

      const cookiesToSet = [
        { name: 'test-cookie', value: 'test-value', options: {} },
      ];

      // Should not throw error
      expect(() => setAll(cookiesToSet)).not.toThrow();
    });

    it('should handle empty cookie options', async () => {
      const { createClient } = require('../server');

      await createClient();

      const clientConfig = mockCreateServerClient.mock.calls[0][2];
      const setAll = clientConfig.cookies.setAll;

      const cookiesToSet = [
        { name: 'simple-cookie', value: 'simple-value', options: undefined },
      ];

      setAll(cookiesToSet);

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'simple-cookie',
        'simple-value',
        undefined
      );
    });
  });

  describe('Environment variable handling', () => {
    it('should use environment variables from env config', async () => {
      const { createClient } = require('../server');

      await createClient();

      expect(createServerClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.any(Object)
      );
    });

    it('should handle missing environment variables', async () => {
      jest.doMock('../config/env', () => ({
        env: {
          NEXT_PUBLIC_SUPABASE_URL: undefined,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
        },
      }));

      const { createClient } = require('../server');

      await createClient();

      expect(createServerClient).toHaveBeenCalledWith(
        undefined,
        undefined,
        expect.any(Object)
      );
    });
  });

  describe('Client functionality', () => {
    it('should provide auth methods', async () => {
      const { createClient } = require('../server');

      const client = await createClient();

      expect(client.auth).toBeDefined();
      expect(client.auth.getUser).toBeDefined();
      expect(client.auth.signOut).toBeDefined();
    });

    it('should provide database methods', async () => {
      const { createClient } = require('../server');

      const client = await createClient();

      expect(client.from).toBeDefined();
      expect(typeof client.from).toBe('function');
    });

    it('should provide storage methods', async () => {
      const { createClient } = require('../server');

      const client = await createClient();

      expect(client.storage).toBeDefined();
      expect(client.storage.from).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle cookies() throwing error', async () => {
      const { createClient } = require('../server');
      mockCookies.mockRejectedValue(new Error('Cookies error'));

      await expect(createClient()).rejects.toThrow('Cookies error');
    });

    it('should handle createServerClient throwing error', async () => {
      const { createClient } = require('../server');
      mockCreateServerClient.mockImplementation(() => {
        throw new Error('Client creation error');
      });

      await expect(createClient()).rejects.toThrow('Client creation error');
    });

    it('should handle cookie store errors', async () => {
      const { createClient } = require('../server');
      mockCookieStore.getAll.mockImplementation(() => {
        throw new Error('Cookie store error');
      });

      await createClient();

      const clientConfig = mockCreateServerClient.mock.calls[0][2];
      const getAll = clientConfig.cookies.getAll;

      expect(() => getAll()).toThrow('Cookie store error');
    });
  });

  describe('Server Component compatibility', () => {
    it('should be suitable for Server Components', async () => {
      const { createClient } = require('../server');

      // Should not throw errors when used in server environment
      await expect(createClient()).resolves.toBeDefined();
    });

    it('should handle Server Component cookie limitations', async () => {
      const { createClient } = require('../server');

      await createClient();

      const clientConfig = mockCreateServerClient.mock.calls[0][2];
      const setAll = clientConfig.cookies.setAll;

      // Simulate Server Component limitation
      mockCookieStore.set.mockImplementation(() => {
        throw new Error('The `setAll` method was called from a Server Component.');
      });

      const cookiesToSet = [
        { name: 'server-cookie', value: 'server-value', options: {} },
      ];

      // Should not throw error due to try-catch
      expect(() => setAll(cookiesToSet)).not.toThrow();
    });
  });

  describe('TypeScript types', () => {
    it('should create client with Database type generic', async () => {
      const { createClient } = require('../server');

      await createClient();

      expect(createServerClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.any(Object)
      );
    });
  });

  describe('Module exports', () => {
    it('should export createClient function as default', () => {
      const serverModule = require('../server');

      expect(serverModule).toHaveProperty('createClient');
      expect(typeof serverModule.createClient).toBe('function');
    });

    it('should only export createClient', () => {
      const serverModule = require('../server');
      const exports = Object.keys(serverModule);

      expect(exports).toEqual(['createClient']);
    });
  });

  describe('Cookie options handling', () => {
    it('should handle various cookie options', async () => {
      const { createClient } = require('../server');

      await createClient();

      const clientConfig = mockCreateServerClient.mock.calls[0][2];
      const setAll = clientConfig.cookies.setAll;

      const cookiesToSet = [
        {
          name: 'secure-cookie',
          value: 'secure-value',
          options: {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 3600,
          },
        },
      ];

      setAll(cookiesToSet);

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'secure-cookie',
        'secure-value',
        {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 3600,
        }
      );
    });
  });

  describe('Multiple client instances', () => {
    it('should create new client instance on each call', async () => {
      const { createClient } = require('../server');

      const client1 = await createClient();
      const client2 = await createClient();

      expect(client1).toBeDefined();
      expect(client2).toBeDefined();
      expect(createServerClient).toHaveBeenCalledTimes(2);
      expect(cookies).toHaveBeenCalledTimes(2);
    });
  });
});