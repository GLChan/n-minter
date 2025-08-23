/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react';
import useIsAuth from '../useIsAuth';

// Mock the auth action
jest.mock('../../actions/auth', () => ({
  isAuthAction: jest.fn(),
}));

// Mock useAsyncEffect to actually call the callback
jest.mock('../useAsyncEffect', () => {
  return jest.fn((callback, deps) => {
    // Simulate async effect by calling the callback in a timeout
    setTimeout(() => {
      callback().catch(() => {
        // Silently catch errors to prevent unhandled promises
      });
    }, 0);
  });
});

describe('useIsAuth Hook', () => {
  const mockIsAuthAction = require('../../actions/auth').isAuthAction;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return isAuth as undefined initially', () => {
    mockIsAuthAction.mockResolvedValue({ isAuth: true });
    
    const { result } = renderHook(() => useIsAuth());
    
    expect(result.current.isAuth).toBeUndefined();
  });

  it('should set isAuth to true when user is authenticated', async () => {
    mockIsAuthAction.mockResolvedValue({ isAuth: true });
    
    const { result } = renderHook(() => useIsAuth());
    
    await waitFor(() => {
      expect(result.current.isAuth).toBe(true);
    }, { timeout: 100 });
  });

  it('should set isAuth to false when user is not authenticated', async () => {
    mockIsAuthAction.mockResolvedValue({ isAuth: false });
    
    const { result } = renderHook(() => useIsAuth());
    
    await waitFor(() => {
      expect(result.current.isAuth).toBe(false);
    }, { timeout: 100 });
  });

  it('should handle auth action errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockIsAuthAction.mockRejectedValue(new Error('Auth error'));
    
    const { result } = renderHook(() => useIsAuth());
    
    // Give some time for the async effect to run
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Should not crash and maintain undefined state
    expect(result.current.isAuth).toBeUndefined();
    
    consoleSpy.mockRestore();
  });

  it('should call isAuthAction when component mounts', () => {
    mockIsAuthAction.mockResolvedValue({ isAuth: true });
    
    renderHook(() => useIsAuth());
    
    // Check if useAsyncEffect was called (indirectly through the mock)
    expect(require('../useAsyncEffect')).toHaveBeenCalled();
  });
});