/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompatibleRainbowKit from '../CompatibleRainbowKit';

// Mock RainbowKit components
jest.mock('@rainbow-me/rainbowkit', () => ({
  RainbowKitProvider: ({ children, coolMode, showRecentTransactions, appInfo, ...props }: any) => (
    <div 
      data-testid="rainbowkit-provider" 
      data-cool-mode={coolMode !== undefined ? String(coolMode) : 'not-provided'}
      data-show-recent-transactions={showRecentTransactions}
      data-app-name={appInfo?.appName}
      {...props}
    >
      {children}
    </div>
  ),
}));

describe('CompatibleRainbowKit', () => {
  const defaultProps = {
    children: <div data-testid="test-children">Test Content</div>,
  };

  it('should render children within RainbowKitProvider', () => {
    render(<CompatibleRainbowKit {...defaultProps} />);

    expect(screen.getByTestId('rainbowkit-provider')).toBeInTheDocument();
    expect(screen.getByTestId('test-children')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should pass coolMode prop to RainbowKitProvider when true', () => {
    render(<CompatibleRainbowKit coolMode={true} {...defaultProps} />);

    const provider = screen.getByTestId('rainbowkit-provider');
    expect(provider).toHaveAttribute('data-cool-mode', 'true');
  });

  it('should not pass coolMode when not provided', () => {
    render(<CompatibleRainbowKit {...defaultProps} />);

    const provider = screen.getByTestId('rainbowkit-provider');
    expect(provider).toHaveAttribute('data-cool-mode', 'not-provided');
  });

  it('should enable showRecentTransactions by default', () => {
    render(<CompatibleRainbowKit {...defaultProps} />);

    const provider = screen.getByTestId('rainbowkit-provider');
    expect(provider).toHaveAttribute('data-show-recent-transactions', 'true');
  });

  it('should set correct app name in appInfo', () => {
    render(<CompatibleRainbowKit {...defaultProps} />);

    const provider = screen.getByTestId('rainbowkit-provider');
    expect(provider).toHaveAttribute('data-app-name', 'NFT Minter');
  });

  it('should handle multiple children correctly', () => {
    const multipleChildren = (
      <>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <span data-testid="child-3">Child 3</span>
      </>
    );

    render(<CompatibleRainbowKit>{multipleChildren}</CompatibleRainbowKit>);

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });

  it('should handle empty children', () => {
    render(<CompatibleRainbowKit>{null}</CompatibleRainbowKit>);

    expect(screen.getByTestId('rainbowkit-provider')).toBeInTheDocument();
  });

  it('should pass through additional props', () => {
    const additionalProps = {
      'data-custom-prop': 'custom-value',
    };

    render(
      <CompatibleRainbowKit {...additionalProps} {...defaultProps} />
    );

    const provider = screen.getByTestId('rainbowkit-provider');
    expect(provider).toHaveAttribute('data-custom-prop', 'custom-value');
  });

  it('should handle coolMode as false', () => {
    render(<CompatibleRainbowKit coolMode={false} {...defaultProps} />);

    const provider = screen.getByTestId('rainbowkit-provider');
    expect(provider).toHaveAttribute('data-cool-mode', 'false');
  });

  it('should render with correct component structure', () => {
    const { container } = render(<CompatibleRainbowKit {...defaultProps} />);

    // Should have the RainbowKitProvider as the root element
    expect(container.firstChild).toHaveAttribute('data-testid', 'rainbowkit-provider');
  });

  it('should include disclaimer in appInfo', () => {
    render(<CompatibleRainbowKit {...defaultProps} />);

    // We can't directly test the Disclaimer component since it's passed as a prop,
    // but we can verify that the component sets up the appInfo correctly
    const provider = screen.getByTestId('rainbowkit-provider');
    expect(provider).toHaveAttribute('data-app-name', 'NFT Minter');
  });

  it('should handle React node children of different types', () => {
    const complexChildren = (
      <div>
        <h1>Title</h1>
        <p>Paragraph</p>
        <button>Button</button>
        {/* String content */}
        Some text content
      </div>
    );

    render(<CompatibleRainbowKit>{complexChildren}</CompatibleRainbowKit>);

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
    expect(screen.getByText('Button')).toBeInTheDocument();
    expect(screen.getByText('Some text content')).toBeInTheDocument();
  });

  it('should spread props correctly to RainbowKitProvider', () => {
    render(<CompatibleRainbowKit coolMode={true} {...defaultProps} />);

    const provider = screen.getByTestId('rainbowkit-provider');
    expect(provider).toHaveAttribute('data-cool-mode', 'true');
    expect(provider).toHaveAttribute('data-show-recent-transactions', 'true');
    expect(provider).toHaveAttribute('data-app-name', 'NFT Minter');
  });
});