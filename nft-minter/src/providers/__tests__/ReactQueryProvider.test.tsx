/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReactQueryProvider from '../ReactQueryProvider';

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn().mockImplementation(() => ({
    mount: jest.fn(),
    unmount: jest.fn(),
    clear: jest.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="query-client-provider">{children}</div>
  ),
}));

jest.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: ({ buttonPosition, initialIsOpen }: any) => (
    <div 
      data-testid="react-query-devtools" 
      data-button-position={buttonPosition}
      data-initial-open={initialIsOpen}
    >
      Devtools
    </div>
  ),
}));

describe('ReactQueryProvider', () => {
  it('should render children wrapped in QueryClientProvider', () => {
    render(
      <ReactQueryProvider>
        <div data-testid="test-child">Test Content</div>
      </ReactQueryProvider>
    );

    expect(screen.getByTestId('query-client-provider')).toBeInTheDocument();
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render ReactQueryDevtools with correct props', () => {
    render(
      <ReactQueryProvider>
        <div>Content</div>
      </ReactQueryProvider>
    );

    const devtools = screen.getByTestId('react-query-devtools');
    expect(devtools).toBeInTheDocument();
    expect(devtools).toHaveAttribute('data-button-position', 'bottom-left');
    expect(devtools).toHaveAttribute('data-initial-open', 'false');
  });

  it('should create QueryClient with correct default options', () => {
    const MockQueryClient = require('@tanstack/react-query').QueryClient;
    
    render(
      <ReactQueryProvider>
        <div>Content</div>
      </ReactQueryProvider>
    );

    expect(MockQueryClient).toHaveBeenCalledWith({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000
        }
      }
    });
  });

  it('should render multiple children correctly', () => {
    render(
      <ReactQueryProvider>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <span data-testid="child-3">Child 3</span>
      </ReactQueryProvider>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });

  it('should handle empty children', () => {
    render(<ReactQueryProvider>{null}</ReactQueryProvider>);
    
    expect(screen.getByTestId('query-client-provider')).toBeInTheDocument();
    expect(screen.getByTestId('react-query-devtools')).toBeInTheDocument();
  });
});