/**
 * @jest-environment jsdom
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Mock dependencies
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(),
    redirect: jest.fn(),
  },
}));

jest.mock('../config/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  },
}));

const mockCreateServerClient = createServerClient as jest.MockedFunction<typeof createServerClient>;
const mockNextResponse = {
  next: NextResponse.next as jest.MockedFunction<typeof NextResponse.next>,
  redirect: NextResponse.redirect as jest.MockedFunction<typeof NextResponse.redirect>,
};

const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
  },
};

const mockResponse = {
  cookies: {
    set: jest.fn(),
    getAll: jest.fn(),
  },
};

describe('Supabase Middleware', () => {
  let mockRequest: Partial<NextRequest>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateServerClient.mockReturnValue(mockSupabaseClient as any);
    mockNextResponse.next.mockReturnValue(mockResponse as any);
    
    mockRequest = {
      cookies: {
        getAll: jest.fn().mockReturnValue([
          { name: 'session', value: 'test-session' },
          { name: 'refresh', value: 'test-refresh' },
        ]),
        set: jest.fn(),
      },
      nextUrl: {
        pathname: '/',
        clone: jest.fn().mockReturnValue({
          pathname: '/',
          toString: () => 'http://localhost:3000/',
        }),
      },
    };
  });

  describe('updateSession function', () => {
    it('should create server client with correct configuration', async () => {
      const { updateSession } = require('../middleware');
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      await updateSession(mockRequest as NextRequest);

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
    });

    it('should call supabase.auth.getUser()', async () => {
      const { updateSession } = require('../middleware');
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      await updateSession(mockRequest as NextRequest);

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1);
    });

    it('should return response for authenticated user on public route', async () => {
      const { updateSession } = require('../middleware');
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const result = await updateSession(mockRequest as NextRequest);

      expect(result).toBe(mockResponse);
      expect(mockNextResponse.redirect).not.toHaveBeenCalled();
    });

    it('should return response for authenticated user on protected route', async () => {
      const { updateSession } = require('../middleware');
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      mockRequest.nextUrl!.pathname = '/dashboard';

      const result = await updateSession(mockRequest as NextRequest);

      expect(result).toBe(mockResponse);
      expect(mockNextResponse.redirect).not.toHaveBeenCalled();
    });

    it('should allow unauthenticated user on public route', async () => {
      const { updateSession } = require('../middleware');
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const result = await updateSession(mockRequest as NextRequest);

      expect(result).toBe(mockResponse);
      expect(mockNextResponse.redirect).not.toHaveBeenCalled();
    });

    it('should redirect unauthenticated user from protected route to login', async () => {
      const { updateSession } = require('../middleware');
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const mockRedirectResponse = { type: 'redirect' };
      mockNextResponse.redirect.mockReturnValue(mockRedirectResponse as any);

      mockRequest.nextUrl!.pathname = '/dashboard';
      const mockUrl = {
        pathname: '/dashboard',
        clone: jest.fn().mockReturnValue({
          pathname: '/login',
        }),
      };
      mockRequest.nextUrl = mockUrl as any;

      const result = await updateSession(mockRequest as NextRequest);

      expect(mockNextResponse.redirect).toHaveBeenCalledWith(mockUrl.clone());
      expect(mockUrl.clone().pathname).toBe('/login');
      expect(result).toBe(mockRedirectResponse);
    });

    describe('Protected routes', () => {
      const protectedRoutes = ['/dashboard', '/create', '/profile'];

      protectedRoutes.forEach((route) => {
        it(`should redirect from protected route ${route}`, async () => {
          const { updateSession } = require('../middleware');
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: null },
          });

          const mockRedirectResponse = { type: 'redirect' };
          mockNextResponse.redirect.mockReturnValue(mockRedirectResponse as any);

          mockRequest.nextUrl!.pathname = route;

          const result = await updateSession(mockRequest as NextRequest);

          expect(mockNextResponse.redirect).toHaveBeenCalled();
          expect(result).toBe(mockRedirectResponse);
        });

        it(`should allow authenticated user on protected route ${route}`, async () => {
          const { updateSession } = require('../middleware');
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: 'user-123' } },
          });

          mockRequest.nextUrl!.pathname = route;

          const result = await updateSession(mockRequest as NextRequest);

          expect(result).toBe(mockResponse);
          expect(mockNextResponse.redirect).not.toHaveBeenCalled();
        });
      });
    });

    it('should handle subpaths of protected routes', async () => {
      const { updateSession } = require('../middleware');
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const mockRedirectResponse = { type: 'redirect' };
      mockNextResponse.redirect.mockReturnValue(mockRedirectResponse as any);

      mockRequest.nextUrl!.pathname = '/dashboard/settings';

      const result = await updateSession(mockRequest as NextRequest);

      expect(mockNextResponse.redirect).toHaveBeenCalled();
      expect(result).toBe(mockRedirectResponse);
    });
  });

  describe('Cookie handling', () => {
    it('should get all cookies from request', async () => {
      const { updateSession } = require('../middleware');
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      await updateSession(mockRequest as NextRequest);

      const clientConfig = mockCreateServerClient.mock.calls[0][2];
      const getAll = clientConfig.cookies.getAll;

      expect(getAll()).toEqual([
        { name: 'session', value: 'test-session' },
        { name: 'refresh', value: 'test-refresh' },
      ]);
    });

    it('should set cookies correctly', async () => {
      const { updateSession } = require('../middleware');
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      await updateSession(mockRequest as NextRequest);

      const clientConfig = mockCreateServerClient.mock.calls[0][2];
      const setAll = clientConfig.cookies.setAll;

      const cookiesToSet = [
        { name: 'new-cookie', value: 'new-value', options: { httpOnly: true } },
        { name: 'another-cookie', value: 'another-value', options: { secure: true } },
      ];

      setAll(cookiesToSet);

      expect(mockRequest.cookies?.set).toHaveBeenCalledWith('new-cookie', 'new-value');
      expect(mockRequest.cookies?.set).toHaveBeenCalledWith('another-cookie', 'another-value');
      expect(mockResponse.cookies.set).toHaveBeenCalledWith(
        'new-cookie',
        'new-value',
        { httpOnly: true }
      );
      expect(mockResponse.cookies.set).toHaveBeenCalledWith(
        'another-cookie',
        'another-value',
        { secure: true }
      );
    });
  });

  describe('Error handling', () => {
    it('should handle auth.getUser() error gracefully', async () => {
      const { updateSession } = require('../middleware');
      mockSupabaseClient.auth.getUser.mockRejectedValue(new Error('Auth error'));

      await expect(updateSession(mockRequest as NextRequest)).rejects.toThrow('Auth error');
    });

    it('should handle createServerClient error gracefully', async () => {
      const { updateSession } = require('../middleware');
      mockCreateServerClient.mockImplementation(() => {
        throw new Error('Client creation error');
      });

      await expect(updateSession(mockRequest as NextRequest)).rejects.toThrow('Client creation error');
    });
  });

  describe('URL handling', () => {
    it('should clone URL correctly for redirect', async () => {
      const { updateSession } = require('../middleware');
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const mockClonedUrl = { pathname: '/login' };
      const mockUrl = {
        pathname: '/dashboard',
        clone: jest.fn().mockReturnValue(mockClonedUrl),
      };
      mockRequest.nextUrl = mockUrl as any;

      await updateSession(mockRequest as NextRequest);

      expect(mockUrl.clone).toHaveBeenCalled();
      expect(mockClonedUrl.pathname).toBe('/login');
    });
  });

  describe('Module exports', () => {
    it('should export updateSession function', () => {
      const middlewareModule = require('../middleware');

      expect(middlewareModule).toHaveProperty('updateSession');
      expect(typeof middlewareModule.updateSession).toBe('function');
    });
  });
});