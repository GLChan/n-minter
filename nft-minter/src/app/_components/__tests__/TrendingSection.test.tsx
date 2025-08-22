/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrendingSection from '../TrendingSection';

describe('TrendingSection Component', () => {
  it('should render the section title', () => {
    render(<TrendingSection />);

    expect(screen.getByRole('heading', { level: 2, name: '今日热门' })).toBeInTheDocument();
  });

  it('should render time filter buttons', () => {
    render(<TrendingSection />);

    expect(screen.getByRole('button', { name: '今日' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '本周' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '本月' })).toBeInTheDocument();
  });

  it('should have "今日" button active by default', () => {
    render(<TrendingSection />);

    const todayButton = screen.getByRole('button', { name: '今日' });
    const weekButton = screen.getByRole('button', { name: '本周' });
    const monthButton = screen.getByRole('button', { name: '本月' });

    expect(todayButton).toHaveClass('bg-black', 'text-white', 'dark:bg-white', 'dark:text-black');
    expect(weekButton).toHaveClass('bg-gray-100', 'text-gray-800', 'dark:bg-gray-800', 'dark:text-gray-200');
    expect(monthButton).toHaveClass('bg-gray-100', 'text-gray-800', 'dark:bg-gray-800', 'dark:text-gray-200');
  });

  it('should switch active filter when clicked', () => {
    render(<TrendingSection />);

    const todayButton = screen.getByRole('button', { name: '今日' });
    const weekButton = screen.getByRole('button', { name: '本周' });
    const monthButton = screen.getByRole('button', { name: '本月' });

    // Click week button
    fireEvent.click(weekButton);

    expect(todayButton).toHaveClass('bg-gray-100', 'text-gray-800', 'dark:bg-gray-800', 'dark:text-gray-200');
    expect(weekButton).toHaveClass('bg-black', 'text-white', 'dark:bg-white', 'dark:text-black');
    expect(monthButton).toHaveClass('bg-gray-100', 'text-gray-800', 'dark:bg-gray-800', 'dark:text-gray-200');

    // Click month button
    fireEvent.click(monthButton);

    expect(todayButton).toHaveClass('bg-gray-100', 'text-gray-800', 'dark:bg-gray-800', 'dark:text-gray-200');
    expect(weekButton).toHaveClass('bg-gray-100', 'text-gray-800', 'dark:bg-gray-800', 'dark:text-gray-200');
    expect(monthButton).toHaveClass('bg-black', 'text-white', 'dark:bg-white', 'dark:text-black');

    // Click today button again
    fireEvent.click(todayButton);

    expect(todayButton).toHaveClass('bg-black', 'text-white', 'dark:bg-white', 'dark:text-black');
    expect(weekButton).toHaveClass('bg-gray-100', 'text-gray-800', 'dark:bg-gray-800', 'dark:text-gray-200');
    expect(monthButton).toHaveClass('bg-gray-100', 'text-gray-800', 'dark:bg-gray-800', 'dark:text-gray-200');
  });

  it('should render "查看更多" button', () => {
    render(<TrendingSection />);

    const viewMoreButton = screen.getByRole('button', { name: '查看更多' });
    expect(viewMoreButton).toBeInTheDocument();
    expect(viewMoreButton).toHaveClass(
      'px-4',
      'py-2',
      'text-sm',
      'font-medium',
      'text-gray-700',
      'dark:text-gray-300',
      'border',
      'border-gray-300',
      'dark:border-gray-700',
      'rounded-full',
      'hover:bg-gray-50',
      'dark:hover:bg-gray-900'
    );
  });

  it('should have proper section structure', () => {
    const { container } = render(<TrendingSection />);

    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass('py-12');

    const wrapper = container.querySelector('.max-w-7xl.mx-auto');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
  });

  it('should have proper header layout', () => {
    const { container } = render(<TrendingSection />);

    const headerContainer = container.querySelector('.flex.items-center.justify-between.mb-8');
    expect(headerContainer).toBeInTheDocument();
  });

  it('should have filter buttons container with proper spacing', () => {
    const { container } = render(<TrendingSection />);

    const filterContainer = container.querySelector('.flex.space-x-2');
    expect(filterContainer).toBeInTheDocument();

    const buttons = filterContainer?.children;
    expect(buttons).toHaveLength(3);
  });

  it('should have proper grid layout for NFT cards', () => {
    const { container } = render(<TrendingSection />);

    const gridContainer = container.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4.gap-6');
    expect(gridContainer).toBeInTheDocument();
  });

  it('should have proper view more button container', () => {
    const { container } = render(<TrendingSection />);

    const viewMoreContainer = container.querySelector('.mt-8.text-center');
    expect(viewMoreContainer).toBeInTheDocument();
  });

  it('should have proper filter button styling', () => {
    render(<TrendingSection />);

    const buttons = [
      screen.getByRole('button', { name: '今日' }),
      screen.getByRole('button', { name: '本周' }),
      screen.getByRole('button', { name: '本月' }),
    ];

    buttons.forEach(button => {
      expect(button).toHaveClass('px-3', 'py-1', 'text-sm', 'rounded-full');
    });
  });

  it('should handle multiple state changes correctly', () => {
    render(<TrendingSection />);

    const todayButton = screen.getByRole('button', { name: '今日' });
    const weekButton = screen.getByRole('button', { name: '本周' });
    const monthButton = screen.getByRole('button', { name: '本月' });

    // Initial state
    expect(todayButton).toHaveClass('bg-black', 'text-white');

    // Switch to week multiple times
    fireEvent.click(weekButton);
    fireEvent.click(weekButton); // Should remain week
    expect(weekButton).toHaveClass('bg-black', 'text-white');
    expect(todayButton).not.toHaveClass('bg-black', 'text-white');

    // Switch to month
    fireEvent.click(monthButton);
    expect(monthButton).toHaveClass('bg-black', 'text-white');
    expect(weekButton).not.toHaveClass('bg-black', 'text-white');

    // Switch back to today
    fireEvent.click(todayButton);
    expect(todayButton).toHaveClass('bg-black', 'text-white');
    expect(monthButton).not.toHaveClass('bg-black', 'text-white');
  });

  it('should be a client component', () => {
    // Component uses useState and onClick handlers, indicating it's a client component
    render(<TrendingSection />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);

    // Test interactivity
    const weekButton = screen.getByRole('button', { name: '本周' });
    fireEvent.click(weekButton);
    expect(weekButton).toHaveClass('bg-black', 'text-white');
  });

  it('should have proper title styling', () => {
    render(<TrendingSection />);

    const title = screen.getByText('今日热门');
    expect(title).toHaveClass('text-2xl', 'font-bold', 'text-gray-900', 'dark:text-white');
  });

  it('should have proper dark mode support', () => {
    render(<TrendingSection />);

    // Check title dark mode
    const title = screen.getByText('今日热门');
    expect(title).toHaveClass('dark:text-white');

    // Check active button dark mode
    const todayButton = screen.getByRole('button', { name: '今日' });
    expect(todayButton).toHaveClass('dark:bg-white', 'dark:text-black');

    // Check inactive button dark mode
    const weekButton = screen.getByRole('button', { name: '本周' });
    expect(weekButton).toHaveClass('dark:bg-gray-800', 'dark:text-gray-200');

    // Check view more button dark mode
    const viewMoreButton = screen.getByRole('button', { name: '查看更多' });
    expect(viewMoreButton).toHaveClass(
      'dark:text-gray-300',
      'dark:border-gray-700',
      'dark:hover:bg-gray-900'
    );
  });

  it('should maintain consistent button styling patterns', () => {
    render(<TrendingSection />);

    const filterButtons = [
      screen.getByRole('button', { name: '今日' }),
      screen.getByRole('button', { name: '本周' }),
      screen.getByRole('button', { name: '本月' }),
    ];

    // All filter buttons should have consistent base classes
    filterButtons.forEach(button => {
      expect(button).toHaveClass('px-3', 'py-1', 'text-sm', 'rounded-full');
    });

    // Active button should have different styling
    const activeButton = filterButtons.find(button => 
      button.classList.contains('bg-black')
    );
    expect(activeButton).toBeDefined();

    // Inactive buttons should have consistent inactive styling
    const inactiveButtons = filterButtons.filter(button => 
      !button.classList.contains('bg-black')
    );
    inactiveButtons.forEach(button => {
      expect(button).toHaveClass('bg-gray-100', 'text-gray-800', 'dark:bg-gray-800', 'dark:text-gray-200');
    });
  });

  it('should render without NFT data (empty state)', () => {
    render(<TrendingSection />);

    // The grid container should exist but be empty
    const { container } = render(<TrendingSection />);
    const gridContainer = container.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4.gap-6');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer?.children).toHaveLength(0);
  });

  it('should have responsive layout classes', () => {
    const { container } = render(<TrendingSection />);

    // Check responsive padding
    const wrapper = container.querySelector('.px-4.sm\\:px-6.lg\\:px-8');
    expect(wrapper).toBeInTheDocument();

    // Check responsive grid
    const gridContainer = container.querySelector('.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4');
    expect(gridContainer).toBeInTheDocument();
  });

  describe('State management', () => {
    it('should initialize with today filter', () => {
      render(<TrendingSection />);

      const todayButton = screen.getByRole('button', { name: '今日' });
      expect(todayButton).toHaveClass('bg-black', 'text-white');
    });

    it('should only have one active filter at a time', () => {
      render(<TrendingSection />);

      const buttons = [
        screen.getByRole('button', { name: '今日' }),
        screen.getByRole('button', { name: '本周' }),
        screen.getByRole('button', { name: '本月' }),
      ];

      // Initially, only today should be active
      let activeButtons = buttons.filter(button => 
        button.classList.contains('bg-black')
      );
      expect(activeButtons).toHaveLength(1);

      // After clicking week, only week should be active
      fireEvent.click(buttons[1]);
      activeButtons = buttons.filter(button => 
        button.classList.contains('bg-black')
      );
      expect(activeButtons).toHaveLength(1);
      expect(activeButtons[0]).toBe(buttons[1]);

      // After clicking month, only month should be active
      fireEvent.click(buttons[2]);
      activeButtons = buttons.filter(button => 
        button.classList.contains('bg-black')
      );
      expect(activeButtons).toHaveLength(1);
      expect(activeButtons[0]).toBe(buttons[2]);
    });
  });
});