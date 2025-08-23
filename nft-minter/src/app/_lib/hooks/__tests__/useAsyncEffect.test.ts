/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import useAsyncEffect from '../useAsyncEffect';

describe('useAsyncEffect Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should execute async callback', async () => {
    const callback = jest.fn().mockResolvedValue('test result');
    
    renderHook(() => useAsyncEffect(callback, []));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(callback).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should call destroy function on unmount when provided', () => {
    const callback = jest.fn().mockReturnValue('test result');
    const destroy = jest.fn();
    
    const { unmount } = renderHook(() => useAsyncEffect(callback, destroy, []));
    
    unmount();
    
    expect(destroy).toHaveBeenCalled();
  });

  it('should handle dependencies array correctly', () => {
    const callback = jest.fn().mockReturnValue('test result');
    let dependencies = [1, 2, 3];
    
    const { rerender } = renderHook(
      ({ deps }) => useAsyncEffect(callback, deps),
      { initialProps: { deps: dependencies } }
    );
    
    expect(callback).toHaveBeenCalledTimes(1);
    
    // Same dependencies should not trigger re-run
    rerender({ deps: dependencies });
    expect(callback).toHaveBeenCalledTimes(1);
    
    // Different dependencies should trigger re-run
    dependencies = [1, 2, 4];
    rerender({ deps: dependencies });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should provide isMounted function to callback', async () => {
    let isMountedFunc: (() => boolean) | undefined;
    
    const callback = jest.fn((isMounted: () => boolean) => {
      isMountedFunc = isMounted;
      return 'test result';
    });
    
    const { unmount } = renderHook(() => useAsyncEffect(callback, []));
    
    expect(isMountedFunc).toBeDefined();
    expect(isMountedFunc!()).toBe(true);
    
    unmount();
    
    expect(isMountedFunc!()).toBe(false);
  });

  it('should handle async callback that returns a promise', async () => {
    const callback = jest.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'async result';
    });
    
    renderHook(() => useAsyncEffect(callback, []));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });
    
    expect(callback).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should handle overloaded arguments correctly', () => {
    const callback = jest.fn().mockReturnValue('test result');
    
    // Test with dependencies only
    const { rerender } = renderHook(() => useAsyncEffect(callback, [1, 2, 3]));
    expect(callback).toHaveBeenCalledTimes(1);
    
    // Test with destroy function and dependencies
    const destroy = jest.fn();
    rerender();
    renderHook(() => useAsyncEffect(callback, destroy, [1, 2, 3]));
    expect(callback).toHaveBeenCalledTimes(2);
  });
});