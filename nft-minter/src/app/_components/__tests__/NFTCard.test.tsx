/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NFTCard from '../NFTCard';

// Mock the dependencies
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: any }) => 
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />,
}));

jest.mock('../../_lib/types', () => ({
  NFTMarketStatus: {
    Listed: 'listed',
    NotListed: 'not_listed',
    Sold: 'sold',
  },
}));

describe('NFTCard Component', () => {
  const mockNFT = {
    id: '1',
    name: 'Test NFT',
    description: 'A test NFT',
    image_url: 'https://example.com/image.png',
    list_price: '1000000000000000000', // 1 ETH in wei
    list_status: 'listed',
    collection: {
      id: 'col1',
      name: 'Test Collection',
    },
    profile: {
      id: 'user1',
      username: 'testuser',
      wallet_address: '0x123...',
    },
  };

  it('renders NFT information correctly', () => {
    render(<NFTCard nft={mockNFT} />);
    
    expect(screen.getByText('Test NFT')).toBeInTheDocument();
    expect(screen.getByText('Test Collection')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Test NFT');
  });

  it('displays price when NFT is listed', () => {
    render(<NFTCard nft={mockNFT} />);
    
    // Should display some price information
    expect(screen.getByText(/ETH|价格/)).toBeInTheDocument();
  });

  it('handles missing collection gracefully', () => {
    const nftWithoutCollection = {
      ...mockNFT,
      collection: null,
    };

    render(<NFTCard nft={nftWithoutCollection} />);
    
    expect(screen.getByText('Test NFT')).toBeInTheDocument();
  });

  it('handles missing profile gracefully', () => {
    const nftWithoutProfile = {
      ...mockNFT,
      profile: null,
    };

    render(<NFTCard nft={nftWithoutProfile} />);
    
    expect(screen.getByText('Test NFT')).toBeInTheDocument();
  });
});