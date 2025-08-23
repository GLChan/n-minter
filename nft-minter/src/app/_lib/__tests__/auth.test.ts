/**
 * @jest-environment jsdom
 */

import NextAuth from 'next-auth';

// Mock dependencies
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('./data-service', () => ({
  createGuest: jest.fn(),
  getProfileByWallet: jest.fn(),
}));

const mockNextAuth = NextAuth as jest.MockedFunction<typeof NextAuth>;
const mockCreateGuest = require('./data-service').createGuest;
const mockGetProfileByWallet = require('./data-service').getProfileByWallet;

const mockAuthResult = {
  auth: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  handlers: { GET: jest.fn(), POST: jest.fn() },
};

describe('Auth Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNextAuth.mockReturnValue(mockAuthResult);
  });

  it('should configure NextAuth with correct options', () => {
    require('../auth');

    expect(mockNextAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        providers: expect.arrayContaining([]),
        callbacks: expect.objectContaining({
          authorized: expect.any(Function),
          signIn: expect.any(Function),
          session: expect.any(Function),
        }),
        pages: expect.objectContaining({
          signIn: '/login',
        }),
      })
    );
  });

  it('should export auth functions from NextAuth', () => {
    const authModule = require('../auth');

    expect(authModule).toHaveProperty('auth');
    expect(authModule).toHaveProperty('signIn');
    expect(authModule).toHaveProperty('signOut');
    expect(authModule).toHaveProperty('handlers');
  });

  describe('authorized callback', () => {
    let authorizedCallback: Function;

    beforeEach(() => {
      require('../auth');
      const authConfig = mockNextAuth.mock.calls[0][0];
      authorizedCallback = authConfig.callbacks.authorized;
    });

    it('should return true when user is authenticated', () => {
      const auth = { user: { id: 'user-123' } };
      const request = {} as Request;

      const result = authorizedCallback({ auth, request });

      expect(result).toBe(true);
    });

    it('should return false when user is not authenticated', () => {
      const auth = { user: null };
      const request = {} as Request;

      const result = authorizedCallback({ auth, request });

      expect(result).toBe(false);
    });

    it('should return false when auth is null', () => {
      const auth = null;
      const request = {} as Request;

      const result = authorizedCallback({ auth, request });

      expect(result).toBe(false);
    });
  });

  describe('signIn callback', () => {
    let signInCallback: Function;

    beforeEach(() => {
      require('../auth');
      const authConfig = mockNextAuth.mock.calls[0][0];
      signInCallback = authConfig.callbacks.signIn;
    });

    it('should return true when guest creation is successful for new user', async () => {
      const user = { wallet_address: '0x123456789abcdef' };
      const account = { provider: 'ethereum' };
      const profile = { name: 'Test User' };

      mockGetProfileByWallet.mockResolvedValue(null); // User doesn't exist
      mockCreateGuest.mockResolvedValue({ id: 'guest-123' });

      const result = await signInCallback({ user, account, profile });

      expect(mockGetProfileByWallet).toHaveBeenCalledWith('0x123456789abcdef');
      expect(mockCreateGuest).toHaveBeenCalledWith({
        wallet_address: '0x123456789abcdef',
      });
      expect(result).toBe(true);
    });

    it('should return true when user already exists', async () => {
      const user = { wallet_address: '0x123456789abcdef' };
      const account = { provider: 'ethereum' };
      const profile = { name: 'Test User' };

      mockGetProfileByWallet.mockResolvedValue({ id: 'existing-user' });

      const result = await signInCallback({ user, account, profile });

      expect(mockGetProfileByWallet).toHaveBeenCalledWith('0x123456789abcdef');
      expect(mockCreateGuest).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when getProfileByWallet throws error', async () => {
      const user = { wallet_address: '0x123456789abcdef' };
      const account = { provider: 'ethereum' };
      const profile = { name: 'Test User' };

      mockGetProfileByWallet.mockRejectedValue(new Error('Database error'));

      const result = await signInCallback({ user, account, profile });

      expect(result).toBe(false);
    });

    it('should return false when createGuest throws error', async () => {
      const user = { wallet_address: '0x123456789abcdef' };
      const account = { provider: 'ethereum' };
      const profile = { name: 'Test User' };

      mockGetProfileByWallet.mockResolvedValue(null);
      mockCreateGuest.mockRejectedValue(new Error('Creation error'));

      const result = await signInCallback({ user, account, profile });

      expect(result).toBe(false);
    });

    it('should handle undefined user wallet_address', async () => {
      const user = {};
      const account = { provider: 'ethereum' };
      const profile = { name: 'Test User' };

      mockGetProfileByWallet.mockResolvedValue(null);

      const result = await signInCallback({ user, account, profile });

      expect(mockGetProfileByWallet).toHaveBeenCalledWith(undefined);
      expect(result).toBe(false);
    });
  });

  describe('session callback', () => {
    let sessionCallback: Function;

    beforeEach(() => {
      require('../auth');
      const authConfig = mockNextAuth.mock.calls[0][0];
      sessionCallback = authConfig.callbacks.session;
    });

    it('should add user id to session from profile', async () => {
      const session = {
        user: { wallet_address: '0x123456789abcdef', name: 'Test User' },
      };
      const user = { id: 'user-123' };

      const mockProfile = { id: 'profile-123', wallet_address: '0x123456789abcdef' };
      mockGetProfileByWallet.mockResolvedValue(mockProfile);

      const result = await sessionCallback({ session, user });

      expect(mockGetProfileByWallet).toHaveBeenCalledWith('0x123456789abcdef');
      expect(result.user.id).toBe('profile-123');
      expect(result.user.name).toBe('Test User'); // Original session data preserved
    });

    it('should handle getProfileByWallet error gracefully', async () => {
      const session = {
        user: { wallet_address: '0x123456789abcdef', name: 'Test User' },
      };
      const user = { id: 'user-123' };

      mockGetProfileByWallet.mockRejectedValue(new Error('Database error'));

      // Should not throw, but we can't test the exact behavior since error is caught
      await expect(sessionCallback({ session, user })).resolves.toBeDefined();
    });

    it('should handle missing wallet_address in session', async () => {
      const session = {
        user: { name: 'Test User' },
      };
      const user = { id: 'user-123' };

      mockGetProfileByWallet.mockResolvedValue(null);

      const result = await sessionCallback({ session, user });

      expect(mockGetProfileByWallet).toHaveBeenCalledWith(undefined);
      expect(result).toBeDefined();
    });
  });

  describe('providers configuration', () => {
    it('should have empty providers array', () => {
      require('../auth');
      const authConfig = mockNextAuth.mock.calls[0][0];

      expect(authConfig.providers).toEqual([]);
    });
  });

  describe('pages configuration', () => {
    it('should set correct sign-in page', () => {
      require('../auth');
      const authConfig = mockNextAuth.mock.calls[0][0];

      expect(authConfig.pages.signIn).toBe('/login');
    });
  });

  describe('error handling', () => {
    it('should handle various error types in signIn callback', async () => {
      require('../auth');
      const authConfig = mockNextAuth.mock.calls[0][0];
      const signInCallback = authConfig.callbacks.signIn;

      const user = { wallet_address: '0x123456789abcdef' };
      const account = { provider: 'ethereum' };
      const profile = { name: 'Test User' };

      // Test different error scenarios
      const errorScenarios = [
        () => mockGetProfileByWallet.mockRejectedValue(new Error('Network error')),
        () => mockGetProfileByWallet.mockRejectedValue(new TypeError('Type error')),
        () => mockGetProfileByWallet.mockRejectedValue('String error'),
        () => mockGetProfileByWallet.mockRejectedValue(null),
      ];

      for (const scenario of errorScenarios) {
        scenario();
        const result = await signInCallback({ user, account, profile });
        expect(result).toBe(false);
      }
    });
  });

  describe('module integration', () => {
    it('should handle NextAuth configuration as AuthOptions type', () => {
      require('../auth');
      const authConfig = mockNextAuth.mock.calls[0][0];

      // Verify the structure matches AuthOptions interface
      expect(authConfig).toHaveProperty('providers');
      expect(authConfig).toHaveProperty('callbacks');
      expect(authConfig).toHaveProperty('pages');

      expect(Array.isArray(authConfig.providers)).toBe(true);
      expect(typeof authConfig.callbacks).toBe('object');
      expect(typeof authConfig.pages).toBe('object');
    });
  });
});