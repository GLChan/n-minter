/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useInfiniteScroll } from '../useInfiniteScroll';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});

window.IntersectionObserver = mockIntersectionObserver;
window.requestAnimationFrame = jest.fn((cb) => {
  setTimeout(cb, 0);
  return 1;
});

interface TestItem {
  id: number;
  name: string;
}

describe('useInfiniteScroll', () => {
  let mockFetchFn: jest.MockedFunction<(page: number, pageSize: number) => Promise<TestItem[]>>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchFn = jest.fn();
    
    // Reset IntersectionObserver mock
    mockIntersectionObserver.mockClear();
    const mockObserverInstance = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    };
    mockIntersectionObserver.mockReturnValue(mockObserverInstance);
  });

  it('should initialize with correct default values', () => {
    mockFetchFn.mockResolvedValue([]);

    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchFn: mockFetchFn,
      })
    );

    expect(result.current.data).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.loaderRef).toBeDefined();
  });

  it('should use custom pageSize when provided', () => {
    mockFetchFn.mockResolvedValue([]);

    renderHook(() =>
      useInfiniteScroll({
        fetchFn: mockFetchFn,
        pageSize: 50,
      })
    );

    expect(mockFetchFn).not.toHaveBeenCalled(); // Should not fetch initially
  });

  it('should load initial data when intersection occurs', async () => {
    const mockData = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];
    mockFetchFn.mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchFn: mockFetchFn,
        pageSize: 20,
      })
    );

    // Set up a mock loader element
    const mockLoaderElement = document.createElement('div');
    result.current.loaderRef.current = mockLoaderElement;

    // Simulate intersection observer callback
    const observerCallback = mockIntersectionObserver.mock.calls[0][0];
    const entries = [{ isIntersecting: true }];

    await act(async () => {
      observerCallback(entries);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetchFn).toHaveBeenCalledWith(0, 20);
    expect(result.current.data).toEqual(mockData);
  });

  it('should append new data on subsequent loads', async () => {
    const firstBatch = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];
    const secondBatch = [
      { id: 3, name: 'Item 3' },
      { id: 4, name: 'Item 4' },
    ];

    mockFetchFn
      .mockResolvedValueOnce(firstBatch)
      .mockResolvedValueOnce(secondBatch);

    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchFn: mockFetchFn,
        pageSize: 2,
      })
    );

    const mockLoaderElement = document.createElement('div');
    result.current.loaderRef.current = mockLoaderElement;

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];
    const entries = [{ isIntersecting: true }];

    // First load
    await act(async () => {
      observerCallback(entries);
    });

    await waitFor(() => {
      expect(result.current.data).toHaveLength(2);
    });

    // Second load
    await act(async () => {
      observerCallback(entries);
    });

    await waitFor(() => {
      expect(result.current.data).toHaveLength(4);
    });

    expect(result.current.data).toEqual([...firstBatch, ...secondBatch]);
    expect(mockFetchFn).toHaveBeenCalledTimes(2);
    expect(mockFetchFn).toHaveBeenNthCalledWith(1, 0, 2);
    expect(mockFetchFn).toHaveBeenNthCalledWith(2, 1, 2);
  });

  it('should set hasMore to false when returned data is less than pageSize', async () => {
    const incompleteData = [{ id: 1, name: 'Item 1' }];
    mockFetchFn.mockResolvedValue(incompleteData);

    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchFn: mockFetchFn,
        pageSize: 20,
      })
    );

    const mockLoaderElement = document.createElement('div');
    result.current.loaderRef.current = mockLoaderElement;

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];
    const entries = [{ isIntersecting: true }];

    await act(async () => {
      observerCallback(entries);
    });

    await waitFor(() => {
      expect(result.current.hasMore).toBe(false);
    });

    expect(result.current.data).toEqual(incompleteData);
  });

  it('should handle fetch errors and set error state', async () => {
    const errorMessage = 'Network error';
    mockFetchFn.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchFn: mockFetchFn,
      })
    );

    const mockLoaderElement = document.createElement('div');
    result.current.loaderRef.current = mockLoaderElement;

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];
    const entries = [{ isIntersecting: true }];

    await act(async () => {
      observerCallback(entries);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('数据加载失败，请稍后再试');
    expect(result.current.data).toEqual([]);
  });

  it('should reset error state before new request', async () => {
    mockFetchFn
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce([{ id: 1, name: 'Item 1' }]);

    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchFn: mockFetchFn,
      })
    );

    const mockLoaderElement = document.createElement('div');
    result.current.loaderRef.current = mockLoaderElement;

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];
    const entries = [{ isIntersecting: true }];

    // First call - should error
    await act(async () => {
      observerCallback(entries);
    });

    await waitFor(() => {
      expect(result.current.error).toBe('数据加载失败，请稍后再试');
    });

    // Second call - should succeed and reset error
    await act(async () => {
      observerCallback(entries);
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });

    expect(result.current.data).toHaveLength(1);
  });

  it('should not load more when already loading', async () => {
    let resolvePromise: (value: TestItem[]) => void;
    const pendingPromise = new Promise<TestItem[]>((resolve) => {
      resolvePromise = resolve;
    });

    mockFetchFn.mockReturnValue(pendingPromise);

    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchFn: mockFetchFn,
      })
    );

    const mockLoaderElement = document.createElement('div');
    result.current.loaderRef.current = mockLoaderElement;

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];
    const entries = [{ isIntersecting: true }];

    // Trigger first load
    act(() => {
      observerCallback(entries);
    });

    expect(result.current.loading).toBe(true);

    // Trigger second load while first is still pending
    act(() => {
      observerCallback(entries);
    });

    // Should still only have called fetchFn once
    expect(mockFetchFn).toHaveBeenCalledTimes(1);

    // Resolve the promise
    await act(async () => {
      resolvePromise!([{ id: 1, name: 'Item 1' }]);
    });
  });

  it('should not load more when hasMore is false', async () => {
    const incompleteData = [{ id: 1, name: 'Item 1' }];
    mockFetchFn.mockResolvedValue(incompleteData);

    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchFn: mockFetchFn,
        pageSize: 20,
      })
    );

    const mockLoaderElement = document.createElement('div');
    result.current.loaderRef.current = mockLoaderElement;

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];
    const entries = [{ isIntersecting: true }];

    // First load - should set hasMore to false
    await act(async () => {
      observerCallback(entries);
    });

    await waitFor(() => {
      expect(result.current.hasMore).toBe(false);
    });

    // Second load attempt - should not call fetchFn
    await act(async () => {
      observerCallback(entries);
    });

    expect(mockFetchFn).toHaveBeenCalledTimes(1);
  });

  it('should setup IntersectionObserver with correct options', () => {
    mockFetchFn.mockResolvedValue([]);

    renderHook(() =>
      useInfiniteScroll({
        fetchFn: mockFetchFn,
      })
    );

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        rootMargin: '200px',
      }
    );
  });

  it('should observe and unobserve loader element correctly', () => {
    mockFetchFn.mockResolvedValue([]);
    const mockObserverInstance = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    };
    mockIntersectionObserver.mockReturnValue(mockObserverInstance);

    const { result, unmount } = renderHook(() =>
      useInfiniteScroll({
        fetchFn: mockFetchFn,
      })
    );

    const mockLoaderElement = document.createElement('div');
    
    act(() => {
      result.current.loaderRef.current = mockLoaderElement;
    });

    expect(mockObserverInstance.observe).toHaveBeenCalledWith(mockLoaderElement);

    unmount();

    expect(mockObserverInstance.unobserve).toHaveBeenCalledWith(mockLoaderElement);
  });

  it('should handle non-intersecting entries', async () => {
    mockFetchFn.mockResolvedValue([]);

    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchFn: mockFetchFn,
      })
    );

    const mockLoaderElement = document.createElement('div');
    result.current.loaderRef.current = mockLoaderElement;

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];
    const nonIntersectingEntries = [{ isIntersecting: false }];

    act(() => {
      observerCallback(nonIntersectingEntries);
    });

    // Should not have called fetchFn
    expect(mockFetchFn).not.toHaveBeenCalled();
  });

  it('should handle empty data response correctly', async () => {
    mockFetchFn.mockResolvedValue([]);

    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchFn: mockFetchFn,
        pageSize: 10,
      })
    );

    const mockLoaderElement = document.createElement('div');
    result.current.loaderRef.current = mockLoaderElement;

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];
    const entries = [{ isIntersecting: true }];

    await act(async () => {
      observerCallback(entries);
    });

    await waitFor(() => {
      expect(result.current.hasMore).toBe(false);
    });

    expect(result.current.data).toEqual([]);
  });

  it('should update page number correctly after each successful load', async () => {
    const mockData = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];
    mockFetchFn.mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchFn: mockFetchFn,
        pageSize: 2,
      })
    );

    const mockLoaderElement = document.createElement('div');
    result.current.loaderRef.current = mockLoaderElement;

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];
    const entries = [{ isIntersecting: true }];

    // First load (page 0)
    await act(async () => {
      observerCallback(entries);
    });

    // Second load (page 1)
    await act(async () => {
      observerCallback(entries);
    });

    // Third load (page 2)
    await act(async () => {
      observerCallback(entries);
    });

    expect(mockFetchFn).toHaveBeenNthCalledWith(1, 0, 2);
    expect(mockFetchFn).toHaveBeenNthCalledWith(2, 1, 2);
    expect(mockFetchFn).toHaveBeenNthCalledWith(3, 2, 2);
  });

  it('should handle fetchFn returning null or undefined', async () => {
    mockFetchFn.mockResolvedValue(null as any);

    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchFn: mockFetchFn,
      })
    );

    const mockLoaderElement = document.createElement('div');
    result.current.loaderRef.current = mockLoaderElement;

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];
    const entries = [{ isIntersecting: true }];

    await act(async () => {
      observerCallback(entries);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should handle null/undefined gracefully and not crash
    expect(result.current.data).toEqual([null]);
  });
});