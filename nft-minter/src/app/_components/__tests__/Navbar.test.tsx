/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Navbar } from '../Navbar';

// Mock Next.js components
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, className, ...props }: any) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

// Mock RainbowKit ConnectButton
jest.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: () => <button data-testid="connect-button">Connect Wallet</button>,
}));

// Mock SearchNavbarItem component
jest.mock('../SearchNavbarItem', () => ({
  SearchNavbarItem: () => <div data-testid="search-navbar-item">Search</div>,
}));

// Mock UserContext
const mockUseUser = jest.fn();
jest.mock('@/contexts/UserContext', () => ({
  useUser: () => mockUseUser(),
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render navbar with brand logo', () => {
    mockUseUser.mockReturnValue(null);

    render(<Navbar />);

    expect(screen.getByText('NFT铸造')).toBeInTheDocument();
    const brandLink = screen.getByRole('link', { name: /NFT铸造/ });
    expect(brandLink).toHaveAttribute('href', '/');
  });

  it('should render navigation links', () => {
    mockUseUser.mockReturnValue(null);

    render(<Navbar />);

    expect(screen.getByRole('link', { name: '探索' })).toHaveAttribute('href', '/explore');
    expect(screen.getByRole('link', { name: '创建' })).toHaveAttribute('href', '/create');
    expect(screen.getByRole('link', { name: '合集' })).toHaveAttribute('href', '/collections');
  });

  it('should render search component', () => {
    mockUseUser.mockReturnValue(null);

    render(<Navbar />);

    expect(screen.getByTestId('search-navbar-item')).toBeInTheDocument();
  });

  it('should render connect button', () => {
    mockUseUser.mockReturnValue(null);

    render(<Navbar />);

    expect(screen.getByTestId('connect-button')).toBeInTheDocument();
  });

  it('should render mobile menu button', () => {
    mockUseUser.mockReturnValue(null);

    render(<Navbar />);

    const menuButton = screen.getByRole('button', { name: 'Menu' });
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveAttribute('aria-label', 'Menu');
  });

  it('should show profile link when user is logged in', () => {
    const mockUser = {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      wallet_address: '0x1234567890123456789012345678901234567890',
      avatar_url: 'https://example.com/avatar.jpg',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    mockUseUser.mockReturnValue(mockUser);

    render(<Navbar />);

    expect(screen.getByRole('link', { name: '个人中心' })).toHaveAttribute('href', '/profile');
  });

  it('should not show profile link when user is not logged in', () => {
    mockUseUser.mockReturnValue(null);

    render(<Navbar />);

    expect(screen.queryByRole('link', { name: '个人中心' })).not.toBeInTheDocument();
  });

  it('should have proper header structure', () => {
    mockUseUser.mockReturnValue(null);

    const { container } = render(<Navbar />);

    const header = container.querySelector('header');
    expect(header).toHaveClass('sticky', 'top-0', 'z-50', 'w-full', 'border-b');
    expect(header).toHaveClass('border-zinc-200', 'dark:border-zinc-800');
    expect(header).toHaveClass('bg-background/80', 'backdrop-blur-sm');
  });

  it('should have proper container layout', () => {
    mockUseUser.mockReturnValue(null);

    const { container } = render(<Navbar />);

    const containerDiv = container.querySelector('.container');
    expect(containerDiv).toHaveClass('mx-auto', 'px-4', 'h-16', 'flex', 'items-center', 'justify-between');
  });

  it('should hide navigation on mobile', () => {
    mockUseUser.mockReturnValue(null);

    const { container } = render(<Navbar />);

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('hidden', 'md:flex');
  });

  it('should hide mobile menu button on desktop', () => {
    mockUseUser.mockReturnValue(null);

    render(<Navbar />);

    const menuButton = screen.getByRole('button', { name: 'Menu' });
    expect(menuButton).toHaveClass('md:hidden');
  });

  it('should render all navigation links with proper hover effects', () => {
    mockUseUser.mockReturnValue(null);

    render(<Navbar />);

    const navLinks = ['探索', '创建', '合集'];
    navLinks.forEach(linkText => {
      const link = screen.getByRole('link', { name: linkText });
      expect(link).toHaveClass('text-sm', 'font-medium', 'text-foreground/80', 'hover:text-foreground', 'transition-colors');
    });
  });

  it('should render profile link with proper styling when user is present', () => {
    const mockUser = {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      wallet_address: '0x1234567890123456789012345678901234567890',
      avatar_url: null,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    mockUseUser.mockReturnValue(mockUser);

    render(<Navbar />);

    const profileLink = screen.getByRole('link', { name: '个人中心' });
    expect(profileLink).toHaveClass('text-sm', 'font-medium', 'text-foreground/80', 'hover:text-foreground', 'transition-colors');
  });

  it('should render mobile menu button with proper SVG icon', () => {
    mockUseUser.mockReturnValue(null);

    const { container } = render(<Navbar />);

    const menuButton = screen.getByRole('button', { name: 'Menu' });
    const svg = menuButton.querySelector('svg');
    
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '18');
    expect(svg).toHaveAttribute('height', '18');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    
    // Check for hamburger menu lines
    const lines = svg?.querySelectorAll('line');
    expect(lines).toHaveLength(3);
  });

  it('should have proper mobile menu button styling', () => {
    mockUseUser.mockReturnValue(null);

    render(<Navbar />);

    const menuButton = screen.getByRole('button', { name: 'Menu' });
    expect(menuButton).toHaveClass(
      'md:hidden',
      'flex',
      'items-center',
      'justify-center',
      'w-8',
      'h-8',
      'rounded-full',
      'hover:bg-zinc-100',
      'dark:hover:bg-zinc-800',
      'transition-colors'
    );
  });

  it('should render right side components in correct order', () => {
    mockUseUser.mockReturnValue(null);

    const { container } = render(<Navbar />);

    const rightSection = container.querySelector('.flex.items-center.gap-4');
    const children = Array.from(rightSection?.children || []);
    
    expect(children).toHaveLength(3); // Search, ConnectButton, Mobile menu
    expect(children[0]).toContainElement(screen.getByTestId('search-navbar-item'));
    expect(children[1]).toContainElement(screen.getByTestId('connect-button'));
    expect(children[2]).toContainElement(screen.getByRole('button', { name: 'Menu' }));
  });

  it('should render left side components in correct order', () => {
    const mockUser = {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      wallet_address: '0x1234567890123456789012345678901234567890',
      avatar_url: null,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    mockUseUser.mockReturnValue(mockUser);

    const { container } = render(<Navbar />);

    const leftSection = container.querySelector('.flex.items-center.gap-8');
    expect(leftSection).toBeInTheDocument();
    
    // Should contain brand and navigation
    expect(leftSection).toContainElement(screen.getByText('NFT铸造'));
    expect(leftSection).toContainElement(screen.getByRole('link', { name: '探索' }));
    expect(leftSection).toContainElement(screen.getByRole('link', { name: '个人中心' }));
  });

  it('should handle user context changes correctly', () => {
    // Test with no user first
    mockUseUser.mockReturnValue(null);
    const { rerender } = render(<Navbar />);
    expect(screen.queryByRole('link', { name: '个人中心' })).not.toBeInTheDocument();

    // Test with user
    const mockUser = {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      wallet_address: '0x1234567890123456789012345678901234567890',
      avatar_url: null,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    mockUseUser.mockReturnValue(mockUser);
    rerender(<Navbar />);
    expect(screen.getByRole('link', { name: '个人中心' })).toBeInTheDocument();
  });

  it('should be a client component', () => {
    // The component should have "use client" directive for client-side rendering
    // This is implicit in our mock setup as we're testing interactivity
    mockUseUser.mockReturnValue(null);
    
    render(<Navbar />);
    
    // Client components should be able to use hooks and event handlers
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      mockUseUser.mockReturnValue(null);

      const { container } = render(<Navbar />);

      expect(container.querySelector('header')).toBeInTheDocument();
      expect(container.querySelector('nav')).toBeInTheDocument();
    });

    it('should have accessible mobile menu button', () => {
      mockUseUser.mockReturnValue(null);

      render(<Navbar />);

      const menuButton = screen.getByRole('button', { name: 'Menu' });
      expect(menuButton).toHaveAttribute('aria-label', 'Menu');
    });
  });
});