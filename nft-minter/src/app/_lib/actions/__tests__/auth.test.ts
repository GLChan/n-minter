/**
 * @jest-environment jsdom
 */

import { cookies } from 'next/headers';
import { signInAction, signOutAction, isAuthAction } from '../auth';

// Mock dependencies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('../../constants', () => ({
  COOKIE_KEYS: {
    JWT: 'jwt-cookie-key',
  },
}));

jest.mock('../../supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('../../utils', () => ({
  generateWalletP: jest.fn(),
}));

jest.mock('../../actions', () => ({
  doesUserExistByWalletAddress: jest.fn(),
}));

jest.mock('../../supabase/admin', () => ({
  getSupabaseAdmin: jest.fn(),
}));

const mockCookies = cookies as jest.MockedFunction<typeof cookies>;
const mockCreateClient = require('../../supabase/server').createClient;
const mockGenerateWalletP = require('../../utils').generateWalletP;
const mockDoesUserExistByWalletAddress = require('../../actions').doesUserExistByWalletAddress;
const mockGetSupabaseAdmin = require('../../supabase/admin').getSupabaseAdmin;

const mockCookieStore = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
};

const mockSupabaseClient = {
  auth: {
    signInWithPassword: jest.fn(),
    setSession: jest.fn(),
    signOut: jest.fn(),
  },
  from: jest.fn().mockReturnValue({
    insert: jest.fn().mockResolvedValue({ data: null, error: null }),
  }),
};

const mockSupabaseAdmin = {
  auth: {
    admin: {
      createUser: jest.fn(),
    },
  },
};

