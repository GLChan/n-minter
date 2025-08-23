/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Web3Provider from '../Web3Provider';

// Mock dependencies
jest.mock('../RainbowKitProvider', () => {
  return ({ children, initialState }: { children: React.ReactNode; initialState: any }) => (
    <div data-testid="rainbowkit-provider" data-initial-state={initialState ? JSON.stringify(initialState) : 'null'}>
      {children}
    </div>
  );
});

jest.mock('wagmi', () => ({
  cookieToInitialState: jest.fn(),
}));

const mockWagmiConfig = { mockConfig: true };
jest.mock('@/app/_lib/config/wagmi', () => ({
  default: mockWagmiConfig,
}));

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

describe('Web3Provider', () => {
  const mockHeaders = require('next/headers').headers;
  const mockCookieToInitialState = require('wagmi').cookieToInitialState;
  
  const mockHeadersStore = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockHeaders.mockResolvedValue(mockHeadersStore);
  });

  it('should render children within RainbowKitProvider', async () => {
    mockHeadersStore.get.mockReturnValue('test-cookie');
    mockCookieToInitialState.mockReturnValue({ mockInitialState: true });

    const element = await Web3Provider({
      children: <div data-testid="test-children">Test Content</div>
    });

    render(element);

    expect(screen.getByTestId('rainbowkit-provider')).toBeInTheDocument();
    expect(screen.getByTestId('test-children')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should get cookie from headers and pass to cookieToInitialState', async () => {
    const testCookie = 'session=abc123; other=value';
    mockHeadersStore.get.mockReturnValue(testCookie);
    mockCookieToInitialState.mockReturnValue({ user: 'test' });

    const element = await Web3Provider({
      children: <div>Test</div>
    });

    render(element);

    expect(mockHeaders).toHaveBeenCalled();
    expect(mockHeadersStore.get).toHaveBeenCalledWith('cookie');
    expect(mockCookieToInitialState).toHaveBeenCalledWith(
      mockWagmiConfig,
      testCookie
    );
  });

  it('should handle null cookie value', async () => {
    mockHeadersStore.get.mockReturnValue(null);
    mockCookieToInitialState.mockReturnValue(null);

    const element = await Web3Provider({
      children: <div data-testid="content">Content</div>
    });

    render(element);

    expect(mockCookieToInitialState).toHaveBeenCalledWith(
      mockWagmiConfig,
      null
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should pass initialState to RainbowKitProvider', async () => {
    const mockInitialState = { 
      chainId: 1, 
      accounts: ['0x123'], 
      connections: new Map() 
    };
    
    mockHeadersStore.get.mockReturnValue('cookie=value');
    mockCookieToInitialState.mockReturnValue(mockInitialState);

    const element = await Web3Provider({
      children: <div>Test</div>
    });

    render(element);

    const provider = screen.getByTestId('rainbowkit-provider');
    expect(provider).toHaveAttribute(
      'data-initial-state', 
      JSON.stringify(mockInitialState)
    );
  });

  it('should handle multiple children correctly', async () => {
    mockHeadersStore.get.mockReturnValue('test-cookie');
    mockCookieToInitialState.mockReturnValue({});

    const multipleChildren = (
      <>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <span data-testid="child-3">Child 3</span>
      </>
    );

    const element = await Web3Provider({
      children: multipleChildren
    });

    render(element);

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });

  it('should handle empty cookie string', async () => {
    mockHeadersStore.get.mockReturnValue('');
    mockCookieToInitialState.mockReturnValue(undefined);

    const element = await Web3Provider({
      children: <div data-testid="empty-cookie-test">Test</div>
    });

    render(element);

    expect(mockCookieToInitialState).toHaveBeenCalledWith(
      mockWagmiConfig,
      ''
    );
    expect(screen.getByTestId('empty-cookie-test')).toBeInTheDocument();
  });

  it('should handle headers API error gracefully', async () => {
    mockHeaders.mockRejectedValue(new Error('Headers error'));

    await expect(Web3Provider({
      children: <div data-testid="error-handling">Error Test</div>
    })).rejects.toThrow('Headers error');
  });

  it('should handle complex cookie values', async () => {
    const complexCookie = 'session=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9; csrf=abc123; preference=dark';
    mockHeadersStore.get.mockReturnValue(complexCookie);
    mockCookieToInitialState.mockReturnValue({ complex: 'state' });

    const element = await Web3Provider({
      children: <div data-testid="complex-cookie">Test</div>
    });

    render(element);

    expect(mockCookieToInitialState).toHaveBeenCalledWith(
      mockWagmiConfig,
      complexCookie
    );
    expect(screen.getByTestId('complex-cookie')).toBeInTheDocument();
  });

  it('should be an async component', () => {
    const component = Web3Provider({ children: <div>Test</div> });
    expect(component).toBeInstanceOf(Promise);
  });

  it('should handle undefined initialState', async () => {
    mockHeadersStore.get.mockReturnValue('cookie=test');
    mockCookieToInitialState.mockReturnValue(undefined);

    const element = await Web3Provider({
      children: <div data-testid="undefined-state">Test</div>
    });

    render(element);

    const provider = screen.getByTestId('rainbowkit-provider');
    expect(provider).toHaveAttribute('data-initial-state', 'null');
    expect(screen.getByTestId('undefined-state')).toBeInTheDocument();
  });

  it('should properly await headers and process cookies sequentially', async () => {
    const testCookie = 'test=value';
    const expectedState = { test: 'state' };
    
    mockHeadersStore.get.mockReturnValue(testCookie);
    mockCookieToInitialState.mockReturnValue(expectedState);

    const element = await Web3Provider({
      children: <div data-testid="sequential-test">Sequential Test</div>
    });

    render(element);

    // Verify the sequence of operations
    expect(mockHeaders).toHaveBeenCalledTimes(1);
    expect(mockHeadersStore.get).toHaveBeenCalledWith('cookie');
    expect(mockCookieToInitialState).toHaveBeenCalledWith(
      mockWagmiConfig,
      testCookie
    );
    
    expect(screen.getByTestId('sequential-test')).toBeInTheDocument();
  });

  it('should handle when cookies are not available', async () => {
    mockHeadersStore.get.mockReturnValue(undefined);
    mockCookieToInitialState.mockReturnValue(null);

    const element = await Web3Provider({
      children: <div data-testid="no-cookies">No Cookies Test</div>
    });

    render(element);

    expect(mockCookieToInitialState).toHaveBeenCalledWith(
      mockWagmiConfig,
      undefined
    );
    expect(screen.getByTestId('no-cookies')).toBeInTheDocument();
  });
});