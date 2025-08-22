/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Hero } from '../Hero';

// Mock dependencies
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

jest.mock('./ui/Button', () => ({
  Button: ({ children, variant, size, ...props }: any) => (
    <button data-variant={variant} data-size={size} {...props}>
      {children}
    </button>
  ),
  ButtonVariantDefault: 'default',
  ButtonVariantSecondary: 'secondary',
}));

jest.mock('../_lib/actions', () => ({
  getFeaturedNFT: jest.fn(),
}));

jest.mock('../_lib/utils', () => ({
  formatIPFSUrl: jest.fn((url) => `formatted-${url}`),
  weiToEth: jest.fn((wei) => `${wei}-eth`),
}));

const mockGetFeaturedNFT = require('../_lib/actions').getFeaturedNFT;

describe('Hero Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render hero section with title and description', async () => {
    mockGetFeaturedNFT.mockResolvedValue(null);

    render(await Hero());

    expect(screen.getByText('创建、分享')).toBeInTheDocument();
    expect(screen.getByText('和铸造 NFT')).toBeInTheDocument();
    expect(screen.getByText(/简单几步，将您的创意铸造为 NFT/)).toBeInTheDocument();
  });

  it('should render action buttons', async () => {
    mockGetFeaturedNFT.mockResolvedValue(null);

    render(await Hero());

    expect(screen.getByText('开始创建')).toBeInTheDocument();
    expect(screen.getByText('探索收藏品')).toBeInTheDocument();
  });

  it('should render community section with avatars', async () => {
    mockGetFeaturedNFT.mockResolvedValue(null);

    render(await Hero());

    expect(screen.getByText(/加入/)).toBeInTheDocument();
    expect(screen.getByText('3.5k+')).toBeInTheDocument();
    expect(screen.getByText('创作者社区')).toBeInTheDocument();
    
    // Check community avatars
    const avatarImages = screen.getAllByRole('img').filter(img => 
      img.getAttribute('alt')?.startsWith('User')
    );
    expect(avatarImages).toHaveLength(3);
  });

  it('should render featured NFT when available', async () => {
    const mockFeaturedNFT = {
      nfts: {
        id: 'nft-123',
        name: 'Featured Artwork',
        image_url: 'https://example.com/image.jpg',
        list_price: '1000000000000000000',
        list_currency: 'ETH',
        last_sale_price: null,
        last_sale_currency: null,
        profiles: {
          username: 'artist123',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      },
    };

    mockGetFeaturedNFT.mockResolvedValue(mockFeaturedNFT);

    render(await Hero());

    expect(screen.getByText('Featured Artwork')).toBeInTheDocument();
    expect(screen.getByText('artist123')).toBeInTheDocument();
    expect(screen.getByText('当前价格')).toBeInTheDocument();
    expect(screen.getByAltText('Featured NFT artwork')).toBeInTheDocument();
    expect(screen.getByAltText('Creator')).toBeInTheDocument();
  });

  it('should handle NFT without owner profile', async () => {
    const mockFeaturedNFT = {
      nfts: {
        id: 'nft-123',
        name: 'Featured Artwork',
        image_url: 'https://example.com/image.jpg',
        list_price: '1000000000000000000',
        list_currency: 'ETH',
        profiles: null,
      },
    };

    mockGetFeaturedNFT.mockResolvedValue(mockFeaturedNFT);

    render(await Hero());

    // Should not render featured NFT section without owner profile
    expect(screen.queryByText('Featured Artwork')).not.toBeInTheDocument();
    expect(screen.queryByAltText('Featured NFT artwork')).not.toBeInTheDocument();
  });

  it('should display price from last_sale_price when available', async () => {
    const mockFeaturedNFT = {
      nfts: {
        id: 'nft-123',
        name: 'Featured Artwork',
        image_url: 'https://example.com/image.jpg',
        list_price: '1000000000000000000',
        list_currency: 'ETH',
        last_sale_price: '2000000000000000000',
        last_sale_currency: 'WETH',
        profiles: {
          username: 'artist123',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      },
    };

    mockGetFeaturedNFT.mockResolvedValue(mockFeaturedNFT);

    render(await Hero());

    expect(screen.getByText('2000000000000000000-eth WETH')).toBeInTheDocument();
  });

  it('should display price from list_price when last_sale_price is not available', async () => {
    const mockFeaturedNFT = {
      nfts: {
        id: 'nft-123',
        name: 'Featured Artwork',
        image_url: 'https://example.com/image.jpg',
        list_price: '1000000000000000000',
        list_currency: 'ETH',
        last_sale_price: null,
        last_sale_currency: null,
        profiles: {
          username: 'artist123',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      },
    };

    mockGetFeaturedNFT.mockResolvedValue(mockFeaturedNFT);

    render(await Hero());

    expect(screen.getByText('1000000000000000000-eth ETH')).toBeInTheDocument();
  });

  it('should have correct link structure', async () => {
    const mockFeaturedNFT = {
      nfts: {
        id: 'nft-123',
        name: 'Featured Artwork',
        image_url: 'https://example.com/image.jpg',
        profiles: {
          username: 'artist123',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      },
    };

    mockGetFeaturedNFT.mockResolvedValue(mockFeaturedNFT);

    render(await Hero());

    const createLink = screen.getByRole('link', { name: /开始创建/ });
    expect(createLink).toHaveAttribute('href', '/create');

    const exploreLink = screen.getByRole('link', { name: /探索收藏品/ });
    expect(exploreLink).toHaveAttribute('href', '/explore');

    const nftLink = screen.getByRole('link').closest('a[href="/nft/nft-123"]');
    expect(nftLink).toBeInTheDocument();
  });

  it('should call formatIPFSUrl for featured NFT image', async () => {
    const mockFormatIPFSUrl = require('../_lib/utils').formatIPFSUrl;
    const mockFeaturedNFT = {
      nfts: {
        id: 'nft-123',
        name: 'Featured Artwork',
        image_url: 'ipfs://QmHash',
        profiles: {
          username: 'artist123',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      },
    };

    mockGetFeaturedNFT.mockResolvedValue(mockFeaturedNFT);

    render(await Hero());

    expect(mockFormatIPFSUrl).toHaveBeenCalledWith('ipfs://QmHash');
  });

  it('should call weiToEth for price conversion', async () => {
    const mockWeiToEth = require('../_lib/utils').weiToEth;
    const mockFeaturedNFT = {
      nfts: {
        id: 'nft-123',
        name: 'Featured Artwork',
        image_url: 'https://example.com/image.jpg',
        list_price: '1000000000000000000',
        list_currency: 'ETH',
        profiles: {
          username: 'artist123',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      },
    };

    mockGetFeaturedNFT.mockResolvedValue(mockFeaturedNFT);

    render(await Hero());

    expect(mockWeiToEth).toHaveBeenCalledWith('1000000000000000000');
  });

  it('should have proper accessibility attributes', async () => {
    mockGetFeaturedNFT.mockResolvedValue(null);

    render(await Hero());

    // Check heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading).toHaveTextContent('创建、分享和铸造 NFT');
  });

  it('should handle missing avatar URL gracefully', async () => {
    const mockFeaturedNFT = {
      nfts: {
        id: 'nft-123',
        name: 'Featured Artwork',
        image_url: 'https://example.com/image.jpg',
        profiles: {
          username: 'artist123',
          avatar_url: null,
        },
      },
    };

    mockGetFeaturedNFT.mockResolvedValue(mockFeaturedNFT);

    render(await Hero());

    const creatorAvatar = screen.getByAltText('Creator');
    expect(creatorAvatar).toHaveAttribute('src', '');
  });

  it('should render background decorative elements', async () => {
    mockGetFeaturedNFT.mockResolvedValue(null);

    const { container } = render(await Hero());

    const decorativeElements = container.querySelectorAll('.bg-purple-300, .bg-blue-300');
    expect(decorativeElements.length).toBeGreaterThan(0);
  });

  it('should have responsive grid layout classes', async () => {
    mockGetFeaturedNFT.mockResolvedValue(null);

    const { container } = render(await Hero());

    const gridContainer = container.querySelector('.grid-cols-1.md\\:grid-cols-2');
    expect(gridContainer).toBeInTheDocument();
  });

  it('should handle error in getFeaturedNFT gracefully', async () => {
    mockGetFeaturedNFT.mockRejectedValue(new Error('API Error'));

    // Should not throw error during render
    await expect(Hero()).rejects.toThrow('API Error');
  });

  describe('Featured NFT card', () => {
    it('should render NFT info card with proper structure', async () => {
      const mockFeaturedNFT = {
        nfts: {
          id: 'nft-123',
          name: 'Featured Artwork',
          image_url: 'https://example.com/image.jpg',
          list_price: '1000000000000000000',
          list_currency: 'ETH',
          profiles: {
            username: 'artist123',
            avatar_url: 'https://example.com/avatar.jpg',
          },
        },
      };

      mockGetFeaturedNFT.mockResolvedValue(mockFeaturedNFT);

      render(await Hero());

      expect(screen.getByText('Featured Artwork')).toBeInTheDocument();
      expect(screen.getByText('artist123')).toBeInTheDocument();
      expect(screen.getByText('当前价格')).toBeInTheDocument();
    });

    it('should have proper image attributes', async () => {
      const mockFeaturedNFT = {
        nfts: {
          id: 'nft-123',
          name: 'Featured Artwork',
          image_url: 'https://example.com/image.jpg',
          profiles: {
            username: 'artist123',
            avatar_url: 'https://example.com/avatar.jpg',
          },
        },
      };

      mockGetFeaturedNFT.mockResolvedValue(mockFeaturedNFT);

      render(await Hero());

      const featuredImage = screen.getByAltText('Featured NFT artwork');
      expect(featuredImage).toHaveAttribute('data-fill', 'true');
      expect(featuredImage).toHaveAttribute('data-priority', 'true');
      expect(featuredImage).toHaveAttribute('data-sizes', '(max-width: 768px) 100vw, (min-width: 769px) 50vw, 33vw');
    });
  });

  describe('Community avatars', () => {
    it('should render all community avatars with correct attributes', async () => {
      mockGetFeaturedNFT.mockResolvedValue(null);

      render(await Hero());

      const user1Avatar = screen.getByAltText('User 1');
      const user2Avatar = screen.getByAltText('User 2');
      const user3Avatar = screen.getByAltText('User 3');

      expect(user1Avatar).toBeInTheDocument();
      expect(user2Avatar).toBeInTheDocument();
      expect(user3Avatar).toBeInTheDocument();

      [user1Avatar, user2Avatar, user3Avatar].forEach(avatar => {
        expect(avatar).toHaveAttribute('data-sizes', '32px');
      });
    });
  });
});