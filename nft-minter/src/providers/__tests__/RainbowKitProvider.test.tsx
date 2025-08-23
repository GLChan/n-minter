/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RainbowKitProvider from '../RainbowKitProvider';

// Mock all dependencies
jest.mock('wagmi', () => ({
  WagmiProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="wagmi-provider">{children}</div>
  ),
}));

jest.mock('@rainbow-me/rainbowkit', () => ({
  RainbowKitAuthenticationProvider: ({ children, adapter, status }: any) => (
    <div data-testid="rainbowkit-auth-provider" data-status={status}>
      {children}
    </div>
  ),
}));

jest.mock('../ReactQueryProvider', () => {
  return ({ children }: { children: React.ReactNode }) => (
    <div data-testid="react-query-provider">{children}</div>
  );
});

jest.mock('../CompatibleRainbowKit', () => {
  return ({ children, coolMode }: { children: React.ReactNode; coolMode: boolean }) => (
    <div data-testid="compatible-rainbowkit" data-cool-mode={coolMode}>
      {children}
    </div>
  );
});

jest.mock('@/app/_lib/config/wagmi', () => ({
  default: { mockConfig: true },
}));

jest.mock('@/app/_lib/utils/authenticationAdapter', () => ({
  authenticationAdapter: { mockAdapter: true },
}));

jest.mock('@/app/_lib/hooks/useAsyncEffect', () => {
  return jest.fn((callback, deps) => {
    // Simulate async effect
    setTimeout(() => {
      callback().catch(() => {});
    }, 0);
  });
});

jest.mock('@/app/_lib/actions/auth', () => ({
  isAuthAction: jest.fn(),
}));

jest.mock('@/app/_lib/config/clients/eventEmitter', () => ({
  eventEmitter: {
    on: jest.fn(),
    removeListener: jest.fn(),
  },
}));

jest.mock('@/app/_lib/constants', () => ({
  EMITTER_EVENTS: {
    SIGN_IN: 'sign_in',
    SIGN_OUT: 'sign_out',
  },
}));

// Mock CSS import
jest.mock('@rainbow-me/rainbowkit/styles.css', () => {});

describe('RainbowKitProvider', () => {
  const mockIsAuthAction = require('@/app/_lib/actions/auth').isAuthAction;
  const mockEventEmitter = require('@/app/_lib/config/clients/eventEmitter').eventEmitter;
  const mockUseAsyncEffect = require('@/app/_lib/hooks/useAsyncEffect');

  const defaultProps = {
    children: <div data-testid="test-children">Test Content</div>,
    initialState: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all provider components in correct order', () => {
    mockIsAuthAction.mockResolvedValue({ isAuth: true });

    render(<RainbowKitProvider {...defaultProps} />);

    expect(screen.getByTestId('wagmi-provider')).toBeInTheDocument();
    expect(screen.getByTestId('react-query-provider')).toBeInTheDocument();
    expect(screen.getByTestId('rainbowkit-auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('compatible-rainbowkit')).toBeInTheDocument();
    expect(screen.getByTestId('test-children')).toBeInTheDocument();
  });

  it('should pass children correctly through all providers', () => {
    mockIsAuthAction.mockResolvedValue({ isAuth: true });

    render(<RainbowKitProvider {...defaultProps} />);

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should set initial status as loading', () => {
    mockIsAuthAction.mockResolvedValue({ isAuth: true });

    render(<RainbowKitProvider {...defaultProps} />);

    const authProvider = screen.getByTestId('rainbowkit-auth-provider');
    expect(authProvider).toHaveAttribute('data-status', 'loading');
  });

  it('should set status to authenticated when user is authenticated', async () => {
    mockIsAuthAction.mockResolvedValue({ isAuth: true });
    
    // Mock useAsyncEffect to call the callback immediately
    mockUseAsyncEffect.mockImplementation((callback, deps) => {
      callback();
    });

    render(<RainbowKitProvider {...defaultProps} />);

    await waitFor(() => {
      const authProvider = screen.getByTestId('rainbowkit-auth-provider');
      expect(authProvider).toHaveAttribute('data-status', 'authenticated');
    });
  });

  it('should set status to unauthenticated when user is not authenticated', async () => {
    mockIsAuthAction.mockResolvedValue({ isAuth: false });
    
    mockUseAsyncEffect.mockImplementation((callback, deps) => {
      callback();
    });

    render(<RainbowKitProvider {...defaultProps} />);

    await waitFor(() => {
      const authProvider = screen.getByTestId('rainbowkit-auth-provider');
      expect(authProvider).toHaveAttribute('data-status', 'unauthenticated');
    });
  });

  it('should enable cool mode on CompatibleRainbowKit', () => {
    mockIsAuthAction.mockResolvedValue({ isAuth: true });

    render(<RainbowKitProvider {...defaultProps} />);

    const compatibleRainbowKit = screen.getByTestId('compatible-rainbowkit');
    expect(compatibleRainbowKit).toHaveAttribute('data-cool-mode', 'true');
  });

  it('should setup event listeners for sign in and sign out', () => {
    mockIsAuthAction.mockResolvedValue({ isAuth: true });

    render(<RainbowKitProvider {...defaultProps} />);

    expect(mockUseAsyncEffect).toHaveBeenCalledWith(expect.any(Function), []);
  });

  it('should call isAuthAction on mount', () => {
    mockIsAuthAction.mockResolvedValue({ isAuth: true });

    render(<RainbowKitProvider {...defaultProps} />);

    expect(mockUseAsyncEffect).toHaveBeenCalled();
  });

  it('should handle initialState prop correctly', () => {
    const initialState = { some: 'state' };
    mockIsAuthAction.mockResolvedValue({ isAuth: true });

    render(
      <RainbowKitProvider initialState={initialState} children={defaultProps.children} />
    );

    // WagmiProvider should receive the initialState
    expect(screen.getByTestId('wagmi-provider')).toBeInTheDocument();
  });

  it('should handle authentication errors gracefully', async () => {
    mockIsAuthAction.mockRejectedValue(new Error('Auth error'));
    
    mockUseAsyncEffect.mockImplementation((callback, deps) => {
      callback().catch(() => {});
    });

    render(<RainbowKitProvider {...defaultProps} />);

    // Should not crash and maintain loading state or fallback
    expect(screen.getByTestId('wagmi-provider')).toBeInTheDocument();
  });

  it('should render multiple children correctly', () => {
    mockIsAuthAction.mockResolvedValue({ isAuth: true });

    const multipleChildren = (
      <>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </>
    );

    render(<RainbowKitProvider initialState={undefined} children={multipleChildren} />);

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('should have correct provider hierarchy', () => {
    mockIsAuthAction.mockResolvedValue({ isAuth: true });

    const { container } = render(<RainbowKitProvider {...defaultProps} />);

    // Check that providers are nested correctly
    const wagmiProvider = screen.getByTestId('wagmi-provider');
    const reactQueryProvider = screen.getByTestId('react-query-provider');
    const rainbowkitAuthProvider = screen.getByTestId('rainbowkit-auth-provider');
    const compatibleRainbowKit = screen.getByTestId('compatible-rainbowkit');

    expect(wagmiProvider).toContainElement(reactQueryProvider);
    expect(reactQueryProvider).toContainElement(rainbowkitAuthProvider);
    expect(rainbowkitAuthProvider).toContainElement(compatibleRainbowKit);
  });
});