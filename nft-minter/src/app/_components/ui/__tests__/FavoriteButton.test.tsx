/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FavoriteButton } from '../FavoriteButton';

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Heart: ({ className, ...props }: any) => (
    <svg data-testid="heart-icon" className={className} {...props}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
}));

// Mock react-hot-toast
const mockToastError = jest.fn();
const mockToastSuccess = jest.fn();
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: mockToastError,
    success: mockToastSuccess,
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('FavoriteButton Component', () => {
  const defaultProps = {
    nftId: 'nft-123',
    isAuth: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('should not render initially (hydration protection)', () => {
    const { container } = render(<FavoriteButton {...defaultProps} />);

    // Component should return null initially to prevent hydration issues
    expect(container.firstChild).toBeNull();
  });

  it('should render after mount', async () => {
    render(<FavoriteButton {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
  });

  it('should render with unfavorited state by default', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ favorited: false }),
    });

    render(<FavoriteButton {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', '收藏');

    const heartIcon = screen.getByTestId('heart-icon');
    expect(heartIcon).toHaveClass('fill-transparent', 'text-zinc-600', 'dark:text-zinc-400');
  });

  it('should render with favorited state when initialFavorited is true', async () => {
    render(<FavoriteButton {...defaultProps} initialFavorited={true} />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', '取消收藏');

    const heartIcon = screen.getByTestId('heart-icon');
    expect(heartIcon).toHaveClass('fill-red-500', 'text-red-500');
  });

  it('should check favorite status on mount when authenticated', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ favorited: true }),
    });

    render(<FavoriteButton {...defaultProps} />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/nft/favorite?nftId=nft-123', {
        method: 'GET',
      });
    });

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', '取消收藏');
    });
  });

  it('should not check favorite status when not authenticated', async () => {
    render(<FavoriteButton {...defaultProps} isAuth={false} />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it('should not check favorite status when no nftId', async () => {
    render(<FavoriteButton {...defaultProps} nftId="" />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it('should show login toast when unauthenticated user clicks', async () => {
    render(<FavoriteButton {...defaultProps} isAuth={false} />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockToastError).toHaveBeenCalledWith('请先登录', { position: 'bottom-center' });
  });

  it('should toggle favorite when authenticated user clicks', async () => {
    // Mock initial status check
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ favorited: false }),
      })
      // Mock favorite toggle
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<FavoriteButton {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/nft/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nftId: 'nft-123', action: 'add' }),
      });
    });

    expect(mockToastSuccess).toHaveBeenCalledWith('已添加到收藏');
  });

  it('should handle removing from favorites', async () => {
    // Mock initial status as favorited
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ favorited: true }),
      })
      // Mock unfavorite action
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<FavoriteButton {...defaultProps} />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', '取消收藏');
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/nft/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nftId: 'nft-123', action: 'remove' }),
      });
    });

    expect(mockToastSuccess).toHaveBeenCalledWith('已从收藏中移除');
  });

  it('should disable button while loading', async () => {
    // Mock slow API response
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ favorited: false }),
      })
      .mockImplementationOnce(
        () => new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ success: true }),
          }), 100)
        )
      );

    render(<FavoriteButton {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Button should be disabled while loading
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-70', 'cursor-not-allowed');
  });

  it('should prevent multiple clicks while loading', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ favorited: false }),
      })
      .mockImplementationOnce(
        () => new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ success: true }),
          }), 100)
        )
      );

    render(<FavoriteButton {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const button = screen.getByRole('button');
    
    // Click multiple times rapidly
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    // Only one API call should be made
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2); // 1 for initial status + 1 for toggle
    });
  });

  it('should handle API error gracefully', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ favorited: false }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Server error' }),
      });

    render(<FavoriteButton {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('操作失败，请重试');
    });
  });

  it('should handle network error gracefully', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ favorited: false }),
      })
      .mockRejectedValueOnce(new Error('Network error'));

    render(<FavoriteButton {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('发生错误，请稍后再试');
    });
  });

  it('should handle initial status check error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Status check failed'));

    render(<FavoriteButton {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith('获取收藏状态错误:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  it('should update UI state after successful toggle', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ favorited: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<FavoriteButton {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    // Initially unfavorited
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', '收藏');
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Should become favorited after successful toggle
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', '取消收藏');
    });

    const heartIcon = screen.getByTestId('heart-icon');
    expect(heartIcon).toHaveClass('fill-red-500', 'text-red-500');
  });

  it('should have proper button styling', async () => {
    render(<FavoriteButton {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'flex',
      'items-center',
      'justify-center',
      'p-2',
      'rounded-full',
      'transition-all',
      'duration-200'
    );
    
    // Should have hover states when not loading
    expect(button).toHaveClass('hover:bg-zinc-100', 'dark:hover:bg-zinc-800');
  });

  it('should have proper heart icon styling', async () => {
    render(<FavoriteButton {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
    });

    const heartIcon = screen.getByTestId('heart-icon');
    expect(heartIcon).toHaveClass(
      'w-5',
      'h-5',
      'transition-all',
      'duration-300'
    );
  });

  it('should handle different nftId changes', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ favorited: false }),
    });

    const { rerender } = render(<FavoriteButton {...defaultProps} nftId="nft-1" />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/nft/favorite?nftId=nft-1', {
        method: 'GET',
      });
    });

    // Change nftId
    rerender(<FavoriteButton {...defaultProps} nftId="nft-2" />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/nft/favorite?nftId=nft-2', {
        method: 'GET',
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label for favorited state', async () => {
      render(<FavoriteButton {...defaultProps} initialFavorited={true} />);

      await waitFor(() => {
        expect(screen.getByRole('button')).toHaveAttribute('aria-label', '取消收藏');
      });
    });

    it('should have proper aria-label for unfavorited state', async () => {
      render(<FavoriteButton {...defaultProps} initialFavorited={false} />);

      await waitFor(() => {
        expect(screen.getByRole('button')).toHaveAttribute('aria-label', '收藏');
      });
    });

    it('should be keyboard accessible', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ favorited: false }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      render(<FavoriteButton {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();

      fireEvent.keyDown(button, { key: 'Enter' });

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('已添加到收藏');
      });
    });
  });
});