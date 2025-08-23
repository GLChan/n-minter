/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Tabs } from '../Tabs';

// Mock Next.js usePathname hook
const mockUsePathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, scroll, className, ...props }: any) => (
    <a href={href} className={className} data-scroll={scroll} {...props}>
      {children}
    </a>
  ),
}));

describe('Tabs Component', () => {
  const mockTabs = [
    { name: '拥有的NFT', slug: 'owned' },
    { name: '创建的NFT', slug: 'created' },
    { name: '收藏的NFT', slug: 'collected' },
    { name: '活动', slug: 'activity' },
    { name: '设置', slug: 'settings' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/profile');
  });

  it('should render all tabs', () => {
    render(<Tabs currentTab="owned" tabs={mockTabs} />);

    mockTabs.forEach(tab => {
      expect(screen.getByText(tab.name)).toBeInTheDocument();
    });
  });

  it('should render with proper container structure', () => {
    const { container } = render(<Tabs currentTab="owned" tabs={mockTabs} />);

    const tabsContainer = container.querySelector('.border-b.border-zinc-200.dark\\:border-zinc-800');
    expect(tabsContainer).toBeInTheDocument();

    const innerContainer = container.querySelector('.container.mx-auto.px-4');
    expect(innerContainer).toBeInTheDocument();

    const flexContainer = container.querySelector('.flex.space-x-2.overflow-x-auto.pb-px');
    expect(flexContainer).toBeInTheDocument();
  });

  it('should highlight active tab correctly', () => {
    render(<Tabs currentTab="created" tabs={mockTabs} />);

    const activeTab = screen.getByText('创建的NFT');
    expect(activeTab).toHaveClass(
      'bg-zinc-100',
      'dark:bg-zinc-800',
      'text-zinc-900',
      'dark:text-zinc-100'
    );

    const inactiveTab = screen.getByText('拥有的NFT');
    expect(inactiveTab).toHaveClass(
      'text-zinc-500',
      'dark:text-zinc-400',
      'hover:bg-zinc-100/50',
      'dark:hover:bg-zinc-800/50',
      'hover:text-zinc-700',
      'dark:hover:text-zinc-200'
    );
  });

  it('should generate correct href for each tab', () => {
    render(<Tabs currentTab="owned" tabs={mockTabs} />);

    mockTabs.forEach(tab => {
      const tabLink = screen.getByText(tab.name);
      expect(tabLink).toHaveAttribute('href', `/profile?tab=${tab.slug}`);
    });
  });

  it('should set scroll=false for all tab links', () => {
    render(<Tabs currentTab="owned" tabs={mockTabs} />);

    mockTabs.forEach(tab => {
      const tabLink = screen.getByText(tab.name);
      expect(tabLink).toHaveAttribute('data-scroll', 'false');
    });
  });

  it('should handle different currentTab values', () => {
    const testCases = ['owned', 'created', 'collected', 'activity', 'settings'];

    testCases.forEach(currentTab => {
      const { unmount } = render(<Tabs currentTab={currentTab} tabs={mockTabs} />);

      const activeTabData = mockTabs.find(tab => tab.slug === currentTab);
      if (activeTabData) {
        const activeTab = screen.getByText(activeTabData.name);
        expect(activeTab).toHaveClass('bg-zinc-100', 'dark:bg-zinc-800');
      }

      unmount();
    });
  });

  it('should handle empty tabs array', () => {
    const { container } = render(<Tabs currentTab="owned" tabs={[]} />);

    const flexContainer = container.querySelector('.flex.space-x-2');
    expect(flexContainer).toBeInTheDocument();
    expect(flexContainer?.children).toHaveLength(0);
  });

  it('should handle single tab', () => {
    const singleTab = [{ name: '单个标签', slug: 'single' }];
    render(<Tabs currentTab="single" tabs={singleTab} />);

    expect(screen.getByText('单个标签')).toBeInTheDocument();
    expect(screen.getByText('单个标签')).toHaveClass('bg-zinc-100', 'dark:bg-zinc-800');
  });

  it('should handle currentTab not matching any tab slug', () => {
    render(<Tabs currentTab="nonexistent" tabs={mockTabs} />);

    // All tabs should be inactive when currentTab doesn't match
    mockTabs.forEach(tab => {
      const tabElement = screen.getByText(tab.name);
      expect(tabElement).toHaveClass('text-zinc-500', 'dark:text-zinc-400');
      expect(tabElement).not.toHaveClass('bg-zinc-100', 'dark:bg-zinc-800');
    });
  });

  it('should use pathname from usePathname hook', () => {
    mockUsePathname.mockReturnValue('/custom-profile');
    
    render(<Tabs currentTab="owned" tabs={mockTabs} />);

    mockTabs.forEach(tab => {
      const tabLink = screen.getByText(tab.name);
      expect(tabLink).toHaveAttribute('href', `/custom-profile?tab=${tab.slug}`);
    });
  });

  it('should have proper styling for all tabs', () => {
    render(<Tabs currentTab="owned" tabs={mockTabs} />);

    mockTabs.forEach(tab => {
      const tabElement = screen.getByText(tab.name);
      expect(tabElement).toHaveClass(
        'px-4',
        'py-2',
        'text-sm',
        'font-medium',
        'rounded-md',
        'transition-colors'
      );
    });
  });

  it('should handle tabs with special characters', () => {
    const specialTabs = [
      { name: 'Tab & Name', slug: 'special-1' },
      { name: 'Tab "Name"', slug: 'special-2' },
      { name: 'Tab <Name>', slug: 'special-3' },
    ];

    render(<Tabs currentTab="special-1" tabs={specialTabs} />);

    expect(screen.getByText('Tab & Name')).toBeInTheDocument();
    expect(screen.getByText('Tab "Name"')).toBeInTheDocument();
    expect(screen.getByText('Tab <Name>')).toBeInTheDocument();
  });

  it('should handle long tab names', () => {
    const longTabs = [
      { name: 'Very Long Tab Name That Might Wrap', slug: 'long-1' },
      { name: 'Another Extremely Long Tab Name That Should Be Handled Gracefully', slug: 'long-2' },
    ];

    render(<Tabs currentTab="long-1" tabs={longTabs} />);

    expect(screen.getByText('Very Long Tab Name That Might Wrap')).toBeInTheDocument();
    expect(screen.getByText('Another Extremely Long Tab Name That Should Be Handled Gracefully')).toBeInTheDocument();
  });

  it('should have overflow-x-auto for horizontal scrolling', () => {
    const { container } = render(<Tabs currentTab="owned" tabs={mockTabs} />);

    const scrollContainer = container.querySelector('.overflow-x-auto');
    expect(scrollContainer).toBeInTheDocument();
    expect(scrollContainer).toHaveClass('flex', 'space-x-2', 'pb-px');
  });

  it('should maintain consistent spacing between tabs', () => {
    const { container } = render(<Tabs currentTab="owned" tabs={mockTabs} />);

    const flexContainer = container.querySelector('.space-x-2');
    expect(flexContainer).toBeInTheDocument();
  });

  describe('TabButton component', () => {
    it('should render as Link component', () => {
      render(<Tabs currentTab="owned" tabs={[{ name: 'Test Tab', slug: 'test' }]} />);

      const tabLink = screen.getByText('Test Tab');
      expect(tabLink).toBeInTheDocument();
      expect(tabLink.tagName).toBe('A'); // Should render as anchor tag from mocked Link
    });

    it('should apply active styles when tab is active', () => {
      render(<Tabs currentTab="test" tabs={[{ name: 'Test Tab', slug: 'test' }]} />);

      const activeTab = screen.getByText('Test Tab');
      expect(activeTab).toHaveClass(
        'bg-zinc-100',
        'dark:bg-zinc-800',
        'text-zinc-900',
        'dark:text-zinc-100'
      );
    });

    it('should apply inactive styles when tab is not active', () => {
      render(<Tabs currentTab="other" tabs={[{ name: 'Test Tab', slug: 'test' }]} />);

      const inactiveTab = screen.getByText('Test Tab');
      expect(inactiveTab).toHaveClass(
        'text-zinc-500',
        'dark:text-zinc-400',
        'hover:bg-zinc-100/50',
        'dark:hover:bg-zinc-800/50',
        'hover:text-zinc-700',
        'dark:hover:text-zinc-200'
      );
    });
  });

  describe('Accessibility', () => {
    it('should render links that are keyboard accessible', () => {
      render(<Tabs currentTab="owned" tabs={mockTabs} />);

      mockTabs.forEach(tab => {
        const tabLink = screen.getByText(tab.name);
        expect(tabLink).toHaveAttribute('href');
      });
    });

    it('should maintain semantic structure', () => {
      const { container } = render(<Tabs currentTab="owned" tabs={mockTabs} />);

      // Should have proper container hierarchy
      expect(container.querySelector('.container')).toBeInTheDocument();
      expect(container.querySelector('.flex')).toBeInTheDocument();
    });
  });

  describe('Responsive design', () => {
    it('should have responsive classes', () => {
      const { container } = render(<Tabs currentTab="owned" tabs={mockTabs} />);

      const outerContainer = container.querySelector('.border-b');
      expect(outerContainer).toHaveClass('mt-8');

      const innerContainer = container.querySelector('.container');
      expect(innerContainer).toHaveClass('mx-auto', 'px-4');

      const flexContainer = container.querySelector('.flex');
      expect(flexContainer).toHaveClass('overflow-x-auto');
    });
  });

  describe('Dark mode support', () => {
    it('should have dark mode classes for container', () => {
      const { container } = render(<Tabs currentTab="owned" tabs={mockTabs} />);

      const borderContainer = container.querySelector('.border-b');
      expect(borderContainer).toHaveClass('dark:border-zinc-800');
    });

    it('should have dark mode classes for active tabs', () => {
      render(<Tabs currentTab="owned" tabs={mockTabs} />);

      const activeTab = screen.getByText('拥有的NFT');
      expect(activeTab).toHaveClass('dark:bg-zinc-800', 'dark:text-zinc-100');
    });

    it('should have dark mode classes for inactive tabs', () => {
      render(<Tabs currentTab="owned" tabs={mockTabs} />);

      const inactiveTab = screen.getByText('创建的NFT');
      expect(inactiveTab).toHaveClass(
        'dark:text-zinc-400',
        'dark:hover:bg-zinc-800/50',
        'dark:hover:text-zinc-200'
      );
    });
  });
});