describe('Auth Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCookies.mockResolvedValue(mockCookieStore as any);
    mockCreateClient.mockResolvedValue(mockSupabaseClient);
    mockGetSupabaseAdmin.mockReturnValue(mockSupabaseAdmin);
    mockGenerateWalletP.mockReturnValue('generated-password');
  });

  describe('signInAction', () => {
    const signInParams = {
      address: '0x123456789abcdef',
      chainId: 1,
      nonce: 'test-nonce',
    };

    it('should sign in existing user successfully', async () => {
      mockDoesUserExistByWalletAddress.mockResolvedValue(true);
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          session: {
            access_token: 'access-token',
            refresh_token: 'refresh-token',
          },
        },
        error: null,
      });

      await signInAction(signInParams);

      expect(mockDoesUserExistByWalletAddress).toHaveBeenCalledWith('0x123456789abcdef');
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: '0x123456789abcdef@ethereum.wallet',
        password: 'generated-password',
      });
      expect(mockCookieStore.set).toHaveBeenCalledWith('jwt-cookie-key', 'access-token', {
        secure: true,
      });
    });

    it('should create and sign in new user successfully', async () => {
      mockDoesUserExistByWalletAddress.mockResolvedValue(false);
      mockSupabaseAdmin.auth.admin.createUser.mockResolvedValue({
        data: {
          user: { id: 'new-user-id' },
        },
        error: null,
      });
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          session: {
            access_token: 'access-token',
            refresh_token: 'refresh-token',
          },
        },
        error: null,
      });

      await signInAction(signInParams);

      expect(mockSupabaseAdmin.auth.admin.createUser).toHaveBeenCalledWith({
        email: '0x123456789abcdef@ethereum.wallet',
        password: 'generated-password',
        email_confirm: true,
        user_metadata: {
          wallet_address: '0x123456789abcdef',
        },
      });

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
    });

    it('should return error when user creation fails', async () => {
      mockDoesUserExistByWalletAddress.mockResolvedValue(false);
      mockSupabaseAdmin.auth.admin.createUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'User creation failed' },
      });

      const result = await signInAction(signInParams);

      expect(result).toEqual({
        success: false,
        error: { message: 'User creation failed' },
      });
    });

    it('should return error when profile creation fails', async () => {
      mockDoesUserExistByWalletAddress.mockResolvedValue(false);
      mockSupabaseAdmin.auth.admin.createUser.mockResolvedValue({
        data: { user: { id: 'new-user-id' } },
        error: null,
      });

      const mockProfileInsert = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Profile creation failed' },
      });
      mockSupabaseClient.from.mockReturnValue({ insert: mockProfileInsert });

      const result = await signInAction(signInParams);

      expect(result).toEqual({
        success: false,
        error: { message: 'Profile creation failed' },
      });
    });

    it('should return error when sign in fails', async () => {
      mockDoesUserExistByWalletAddress.mockResolvedValue(true);
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Sign in failed' },
      });

      const result = await signInAction(signInParams);

      expect(result).toEqual({
        success: false,
        error: { message: 'Sign in failed' },
      });
    });

    it('should set session after successful sign in', async () => {
      mockDoesUserExistByWalletAddress.mockResolvedValue(true);
      const mockSessionData = {
        session: {
          access_token: 'access-token',
          refresh_token: 'refresh-token',
        },
      };
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: mockSessionData,
        error: null,
      });

      await signInAction(signInParams);

      expect(mockSupabaseClient.auth.setSession).toHaveBeenCalledWith({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      });
    });

    it('should generate correct email and password', async () => {
      mockDoesUserExistByWalletAddress.mockResolvedValue(true);
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { session: { access_token: 'token', refresh_token: 'refresh' } },
        error: null,
      });

      await signInAction(signInParams);

      expect(mockGenerateWalletP).toHaveBeenCalledWith('0x123456789abcdef');
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: '0x123456789abcdef@ethereum.wallet',
        password: 'generated-password',
      });
    });

    it('should create profile with correct data for new user', async () => {
      mockDoesUserExistByWalletAddress.mockResolvedValue(false);
      mockSupabaseAdmin.auth.admin.createUser.mockResolvedValue({
        data: { user: { id: 'new-user-id' } },
        error: null,
      });

      const mockProfileInsert = jest.fn().mockResolvedValue({ data: null, error: null });
      mockSupabaseClient.from.mockReturnValue({ insert: mockProfileInsert });

      await signInAction(signInParams);

      expect(mockProfileInsert).toHaveBeenCalledWith({
        id: 'new-user-id',
        avatar_url: 'https://mzmlztcizgitmitugcdk.supabase.co/storage/v1/object/public/avatars//avatar.png',
        wallet_address: '0x123456789abcdef',
        username: 'user_123456',
      });
    });

    it('should handle mixed case wallet addresses', async () => {
      const upperCaseParams = {
        ...signInParams,
        address: '0X123456789ABCDEF',
      };

      mockDoesUserExistByWalletAddress.mockResolvedValue(true);
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { session: { access_token: 'token', refresh_token: 'refresh' } },
        error: null,
      });

      await signInAction(upperCaseParams);

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: '0x123456789abcdef@ethereum.wallet',
        password: 'generated-password',
      });
    });
  });

  describe('signOutAction', () => {
    it('should sign out user successfully', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });

      await signOutAction();

      expect(mockCookieStore.delete).toHaveBeenCalledWith('jwt-cookie-key');
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
    });

    it('should handle sign out errors gracefully', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: { message: 'Sign out failed' },
      });

      // Should not throw error
      await expect(signOutAction()).resolves.toBeUndefined();
      expect(mockCookieStore.delete).toHaveBeenCalledWith('jwt-cookie-key');
    });

    it('should delete JWT cookie before signing out', async () => {
      const deleteOrder = [];
      mockCookieStore.delete.mockImplementation(() => deleteOrder.push('delete'));
      mockSupabaseClient.auth.signOut.mockImplementation(() => {
        deleteOrder.push('signOut');
        return Promise.resolve({ error: null });
      });

      await signOutAction();

      expect(deleteOrder).toEqual(['delete', 'signOut']);
    });
  });

  describe('isAuthAction', () => {
    it('should return auth status when JWT cookie exists', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'test-jwt-token' });

      const result = await isAuthAction();

      expect(mockCookieStore.get).toHaveBeenCalledWith('jwt-cookie-key');
      expect(result).toEqual({
        isAuth: true,
        jwt: 'test-jwt-token',
      });
    });

    it('should return false auth status when JWT cookie does not exist', async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const result = await isAuthAction();

      expect(result).toEqual({
        isAuth: false,
        jwt: undefined,
      });
    });

    it('should return false auth status when JWT cookie is empty', async () => {
      mockCookieStore.get.mockReturnValue({ value: '' });

      const result = await isAuthAction();

      expect(result).toEqual({
        isAuth: false,
        jwt: '',
      });
    });

    it('should handle cookie access errors gracefully', async () => {
      mockCookies.mockRejectedValue(new Error('Cookie access failed'));

      await expect(isAuthAction()).rejects.toThrow('Cookie access failed');
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle wallet address without 0x prefix', async () => {
      const paramsWithoutPrefix = {
        address: '123456789abcdef',
        chainId: 1,
        nonce: 'test-nonce',
      };

      mockDoesUserExistByWalletAddress.mockResolvedValue(true);
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { session: { access_token: 'token', refresh_token: 'refresh' } },
        error: null,
      });

      await signInAction(paramsWithoutPrefix);

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: '123456789abcdef@ethereum.wallet',
        password: 'generated-password',
      });
    });

    it('should handle cookies() throwing error in signOutAction', async () => {
      mockCookies.mockRejectedValue(new Error('Cookies error'));

      await expect(signOutAction()).rejects.toThrow('Cookies error');
    });

    it('should handle createClient throwing error', async () => {
      mockCreateClient.mockRejectedValue(new Error('Client creation failed'));

      await expect(signInAction({
        address: '0x123',
        chainId: 1,
        nonce: 'test',
      })).rejects.toThrow('Client creation failed');
    });

    it('should handle getSupabaseAdmin throwing error', async () => {
      mockGetSupabaseAdmin.mockImplementation(() => {
        throw new Error('Admin client error');
      });

      await expect(signInAction({
        address: '0x123',
        chainId: 1,
        nonce: 'test',
      })).rejects.toThrow('Admin client error');
    });
  });

  describe('Integration scenarios', () => {
    it('should complete full new user signup flow', async () => {
      const params = {
        address: '0xNewUserAddress',
        chainId: 1,
        nonce: 'signup-nonce',
      };

      mockDoesUserExistByWalletAddress.mockResolvedValue(false);
      mockSupabaseAdmin.auth.admin.createUser.mockResolvedValue({
        data: { user: { id: 'new-user-123' } },
        error: null,
      });

      const mockProfileInsert = jest.fn().mockResolvedValue({ data: null, error: null });
      mockSupabaseClient.from.mockReturnValue({ insert: mockProfileInsert });

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          session: {
            access_token: 'new-user-token',
            refresh_token: 'new-user-refresh',
          },
        },
        error: null,
      });

      await signInAction(params);

      // Verify complete flow
      expect(mockDoesUserExistByWalletAddress).toHaveBeenCalled();
      expect(mockSupabaseAdmin.auth.admin.createUser).toHaveBeenCalled();
      expect(mockProfileInsert).toHaveBeenCalled();
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalled();
      expect(mockSupabaseClient.auth.setSession).toHaveBeenCalled();
      expect(mockCookieStore.set).toHaveBeenCalled();
    });

    it('should complete existing user signin flow', async () => {
      const params = {
        address: '0xExistingUser',
        chainId: 137,
        nonce: 'signin-nonce',
      };

      mockDoesUserExistByWalletAddress.mockResolvedValue(true);
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          session: {
            access_token: 'existing-user-token',
            refresh_token: 'existing-user-refresh',
          },
        },
        error: null,
      });

      await signInAction(params);

      // Should not create new user
      expect(mockSupabaseAdmin.auth.admin.createUser).not.toHaveBeenCalled();
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();

      // Should sign in existing user
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalled();
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'jwt-cookie-key',
        'existing-user-token',
        { secure: true }
      );
    });
  });
});