/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchNavbarItem } from '../SearchNavbarItem';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Loader2: ({ className, ...props }: any) => (
    <div data-testid="loader-icon" className={className} {...props}>
      Loading...
    </div>
  ),
}));

// Mock timers for async operations
jest.useFakeTimers();

describe('SearchNavbarItem Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  it('should render search button', () => {
    render(<SearchNavbarItem />);

    const searchButton = screen.getByRole('button', { name: 'Search' });
    expect(searchButton).toBeInTheDocument();
    expect(searchButton).toHaveAttribute('aria-label', 'Search');
  });

  it('should toggle search dropdown when button is clicked', () => {
    render(<SearchNavbarItem />);

    const searchButton = screen.getByRole('button', { name: 'Search' });
    
    // Initially closed
    expect(screen.queryByPlaceholderText('搜索 NFT、合集或创作者...')).not.toBeInTheDocument();
    
    // Click to open
    fireEvent.click(searchButton);
    expect(screen.getByPlaceholderText('搜索 NFT、合集或创作者...')).toBeInTheDocument();
    
    // Click to close
    fireEvent.click(searchButton);
    expect(screen.queryByPlaceholderText('搜索 NFT、合集或创作者...')).not.toBeInTheDocument();
  });

  it('should render search input with placeholder', () => {
    render(<SearchNavbarItem />);

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    const searchInput = screen.getByPlaceholderText('搜索 NFT、合集或创作者...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('autoFocus');
  });

  it('should handle search input changes', () => {
    render(<SearchNavbarItem />);

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    const searchInput = screen.getByPlaceholderText('搜索 NFT、合集或创作者...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    expect(searchInput).toHaveValue('test search');
  });

  it('should submit search and navigate to search page', async () => {
    render(<SearchNavbarItem />);

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    const searchInput = screen.getByPlaceholderText('搜索 NFT、合集或创作者...');
    const submitButton = screen.getByRole('button', { name: 'Submit search' });

    fireEvent.change(searchInput, { target: { value: 'cool nft' } });
    fireEvent.click(submitButton);

    // Should show loading state
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();

    // Fast forward timers
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/search?q=cool%20nft');
    });
  });

  it('should submit search on form submission', async () => {
    render(<SearchNavbarItem />);

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    const searchInput = screen.getByPlaceholderText('搜索 NFT、合集或创作者...');
    fireEvent.change(searchInput, { target: { value: 'digital art' } });
    fireEvent.submit(searchInput.closest('form')!);

    // Should show loading state
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/search?q=digital%20art');
    });
  });

  it('should not submit empty search', () => {
    render(<SearchNavbarItem />);

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    const submitButton = screen.getByRole('button', { name: 'Submit search' });
    expect(submitButton).toBeDisabled();

    // Try to submit with only spaces
    const searchInput = screen.getByPlaceholderText('搜索 NFT、合集或创作者...');
    fireEvent.change(searchInput, { target: { value: '   ' } });
    expect(submitButton).toBeDisabled();
  });

  it('should render recent searches when no query', () => {
    render(<SearchNavbarItem />);

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    expect(screen.getByText('最近搜索')).toBeInTheDocument();
    expect(screen.getByText('Cool NFT Collection')).toBeInTheDocument();
    expect(screen.getByText('Top Creators')).toBeInTheDocument();
    expect(screen.getByText('Abstract Art')).toBeInTheDocument();
  });

  it('should render hot tags', () => {
    render(<SearchNavbarItem />);

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    expect(screen.getByText('热门标签')).toBeInTheDocument();
    expect(screen.getByText('数字艺术')).toBeInTheDocument();
    expect(screen.getByText('加密朋克')).toBeInTheDocument();
    expect(screen.getByText('元宇宙')).toBeInTheDocument();
    expect(screen.getByText('游戏资产')).toBeInTheDocument();
    expect(screen.getByText('音乐NFT')).toBeInTheDocument();
  });

  it('should handle hot tag clicks', async () => {
    render(<SearchNavbarItem />);

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    const tagButton = screen.getByText('数字艺术');
    fireEvent.click(tagButton);

    // Should show loading state
    expect(screen.getByText('搜索中...')).toBeInTheDocument();

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/search?q=%E6%95%B0%E5%AD%97%E8%89%BA%E6%9C%AF');
    });
  });

  it('should handle recent search clicks', async () => {
    render(<SearchNavbarItem />);

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    const recentSearchButton = screen.getByText('Cool NFT Collection');
    fireEvent.click(recentSearchButton);

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/search?q=Cool%20NFT%20Collection');
    });
  });

  it('should clear recent searches', () => {
    render(<SearchNavbarItem />);

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    const clearButton = screen.getByText('清除');
    fireEvent.click(clearButton);

    expect(screen.queryByText('最近搜索')).not.toBeInTheDocument();
    expect(screen.queryByText('Cool NFT Collection')).not.toBeInTheDocument();
  });

  it('should add to recent searches when submitting new search', async () => {
    render(<SearchNavbarItem />);

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    const searchInput = screen.getByPlaceholderText('搜索 NFT、合集或创作者...');
    fireEvent.change(searchInput, { target: { value: 'new search term' } });
    fireEvent.submit(searchInput.closest('form')!);

    jest.advanceTimersByTime(500);

    // Reopen search to check recent searches
    fireEvent.click(searchButton);
    fireEvent.click(searchButton);

    expect(screen.getByText('new search term')).toBeInTheDocument();
  });

  it('should not add duplicate recent searches', async () => {
    render(<SearchNavbarItem />);

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    // Submit existing recent search term
    const searchInput = screen.getByPlaceholderText('搜索 NFT、合集或创作者...');
    fireEvent.change(searchInput, { target: { value: 'Cool NFT Collection' } });
    fireEvent.submit(searchInput.closest('form')!);

    jest.advanceTimersByTime(500);

    // Reopen and check that there's still only one instance
    fireEvent.click(searchButton);
    fireEvent.click(searchButton);

    const recentItems = screen.getAllByText('Cool NFT Collection');
    expect(recentItems).toHaveLength(1);
  });

  it('should limit recent searches to 5 items', async () => {
    render(<SearchNavbarItem />);

    const searchButton = screen.getByRole('button', { name: 'Search' });
    
    // Add 6 new searches
    for (let i = 1; i <= 6; i++) {
      fireEvent.click(searchButton);
      const searchInput = screen.getByPlaceholderText('搜索 NFT、合集或创作者...');
      fireEvent.change(searchInput, { target: { value: `search ${i}` } });
      fireEvent.submit(searchInput.closest('form')!);
      jest.advanceTimersByTime(500);
    }

    // Reopen and check recent searches
    fireEvent.click(searchButton);
    fireEvent.click(searchButton);

    // Should only show the most recent 5 searches
    expect(screen.getByText('search 6')).toBeInTheDocument();
    expect(screen.getByText('search 5')).toBeInTheDocument();
    expect(screen.getByText('search 4')).toBeInTheDocument();
    expect(screen.getByText('search 3')).toBeInTheDocument();
    expect(screen.getByText('search 2')).toBeInTheDocument();
    expect(screen.queryByText('search 1')).not.toBeInTheDocument();
  });

  it('should close dropdown when clicking outside', () => {
    render(
      <div>
        <SearchNavbarItem />
        <div data-testid="outside-element">Outside</div>
      </div>
    );

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    expect(screen.getByPlaceholderText('搜索 NFT、合集或创作者...')).toBeInTheDocument();

    // Click outside
    const outsideElement = screen.getByTestId('outside-element');
    fireEvent.mouseDown(outsideElement);

    expect(screen.queryByPlaceholderText('搜索 NFT、合集或创作者...')).not.toBeInTheDocument();
  });

  it('should disable input and submit button during search', async () => {
    render(<SearchNavbarItem />);

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    const searchInput = screen.getByPlaceholderText('搜索 NFT、合集或创作者...');
    const submitButton = screen.getByRole('button', { name: 'Submit search' });

    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.click(submitButton);

    expect(searchInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('should show loading state during search', async () => {
    render(<SearchNavbarItem />);

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    const searchInput = screen.getByPlaceholderText('搜索 NFT、合集或创作者...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.submit(searchInput.closest('form')!);

    expect(screen.getByText('搜索中...')).toBeInTheDocument();
    expect(screen.getAllByTestId('loader-icon')).toHaveLength(2); // One in submit button, one in loading overlay
  });

  it('should have proper responsive classes', () => {
    render(<SearchNavbarItem />);

    const searchButton = screen.getByRole('button', { name: 'Search' });
    expect(searchButton).toHaveClass('hidden', 'sm:flex');
  });

  it('should have proper dropdown positioning and styling', () => {
    const { container } = render(<SearchNavbarItem />);

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    const dropdown = container.querySelector('.absolute.right-0.top-full');
    expect(dropdown).toHaveClass(
      'mt-2',
      'w-80',
      'md:w-96',
      'bg-white',
      'dark:bg-zinc-900',
      'rounded-lg',
      'shadow-xl',
      'border',
      'z-50'
    );
  });

  it('should handle keyboard navigation properly', () => {
    render(<SearchNavbarItem />);

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    const searchInput = screen.getByPlaceholderText('搜索 NFT、合集或创作者...');
    
    // Test Enter key submission
    fireEvent.change(searchInput, { target: { value: 'keyboard test' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<SearchNavbarItem />);

      const searchButton = screen.getByRole('button', { name: 'Search' });
      expect(searchButton).toHaveAttribute('aria-label', 'Search');

      fireEvent.click(searchButton);

      const submitButton = screen.getByRole('button', { name: 'Submit search' });
      expect(submitButton).toHaveAttribute('aria-label', 'Submit search');
    });

    it('should be keyboard accessible', () => {
      render(<SearchNavbarItem />);

      const searchButton = screen.getByRole('button', { name: 'Search' });
      searchButton.focus();
      
      fireEvent.keyDown(searchButton, { key: 'Enter' });
      expect(screen.getByPlaceholderText('搜索 NFT、合集或创作者...')).toBeInTheDocument();
    });

    it('should have proper focus management', () => {
      render(<SearchNavbarItem />);

      const searchButton = screen.getByRole('button', { name: 'Search' });
      fireEvent.click(searchButton);

      const searchInput = screen.getByPlaceholderText('搜索 NFT、合集或创作者...');
      expect(searchInput).toHaveAttribute('autoFocus');
    });
  });
});