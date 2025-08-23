/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CopyButton } from '../CopyButton';

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

// Mock window.alert
global.alert = jest.fn();

describe('CopyButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render copy button with correct attributes', () => {
    render(<CopyButton text="0x1234567890abcdef" />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('title', '复制地址');
  });

  it('should have proper styling classes', () => {
    render(<CopyButton text="test-text" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'text-zinc-400',
      'hover:text-zinc-600',
      'dark:hover:text-zinc-300'
    );
  });

  it('should render SVG icon', () => {
    const { container } = render(<CopyButton text="test-text" />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('h-4', 'w-4');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
    expect(svg).toHaveAttribute('strokeWidth', '2');
  });

  it('should copy text to clipboard when clicked', async () => {
    const testText = '0x1234567890abcdef1234567890abcdef12345678';
    render(<CopyButton text={testText} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testText);
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    expect(alert).toHaveBeenCalledWith('钱包地址已复制');
  });

  it('should not copy when text is empty string', () => {
    render(<CopyButton text="" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    expect(alert).not.toHaveBeenCalled();
  });

  it('should not copy when text is null or undefined', () => {
    render(<CopyButton text={null as any} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    expect(alert).not.toHaveBeenCalled();
  });

  it('should copy different text values correctly', () => {
    const testCases = [
      'wallet-address-123',
      'contract-0x456789',
      'transaction-hash-xyz',
      'Very long text with spaces and special characters !@#$%^&*()',
    ];

    testCases.forEach(testText => {
      const { unmount } = render(<CopyButton text={testText} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testText);
      expect(alert).toHaveBeenCalledWith('钱包地址已复制');

      unmount();
      jest.clearAllMocks();
    });
  });

  it('should handle multiple clicks', () => {
    const testText = 'multi-click-test';
    render(<CopyButton text={testText} />);

    const button = screen.getByRole('button');
    
    // Click multiple times
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(3);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testText);
    expect(alert).toHaveBeenCalledTimes(3);
  });

  it('should handle clipboard API failure gracefully', async () => {
    // Mock clipboard.writeText to reject
    (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(
      new Error('Clipboard API failed')
    );

    const testText = 'test-clipboard-failure';
    render(<CopyButton text={testText} />);

    const button = screen.getByRole('button');
    
    // Should not throw error when clipboard fails
    expect(() => {
      fireEvent.click(button);
    }).not.toThrow();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testText);
  });

  it('should be keyboard accessible', () => {
    const testText = 'keyboard-test';
    render(<CopyButton text={testText} />);

    const button = screen.getByRole('button');
    
    // Focus the button
    button.focus();
    expect(button).toHaveFocus();

    // Press Enter
    fireEvent.keyDown(button, { key: 'Enter' });
    // Note: fireEvent.keyDown doesn't trigger click by default, 
    // but the button should be focusable
  });

  it('should work with special characters and unicode', () => {
    const specialText = '0x1234567890abcdef1234567890abcdef12345678üñíçødé';
    render(<CopyButton text={specialText} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(specialText);
    expect(alert).toHaveBeenCalledWith('钱包地址已复制');
  });

  it('should have correct SVG path for copy icon', () => {
    const { container } = render(<CopyButton text="test" />);

    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute('strokeLinecap', 'round');
    expect(path).toHaveAttribute('strokeLinejoin', 'round');
    expect(path).toHaveAttribute('d', 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z');
  });

  it('should maintain component state correctly', () => {
    const { rerender } = render(<CopyButton text="initial-text" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('initial-text');

    // Update props
    rerender(<CopyButton text="updated-text" />);

    fireEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('updated-text');
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(2);
  });

  describe('Client-side functionality', () => {
    it('should be a client component', () => {
      // Component uses "use client" directive
      render(<CopyButton text="test" />);
      
      // Should render interactive button
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle browser without clipboard API', () => {
      // Temporarily remove clipboard API
      const originalClipboard = navigator.clipboard;
      delete (navigator as any).clipboard;

      render(<CopyButton text="test" />);
      const button = screen.getByRole('button');

      // Should not throw when clipboard API is unavailable
      expect(() => {
        fireEvent.click(button);
      }).not.toThrow();

      // Restore clipboard API
      navigator.clipboard = originalClipboard;
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate button role', () => {
      render(<CopyButton text="test" />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should have descriptive title attribute', () => {
      render(<CopyButton text="test" />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', '复制地址');
    });

    it('should be focusable', () => {
      render(<CopyButton text="test" />);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Visual feedback', () => {
    it('should show alert notification on successful copy', () => {
      render(<CopyButton text="success-test" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(alert).toHaveBeenCalledWith('钱包地址已复制');
    });

    it('should not show alert when text is invalid', () => {
      render(<CopyButton text="" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(alert).not.toHaveBeenCalled();
    });
  });
});