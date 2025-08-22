/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SuggestedCreators from '../SuggestedCreators';

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className, ...props }: any) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      {...props}
    />
  ),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, className, ...props }: any) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

describe('SuggestedCreators Component', () => {
  it('should render the section title', () => {
    render(<SuggestedCreators />);

    expect(screen.getByRole('heading', { level: 2, name: '推荐创作者' })).toBeInTheDocument();
  });

  it('should render all creators', () => {
    render(<SuggestedCreators />);

    expect(screen.getByText('zhang3')).toBeInTheDocument();
    expect(screen.getByText('li4')).toBeInTheDocument();
    expect(screen.getByText('wang5')).toBeInTheDocument();
    expect(screen.getByText('zhou6')).toBeInTheDocument();
  });

  it('should render creator avatars with correct attributes', () => {
    render(<SuggestedCreators />);

    const zhang3Avatar = screen.getByAltText('zhang3');
    expect(zhang3Avatar).toHaveAttribute('src', '/images/avatar1.jpg');
    expect(zhang3Avatar).toHaveAttribute('width', '80');
    expect(zhang3Avatar).toHaveAttribute('height', '80');
    expect(zhang3Avatar).toHaveClass('object-cover');

    const li4Avatar = screen.getByAltText('li4');
    expect(li4Avatar).toHaveAttribute('src', '/images/avatar2.jpg');

    const wang5Avatar = screen.getByAltText('wang5');
    expect(wang5Avatar).toHaveAttribute('src', '/images/avatar3.jpg');

    const zhou6Avatar = screen.getByAltText('zhou6');
    expect(zhou6Avatar).toHaveAttribute('src', '/images/avatar4.jpg');
  });

  it('should render follower counts', () => {
    render(<SuggestedCreators />);

    expect(screen.getByText('1245 粉丝')).toBeInTheDocument();
    expect(screen.getByText('879 粉丝')).toBeInTheDocument();
    expect(screen.getByText('2352 粉丝')).toBeInTheDocument();
    expect(screen.getByText('543 粉丝')).toBeInTheDocument();
  });

  it('should render follow buttons for all creators', () => {
    render(<SuggestedCreators />);

    const followButtons = screen.getAllByRole('button', { name: '关注' });
    expect(followButtons).toHaveLength(4);

    followButtons.forEach(button => {
      expect(button).toHaveClass(
        'w-full',
        'py-2',
        'px-4',
        'bg-gray-100',
        'dark:bg-gray-800',
        'hover:bg-gray-200',
        'dark:hover:bg-gray-700',
        'rounded-full',
        'text-gray-900',
        'dark:text-white',
        'text-sm',
        'font-medium',
        'transition-colors'
      );
    });
  });

  it('should render view works links for all creators', () => {
    render(<SuggestedCreators />);

    expect(screen.getByRole('link', { name: '查看作品' })).toBeInTheDocument();
    
    const viewWorksLinks = screen.getAllByText('查看作品');
    expect(viewWorksLinks).toHaveLength(4);

    // Check specific creator links
    const creatorLinks = screen.getAllByRole('link').filter(link => 
      link.getAttribute('href')?.startsWith('/creator/')
    );
    
    expect(creatorLinks[0]).toHaveAttribute('href', '/creator/1');
    expect(creatorLinks[1]).toHaveAttribute('href', '/creator/2');
    expect(creatorLinks[2]).toHaveAttribute('href', '/creator/3');
    expect(creatorLinks[3]).toHaveAttribute('href', '/creator/4');
  });

  it('should render verified badges for verified creators only', () => {
    const { container } = render(<SuggestedCreators />);

    // Count verification badges (should be 2: zhang3 and li4)
    const verificationBadges = container.querySelectorAll('.bg-blue-500.text-white.rounded-full');
    expect(verificationBadges).toHaveLength(2);

    // Check SVG icons in verification badges
    const svgIcons = container.querySelectorAll('.bg-blue-500 svg');
    expect(svgIcons).toHaveLength(2);

    svgIcons.forEach(svg => {
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg).toHaveClass('w-4', 'h-4');
    });
  });

  it('should not render verified badges for unverified creators', () => {
    render(<SuggestedCreators />);

    // wang5 and zhou6 should not have verification badges
    // We can verify this by checking that only 2 badges exist (for zhang3 and li4)
    const { container } = render(<SuggestedCreators />);
    const verificationBadges = container.querySelectorAll('.bg-blue-500.text-white.rounded-full');
    expect(verificationBadges).toHaveLength(2);
  });

  it('should render discover more creators link', () => {
    render(<SuggestedCreators />);

    const discoverLink = screen.getByRole('link', { name: '发现更多创作者 →' });
    expect(discoverLink).toHaveAttribute('href', '/creators');
    expect(discoverLink).toHaveClass(
      'text-indigo-600',
      'dark:text-indigo-400',
      'hover:underline',
      'text-sm',
      'font-medium'
    );
  });

  it('should have proper grid layout structure', () => {
    const { container } = render(<SuggestedCreators />);

    const gridContainer = container.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveClass('gap-6');
  });

  it('should have proper section styling', () => {
    const { container } = render(<SuggestedCreators />);

    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass('py-12', 'bg-gray-50', 'dark:bg-gray-900');

    const wrapper = container.querySelector('.max-w-7xl.mx-auto');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
  });

  it('should have proper creator card styling', () => {
    const { container } = render(<SuggestedCreators />);

    const creatorCards = container.querySelectorAll('.bg-white.dark\\:bg-black.border');
    expect(creatorCards).toHaveLength(4);

    creatorCards.forEach(card => {
      expect(card).toHaveClass(
        'border-gray-200',
        'dark:border-gray-800',
        'rounded-lg',
        'p-4',
        'flex',
        'flex-col',
        'items-center'
      );
    });
  });

  it('should have proper avatar container styling', () => {
    const { container } = render(<SuggestedCreators />);

    const avatarContainers = container.querySelectorAll('.w-20.h-20.rounded-full.overflow-hidden');
    expect(avatarContainers).toHaveLength(4);
  });

  it('should have proper creator name styling', () => {
    render(<SuggestedCreators />);

    const creatorNames = ['zhang3', 'li4', 'wang5', 'zhou6'];
    
    creatorNames.forEach(name => {
      const nameElement = screen.getByText(name);
      expect(nameElement).toHaveClass(
        'text-lg',
        'font-medium',
        'text-gray-900',
        'dark:text-white',
        'mb-1'
      );
    });
  });

  it('should have proper follower count styling', () => {
    render(<SuggestedCreators />);

    const followerCounts = ['1245 粉丝', '879 粉丝', '2352 粉丝', '543 粉丝'];
    
    followerCounts.forEach(count => {
      const countElement = screen.getByText(count);
      expect(countElement).toHaveClass(
        'text-sm',
        'text-gray-500',
        'dark:text-gray-400',
        'mb-4'
      );
    });
  });

  it('should have proper view works link styling', () => {
    render(<SuggestedCreators />);

    const viewWorksLinks = screen.getAllByText('查看作品');
    
    viewWorksLinks.forEach(link => {
      expect(link).toHaveClass(
        'mt-3',
        'text-sm',
        'text-indigo-600',
        'dark:text-indigo-400',
        'hover:underline'
      );
    });
  });

  it('should render with client-side functionality', () => {
    // Since this is a 'use client' component, it should render without SSR issues
    render(<SuggestedCreators />);
    
    // All interactive elements should be present
    expect(screen.getAllByRole('button')).toHaveLength(4);
    expect(screen.getAllByRole('link')).toHaveLength(9); // 4 creator links + 4 view works links + 1 discover more
  });

  it('should have proper responsive classes', () => {
    const { container } = render(<SuggestedCreators />);

    // Check responsive grid
    const gridContainer = container.querySelector('.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4');
    expect(gridContainer).toBeInTheDocument();

    // Check responsive padding
    const wrapper = container.querySelector('.px-4.sm\\:px-6.lg\\:px-8');
    expect(wrapper).toBeInTheDocument();
  });

  it('should handle dark mode classes', () => {
    const { container } = render(<SuggestedCreators />);

    // Section should have dark mode background
    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass('dark:bg-gray-900');

    // Title should have dark mode text color
    const title = screen.getByText('推荐创作者');
    expect(title).toHaveClass('dark:text-white');

    // Creator cards should have dark mode styling
    const creatorCards = container.querySelectorAll('.dark\\:bg-black.dark\\:border-gray-800');
    expect(creatorCards).toHaveLength(4);
  });

  describe('Creator data validation', () => {
    it('should render correct creator data structure', () => {
      render(<SuggestedCreators />);

      // Verify all expected creators are rendered with correct data
      const expectedCreators = [
        { name: 'zhang3', followers: '1245 粉丝', verified: true },
        { name: 'li4', followers: '879 粉丝', verified: true },
        { name: 'wang5', followers: '2352 粉丝', verified: false },
        { name: 'zhou6', followers: '543 粉丝', verified: false },
      ];

      expectedCreators.forEach(creator => {
        expect(screen.getByText(creator.name)).toBeInTheDocument();
        expect(screen.getByText(creator.followers)).toBeInTheDocument();
      });

      // Verify verification badges count matches verified creators
      const { container } = render(<SuggestedCreators />);
      const verifiedCount = expectedCreators.filter(c => c.verified).length;
      const badges = container.querySelectorAll('.bg-blue-500.text-white.rounded-full');
      expect(badges).toHaveLength(verifiedCount);
    });
  });
});