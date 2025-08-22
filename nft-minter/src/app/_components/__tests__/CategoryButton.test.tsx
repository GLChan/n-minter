/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategoryButton from '../CategoryButton';

// Mock Next.js components
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/explore'),
}));

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe('CategoryButton Component', () => {
  const defaultProps = {
    categoryId: 1,
    categoryName: 'Art',
    currentTab: '1',
  };

  it('should render with category name', () => {
    render(<CategoryButton {...defaultProps} />);
    
    expect(screen.getByText('Art')).toBeInTheDocument();
  });

  it('should render as a link with correct href', () => {
    render(<CategoryButton {...defaultProps} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/explore?tab=1');
  });

  it('should apply active styles when currentTab matches categoryId', () => {
    render(<CategoryButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-foreground', 'text-background');
  });

  it('should apply inactive styles when currentTab does not match categoryId', () => {
    render(
      <CategoryButton 
        {...defaultProps} 
        currentTab="2" 
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-white', 'dark:bg-zinc-800');
    expect(button).not.toHaveClass('bg-foreground');
  });

  it('should render button with correct base classes', () => {
    render(<CategoryButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-4', 'py-2', 'rounded-full', 'text-sm', 'cursor-pointer');
  });

  it('should handle different category names', () => {
    render(
      <CategoryButton 
        categoryId={2}
        categoryName="Photography"
        currentTab="2"
      />
    );
    
    expect(screen.getByText('Photography')).toBeInTheDocument();
  });

  it('should handle different category IDs', () => {
    const { rerender } = render(
      <CategoryButton 
        categoryId={5}
        categoryName="Music"
        currentTab="5"
      />
    );
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/explore?tab=5');
    
    // Test with different ID
    rerender(
      <CategoryButton 
        categoryId={10}
        categoryName="Gaming"
        currentTab="10"
      />
    );
    
    expect(link).toHaveAttribute('href', '/explore?tab=10');
  });
});