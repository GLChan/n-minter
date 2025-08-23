/**
 * @jest-environment node
 */

// Mock environment variables and constants first
jest.mock('../../config/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test-key',
    NEXT_PUBLIC_MY_NFT_FACTORY_ADDRESS: '0x1234567890123456789012345678901234567890',
    NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS: '0x0987654321098765432109876543210987654321',
    NEXT_PUBLIC_WETH_CONTRACT_ADDRESS: '0x1111111111111111111111111111111111111111',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    NEXT_PUBLIC_APP_BASE_URL: 'https://test.example.com',
    JWT_SECRET_KEY: 'test-jwt-secret',
    PRIVATE_KEY: 'test-private-key',
  },
}));

import { SiweMessage } from 'siwe';
import { authenticationAdapter } from '../authenticationAdapter';

// Mock dependencies
jest.mock('siwe', () => ({
  SiweMessage: jest.fn(),
}));

jest.mock('@rainbow-me/rainbowkit', () => ({
  createAuthenticationAdapter: jest.fn((config) => config),
}));

jest.mock('@/app/_lib/actions/auth', () => ({
  signInAction: jest.fn(),
  signOutAction: jest.fn(),
}));

jest.mock('../../config/clients/eventEmitter', () => ({
  eventEmitter: {
    emit: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
  },
}));

jest.mock('../../constants', () => ({
  EMITTER_EVENTS: {
    SIGN_IN: 'sign_in',
    SIGN_OUT: 'sign_out',
  },
}));

const mockSiweMessage = SiweMessage as jest.MockedClass<typeof SiweMessage>;

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock window object for Node environment
(global as any).window = {
  location: {
    host: 'localhost:3000',
    origin: 'http://localhost:3000',
  },
};

