/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CollectionCard from '../CollectionCard';
import { CollectionListItem } from '../../_lib/types';

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, fill, sizes, className, priority, ...props }: any) => (
    <img
      src={src}
      alt={alt}
      className={className}
      data-fill={fill}
      data-sizes={sizes}
      data-priority={priority}
      {...props}
    />
  ),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock utility functions
jest.mock('../../_lib/utils', () => ({
  formatPrice: jest.fn((price) => `formatted-${price}`),
  weiToEth: jest.fn((wei) => `${wei}-eth`),
}));

const mockFormatPrice = require('../../_lib/utils').formatPrice;
const mockWeiToEth = require('../../_lib/utils').weiToEth;

describe('CollectionCard Component', () => {
  const mockCollection: CollectionListItem = {
    id: 'collection-123',
    name: 'Test Collection',
    description: 'A test collection for NFTs with various items and features',
    logo_image_url: 'https://example.com/collection-logo.jpg',
    floor_price: '1000000000000000000',
    volume: '5000000000000000000',
    item_count: 1000,
    owner_count: 250,
    creator: {
      id: 'creator-456',
      username: 'testcreator',
      avatar_url: 'https://example.com/creator-avatar.jpg',
      wallet_address: '0x1234567890123456789012345678901234567890',
      email: 'creator@test.com',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
    contract_address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render collection card with all information', () => {
    render(<CollectionCard collection={mockCollection} />);

    expect(screen.getByText('Test Collection')).toBeInTheDocument();
    expect(screen.getByText('A test collection for NFTs with various items and features')).toBeInTheDocument();
    expect(screen.getByText('testcreator')).toBeInTheDocument();
    expect(screen.getByAltText('Test Collection')).toBeInTheDocument();
    expect(screen.getByAltText('testcreator')).toBeInTheDocument();
  });

  it('should render collection statistics', () => {
    render(<CollectionCard collection={mockCollection} />);

    expect(screen.getByText('地板价')).toBeInTheDocument();
    expect(screen.getByText('总交易量')).toBeInTheDocument();
    expect(screen.getByText('物品数量')).toBeInTheDocument();
    expect(screen.getByText('持有者')).toBeInTheDocument();
    
    expect(screen.getByText('1000')).toBeInTheDocument(); // item_count
    expect(screen.getByText('250')).toBeInTheDocument(); // owner_count
  });

  it('should call formatPrice and weiToEth for price formatting', () => {
    render(<CollectionCard collection={mockCollection} />);

    expect(mockWeiToEth).toHaveBeenCalledWith('1000000000000000000'); // floor_price
    expect(mockWeiToEth).toHaveBeenCalledWith('5000000000000000000'); // volume
    expect(mockFormatPrice).toHaveBeenCalledWith('1000000000000000000-eth');
    expect(mockFormatPrice).toHaveBeenCalledWith('5000000000000000000-eth');
  });

  it('should render formatted prices with $ prefix', () => {
    render(<CollectionCard collection={mockCollection} />);

    expect(screen.getByText('$formatted-1000000000000000000-eth')).toBeInTheDocument();
    expect(screen.getByText('$formatted-5000000000000000000-eth')).toBeInTheDocument();
  });

  it('should render as a link to collection detail page', () => {
    render(<CollectionCard collection={mockCollection} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/collections/collection-123');
  });

  it('should handle collection without logo image', () => {
    const collectionWithoutLogo = {
      ...mockCollection,
      logo_image_url: null,
    };

    render(<CollectionCard collection={collectionWithoutLogo} />);

    expect(screen.queryByAltText('Test Collection')).not.toBeInTheDocument();
    expect(screen.getByText('Test Collection')).toBeInTheDocument();
  });

  it('should handle collection without creator', () => {
    const collectionWithoutCreator = {
      ...mockCollection,
      creator: null,
    };

    render(<CollectionCard collection={collectionWithoutCreator} />);

    expect(screen.queryByText('testcreator')).not.toBeInTheDocument();
    expect(screen.getByText('Test Collection')).toBeInTheDocument();
  });

  it('should handle creator without avatar', () => {
    const collectionWithCreatorNoAvatar = {
      ...mockCollection,
      creator: {
        ...mockCollection.creator!,
        avatar_url: null,
      },
    };

    render(<CollectionCard collection={collectionWithCreatorNoAvatar} />);

    const creatorAvatar = screen.getByAltText('testcreator');
    expect(creatorAvatar).toHaveAttribute('src', '');
  });

  it('should truncate long collection names and descriptions', () => {
    const collectionWithLongContent = {
      ...mockCollection,
      name: 'This is a very long collection name that should be truncated',
      description: 'This is an extremely long description that should be truncated with line-clamp-2 and it goes on and on with more text that exceeds the limit',
    };

    const { container } = render(<CollectionCard collection={collectionWithLongContent} />);

    const nameElement = screen.getByText('This is a very long collection name that should be truncated');
    const descriptionElement = screen.getByText(/This is an extremely long description/);

    expect(nameElement).toHaveClass('truncate');
    expect(descriptionElement).toHaveClass('line-clamp-2');
  });

  it('should have proper hover effects', () => {
    const { container } = render(<CollectionCard collection={mockCollection} />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('hover:shadow-lg');

    const logoContainer = container.querySelector('.relative.h-48');
    expect(logoContainer?.querySelector('img')).toHaveClass('hover:scale-105');
  });

  it('should render with correct responsive image sizing', () => {
    render(<CollectionCard collection={mockCollection} />);

    const logoImage = screen.getByAltText('Test Collection');
    expect(logoImage).toHaveAttribute('data-sizes', '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw');
    expect(logoImage).toHaveAttribute('data-priority', 'true');
    expect(logoImage).toHaveAttribute('data-fill', 'true');

    const avatarImage = screen.getByAltText('testcreator');
    expect(avatarImage).toHaveAttribute('data-sizes', '24px');
    expect(avatarImage).toHaveAttribute('data-fill', 'true');
  });

  it('should have proper dark mode classes', () => {
    const { container } = render(<CollectionCard collection={mockCollection} />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('dark:bg-zinc-800');
    expect(card).toHaveClass('dark:border-zinc-700');
  });

  it('should handle zero values in statistics', () => {
    const collectionWithZeroValues = {
      ...mockCollection,
      floor_price: '0',
      volume: '0',
      item_count: 0,
      owner_count: 0,
    };

    render(<CollectionCard collection={collectionWithZeroValues} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(mockWeiToEth).toHaveBeenCalledWith('0');
  });

  it('should maintain proper grid layout structure', () => {
    const { container } = render(<CollectionCard collection={mockCollection} />);

    const statsGrid = container.querySelector('.grid.grid-cols-2');
    expect(statsGrid).toBeInTheDocument();
    expect(statsGrid?.children).toHaveLength(4); // floor_price, volume, item_count, owner_count
  });

  it('should have proper styling classes', () => {
    const { container } = render(<CollectionCard collection={mockCollection} />);

    expect(container.firstChild).toHaveClass('bg-white', 'rounded-xl', 'overflow-hidden', 'border');
    
    const logoContainer = container.querySelector('.relative.h-48');
    expect(logoContainer).toHaveClass('w-full', 'overflow-hidden');
    
    const infoContainer = container.querySelector('.p-4');
    expect(infoContainer).toBeInTheDocument();
  });

  it('should render creator information correctly', () => {
    render(<CollectionCard collection={mockCollection} />);

    const creatorContainer = screen.getByText('testcreator').closest('.flex');
    expect(creatorContainer).toHaveClass('items-center', 'gap-2');
    
    const creatorText = screen.getByText('testcreator');
    expect(creatorText).toHaveClass('text-sm', 'text-zinc-600', 'dark:text-zinc-400', 'truncate');
  });

  it('should handle missing required fields gracefully', () => {
    const minimalCollection = {
      id: 'minimal-123',
      name: 'Minimal Collection',
      description: '',
      floor_price: '0',
      volume: '0',
      item_count: 0,
      owner_count: 0,
      creator: null,
      logo_image_url: null,
      contract_address: '0x0000000000000000000000000000000000000000',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    render(<CollectionCard collection={minimalCollection} />);

    expect(screen.getByText('Minimal Collection')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/collections/minimal-123');
  });
});