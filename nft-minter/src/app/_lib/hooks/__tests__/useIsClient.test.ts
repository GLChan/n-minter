/**
 * @jest-environment jsdom
 */

import useIsClient from '../useIsClient';
import { renderHook } from '@testing-library/react';

describe('useIsClient Hook', () => {
  it('should return object with isClient property', () => {
    const { result } = renderHook(() => useIsClient());
    
    // Should return an object with isClient property
    expect(result.current).toHaveProperty('isClient');
    expect(typeof result.current.isClient).toBe('boolean');
  });

  it('should start with isClient as true in test environment', () => {
    const { result } = renderHook(() => useIsClient());
    
    // In test environment, useEffect runs immediately, so isClient is true
    expect(result.current.isClient).toBe(true);
  });

  it('should be consistent across multiple calls', () => {
    const { result: result1 } = renderHook(() => useIsClient());
    const { result: result2 } = renderHook(() => useIsClient());
    
    expect(result1.current.isClient).toBe(result2.current.isClient);
  });
});