describe('Authentication Adapter', () => {
  let mockSignInAction: jest.MockedFunction<any>;
  let mockSignOutAction: jest.MockedFunction<any>;
  let mockEventEmitter: { emit: jest.MockedFunction<any> };

  beforeAll(async () => {
    // Get the mocked functions after imports
    const authActions = await import('@/app/_lib/actions/auth');
    const eventEmitterModule = await import('../../config/clients/eventEmitter');
    
    mockSignInAction = jest.mocked(authActions.signInAction);
    mockSignOutAction = jest.mocked(authActions.signOutAction);
    mockEventEmitter = jest.mocked(eventEmitterModule.eventEmitter) as any;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    
    // Reset all mock implementations to avoid interference between tests
    mockFetch.mockReset();
    mockSignInAction.mockReset();
    mockSignOutAction.mockReset();
    mockEventEmitter.emit.mockReset();
    
    // Mock SiweMessage instance
    const mockSiweInstance = {
      prepareMessage: jest.fn().mockReturnValue('Mock message body'),
    };
    mockSiweMessage.mockImplementation(() => mockSiweInstance as any);
  });

  describe('getNonce', () => {
    it('should fetch nonce from API successfully', async () => {
      const mockNonce = 'test-nonce-123';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ nonce: mockNonce }),
      });

      const result = await authenticationAdapter.getNonce();

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/nonce');
      expect(result).toBe(mockNonce);
    });

    it('should handle fetch errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(authenticationAdapter.getNonce()).rejects.toThrow('Network error');
    });

    it('should handle invalid JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(authenticationAdapter.getNonce()).rejects.toThrow('Invalid JSON');
    });
  });

  describe('createMessage', () => {
    it('should create SIWE message with correct parameters', () => {
      const params = {
        nonce: 'test-nonce',
        address: '0x123456789abcdef',
        chainId: 1,
      };

      const result = authenticationAdapter.createMessage(params);

      expect(mockSiweMessage).toHaveBeenCalledWith({
        domain: 'localhost:3000',
        address: params.address,
        statement: 'Sign in with Ethereum to the app.',
        uri: 'http://localhost:3000',
        version: '1',
        chainId: params.chainId,
        nonce: params.nonce,
      });
      expect(result).toBeDefined();
      expect(result.prepareMessage).toBeDefined();
    });

    it('should use correct window location values', () => {
      // Mock different window location
      (global as any).window.location = {
        host: 'example.com',
        origin: 'https://example.com',
      };

      const params = {
        nonce: 'test-nonce',
        address: '0x123456789abcdef',
        chainId: 1,
      };

      authenticationAdapter.createMessage(params);

      expect(mockSiweMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          domain: 'example.com',
          uri: 'https://example.com',
        })
      );
    });

    it('should handle different chain IDs', () => {
      const params = {
        nonce: 'test-nonce',
        address: '0x123456789abcdef',
        chainId: 137, // Polygon
      };

      authenticationAdapter.createMessage(params);

      expect(mockSiweMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          chainId: 137,
        })
      );
    });
  });

  describe('getMessageBody', () => {
    it('should return prepared message body', () => {
      const mockMessage = {
        prepareMessage: jest.fn().mockReturnValue('Prepared message body'),
      };

      const result = authenticationAdapter.getMessageBody({ message: mockMessage as any });

      expect(mockMessage.prepareMessage).toHaveBeenCalled();
      expect(result).toBe('Prepared message body');
    });

    it('should handle message preparation errors', () => {
      const mockMessage = {
        prepareMessage: jest.fn().mockImplementation(() => {
          throw new Error('Message preparation failed');
        }),
      };

      expect(() => {
        authenticationAdapter.getMessageBody({ message: mockMessage as any });
      }).toThrow('Message preparation failed');
    });
  });

  describe('verify', () => {
    const mockVerifyParams = {
      message: 'test-message' as any,
      signature: '0xsignature123',
    };

    it('should verify signature successfully', async () => {
      const mockVerifyResponse = {
        address: '0x123456789abcdef',
        chainId: 1,
        nonce: 'test-nonce',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockVerifyResponse),
      });

      mockSignInAction.mockResolvedValueOnce(undefined);

      const result = await authenticationAdapter.verify(mockVerifyParams);

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockVerifyParams),
      });

      expect(mockSignInAction).toHaveBeenCalledWith({
        address: mockVerifyResponse.address,
        chainId: mockVerifyResponse.chainId,
        nonce: mockVerifyResponse.nonce,
      });

      expect(mockEventEmitter.emit).toHaveBeenCalledWith('sign_in');
      expect(result).toBe(true);
    });

    it('should throw error when verification fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(authenticationAdapter.verify(mockVerifyParams)).rejects.toThrow(
        'Failed to verify signature'
      );

      expect(mockSignInAction).not.toHaveBeenCalled();
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should handle network errors during verification', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(authenticationAdapter.verify(mockVerifyParams)).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle signInAction errors gracefully', async () => {
      const mockVerifyResponse = {
        address: '0x123456789abcdef',
        chainId: 1,
        nonce: 'test-nonce',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockVerifyResponse),
      });

      mockSignInAction.mockRejectedValueOnce(new Error('Sign in failed'));

      await expect(authenticationAdapter.verify(mockVerifyParams)).rejects.toThrow(
        'Sign in failed'
      );

      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should handle invalid JSON response from verify endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(authenticationAdapter.verify(mockVerifyParams)).rejects.toThrow(
        'Invalid JSON'
      );
    });

    it('should emit sign in event after successful verification', async () => {
      const mockVerifyResponse = {
        address: '0x123456789abcdef',
        chainId: 1,
        nonce: 'test-nonce',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockVerifyResponse),
      });

      mockSignInAction.mockResolvedValueOnce(undefined);

      await authenticationAdapter.verify(mockVerifyParams);

      expect(mockEventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('sign_in');
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      mockSignOutAction.mockResolvedValueOnce(undefined);

      await authenticationAdapter.signOut();

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout');
      expect(mockSignOutAction).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('sign_out');
    });

    it('should handle logout API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Logout API error'));
      mockSignOutAction.mockResolvedValueOnce(undefined);

      // Should still complete the sign out process
      await expect(authenticationAdapter.signOut()).rejects.toThrow('Logout API error');

      expect(mockSignOutAction).not.toHaveBeenCalled();
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should handle signOutAction errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      mockSignOutAction.mockRejectedValueOnce(new Error('Sign out action failed'));

      await expect(authenticationAdapter.signOut()).rejects.toThrow('Sign out action failed');

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout');
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should emit sign out event after successful logout', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      mockSignOutAction.mockResolvedValueOnce(undefined);

      await authenticationAdapter.signOut();

      expect(mockEventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('sign_out');
    });

    it('should handle both API and action execution in sequence', async () => {
      const callOrder: string[] = [];
      
      mockFetch.mockImplementationOnce(async () => {
        callOrder.push('fetch');
        return { ok: true };
      });

      mockSignOutAction.mockImplementationOnce(async () => {
        callOrder.push('signOutAction');
        return undefined;
      });

      mockEventEmitter.emit.mockImplementationOnce(() => {
        callOrder.push('emit');
        return true;
      });

      await authenticationAdapter.signOut();

      // Verify the order of operations
      expect(callOrder).toEqual(['fetch', 'signOutAction', 'emit']);
    });
  });

  describe('adapter configuration', () => {
    it('should have all required methods', () => {
      expect(typeof authenticationAdapter.getNonce).toBe('function');
      expect(typeof authenticationAdapter.createMessage).toBe('function');
      expect(typeof authenticationAdapter.getMessageBody).toBe('function');
      expect(typeof authenticationAdapter.verify).toBe('function');
      expect(typeof authenticationAdapter.signOut).toBe('function');
    });

    it('should use correct SIWE message configuration', () => {
      const params = {
        nonce: 'test-nonce',
        address: '0x123456789abcdef',
        chainId: 1,
      };

      authenticationAdapter.createMessage(params);

      expect(mockSiweMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          statement: 'Sign in with Ethereum to the app.',
          version: '1',
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle malformed verification response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ invalid: 'response' }),
      });

      const result = await authenticationAdapter.verify({
        message: 'test-message' as any,
        signature: '0xsignature',
      });

      // Should still proceed with signInAction even with malformed response
      expect(mockSignInAction).toHaveBeenCalledWith({
        address: undefined,
        chainId: undefined,
        nonce: undefined,
      });
      expect(result).toBe(true);
    });

    it('should handle missing window.location properties', () => {
      // Mock missing location properties
      (global as any).window.location = {};

      const params = {
        nonce: 'test-nonce',
        address: '0x123456789abcdef',
        chainId: 1,
      };

      authenticationAdapter.createMessage(params);

      expect(mockSiweMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          domain: undefined,
          uri: undefined,
        })
      );
    });
  });

  describe('integration scenarios', () => {
    it('should complete full authentication flow', async () => {
      // Step 1: Get nonce
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ nonce: 'test-nonce' }),
      });

      const nonce = await authenticationAdapter.getNonce();

      // Step 2: Create message
      const message = authenticationAdapter.createMessage({
        nonce,
        address: '0x123456789abcdef',
        chainId: 1,
      });

      // Step 3: Get message body
      const messageBody = authenticationAdapter.getMessageBody({ message });

      // Step 4: Verify signature
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          address: '0x123456789abcdef',
          chainId: 1,
          nonce: 'test-nonce',
        }),
      });

      mockSignInAction.mockResolvedValueOnce(undefined);

      const verificationResult = await authenticationAdapter.verify({
        message: messageBody as any,
        signature: '0xsignature',
      });

      expect(verificationResult).toBe(true);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('sign_in');
    });

    it('should complete sign out flow', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      mockSignOutAction.mockResolvedValueOnce(undefined);

      await authenticationAdapter.signOut();

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout');
      expect(mockSignOutAction).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('sign_out');
    });
  });
});