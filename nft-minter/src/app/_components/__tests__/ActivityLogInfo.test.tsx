/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActivityLogInfo from '../ActivityLogInfo';
import { ActivityLogItem, UserProfile, NFT, Collection } from '../../_lib/types';
import { ActionType } from '../../_lib/types/enums';

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, className, ...props }: any) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

// Mock utility functions
jest.mock('../../_lib/utils', () => ({
  formatTimeAgo: jest.fn((date: string) => `${date}-ago`),
  weiToEth: jest.fn((wei: string) => `${wei}-eth`),
}));

const mockFormatTimeAgo = require('../../_lib/utils').formatTimeAgo;
const mockWeiToEth = require('../../_lib/utils').weiToEth;

describe('ActivityLogInfo Component', () => {
  const mockUser: UserProfile = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    wallet_address: '0x1234567890123456789012345678901234567890',
    avatar_url: 'https://example.com/avatar.jpg',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockRelatedUser: UserProfile = {
    id: 'user-456',
    username: 'relateduser',
    email: 'related@example.com',
    wallet_address: '0x9876543210987654321098765432109876543210',
    avatar_url: 'https://example.com/related-avatar.jpg',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockNFT: NFT = {
    id: 'nft-789',
    name: 'Test NFT',
    description: 'A test NFT',
    image_url: 'https://example.com/nft.jpg',
    token_id: '1',
    contract_address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    owner_id: 'user-123',
    creator_id: 'user-123',
    collection_id: 'collection-101',
    is_listed: false,
    list_price: null,
    list_currency: null,
    last_sale_price: null,
    last_sale_currency: null,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockCollection: Collection = {
    id: 'collection-101',
    name: 'Test Collection',
    description: 'A test collection',
    logo_image_url: 'https://example.com/collection.jpg',
    contract_address: '0xfedcbafedcbafedcbafedcbafedcbafedcbafed',
    creator_id: 'user-123',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const baseActivity: Omit<ActivityLogItem, 'action_type' | 'details'> = {
    id: 'activity-1',
    user_id: 'user-123',
    nft_id: 'nft-789',
    collection_id: 'collection-101',
    related_user_id: 'user-456',
    created_at: '2023-01-01T12:00:00Z',
    user: mockUser,
    nft: mockNFT,
    collection: mockCollection,
    related_user: mockRelatedUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render MINT_NFT activity', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      action_type: ActionType.MINT_NFT,
      details: null,
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('Test NFT')).toBeInTheDocument();
    expect(screen.getByText(/铸造了新的 NFT/)).toBeInTheDocument();
    expect(screen.getByText('(2023-01-01T12:00:00Z-ago)')).toBeInTheDocument();
  });

  it('should render LIST_NFT activity with price', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      action_type: ActionType.LIST_NFT,
      details: { price: 100, currency: 'ETH' },
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(screen.getByText(/上架了.*售价 100 ETH/)).toBeInTheDocument();
  });

  it('should render LIST_NFT activity without price', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      action_type: ActionType.LIST_NFT,
      details: null,
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(screen.getByText(/售价 未知 ETH/)).toBeInTheDocument();
  });

  it('should render UNLIST_NFT activity', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      action_type: ActionType.UNLIST_NFT,
      details: null,
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(screen.getByText(/下架了.*Test NFT/)).toBeInTheDocument();
  });

  it('should render SELL_NFT activity', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      action_type: ActionType.SELL_NFT,
      details: { price: 200, currency: 'WETH' },
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(screen.getByText(/将.*Test NFT.*卖给了.*relateduser.*价格为 200 WETH/)).toBeInTheDocument();
  });

  it('should render BUY_NFT activity', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      action_type: ActionType.BUY_NFT,
      details: { price: 150, currency: 'ETH' },
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(screen.getByText(/从.*relateduser.*手中购买了.*Test NFT.*价格为 150 ETH/)).toBeInTheDocument();
  });

  it('should render COLLECT_NFT activity', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      action_type: 'COLLECT_NFT' as any,
      details: null,
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(screen.getByText(/收藏了.*Test NFT.*来自.*relateduser/)).toBeInTheDocument();
  });

  it('should render TRANSFER_NFT activity', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      action_type: ActionType.TRANSFER_NFT,
      details: null,
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(screen.getByText(/将.*Test NFT.*转移给了.*relateduser/)).toBeInTheDocument();
  });

  it('should render UPDATE_PROFILE activity', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      action_type: ActionType.UPDATE_PROFILE,
      details: null,
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(screen.getByText(/更新了个人资料/)).toBeInTheDocument();
  });

  it('should render FOLLOW_USER activity', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      action_type: ActionType.FOLLOW_USER,
      details: null,
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(screen.getByText(/关注了.*relateduser/)).toBeInTheDocument();
  });

  it('should render UNFOLLOW_USER activity', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      action_type: ActionType.UNFOLLOW_USER,
      details: null,
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(screen.getByText(/取消关注了.*relateduser/)).toBeInTheDocument();
  });

  it('should render FAVORITE_COLLECTION activity', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      action_type: ActionType.FAVORITE_COLLECTION,
      details: null,
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(screen.getByText(/收藏了合集.*Test Collection/)).toBeInTheDocument();
  });

  it('should render CREATE_COLLECTION activity', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      action_type: ActionType.CREATE_COLLECTION,
      details: null,
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(screen.getByText(/创建了新的合集.*Test Collection/)).toBeInTheDocument();
  });

  it('should render CREATE_OFFER activity with wei conversion', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      action_type: ActionType.CREATE_OFFER,
      details: { price: 1000000000000000000, currency: 'ETH' },
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(mockWeiToEth).toHaveBeenCalledWith('1000000000000000000');
    expect(screen.getByText(/创建了对.*Test NFT.*的出价.*价格为.*1000000000000000000-eth ETH/)).toBeInTheDocument();
  });

  it('should render CREATE_OFFER activity without price', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      action_type: ActionType.CREATE_OFFER,
      details: null,
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(screen.getByText(/价格为 未知 ETH/)).toBeInTheDocument();
  });

  it('should render unknown action type', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    const activity: ActivityLogItem = {
      ...baseActivity,
      action_type: 'UNKNOWN_ACTION' as any,
      details: null,
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(screen.getByText(/执行了一个未知操作/)).toBeInTheDocument();
    expect(consoleWarnSpy).toHaveBeenCalledWith('未知的活动类型:', 'UNKNOWN_ACTION');

    consoleWarnSpy.mockRestore();
  });

  it('should handle missing user data', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      user: null,
      action_type: ActionType.MINT_NFT,
      details: null,
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(screen.getByText('用户 user-1')).toBeInTheDocument(); // Truncated user ID
  });

  it('should handle missing user and user_id', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      user: null,
      user_id: null,
      action_type: ActionType.MINT_NFT,
      details: null,
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(screen.getByText('未知用户')).toBeInTheDocument();
  });

  it('should handle missing NFT data', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      nft: null,
      action_type: ActionType.MINT_NFT,
      details: null,
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(screen.getByText('NFT #nft-78')).toBeInTheDocument(); // Truncated NFT ID
  });

  it('should handle missing NFT and nft_id', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      nft: null,
      nft_id: null,
      action_type: ActionType.MINT_NFT,
      details: null,
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(screen.getByText('某个 NFT')).toBeInTheDocument();
  });

  it('should handle missing collection data', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      collection: null,
      action_type: ActionType.FAVORITE_COLLECTION,
      details: null,
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(screen.getByText('合集 #collec')).toBeInTheDocument(); // Truncated collection ID
  });

  it('should handle missing collection and collection_id', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      collection: null,
      collection_id: null,
      action_type: ActionType.FAVORITE_COLLECTION,
      details: null,
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(screen.getByText('某个合集')).toBeInTheDocument();
  });

  it('should render proper links for users, NFTs, and collections', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      action_type: ActionType.SELL_NFT,
      details: { price: 100, currency: 'ETH' },
    };

    render(<ActivityLogInfo activity={activity} />);

    // Check user links
    const userLink = screen.getByRole('link', { name: 'testuser' });
    expect(userLink).toHaveAttribute('href', '/user/user-123');
    expect(userLink).toHaveClass('activity-link', 'user-link', 'font-bold');

    const relatedUserLink = screen.getByRole('link', { name: 'relateduser' });
    expect(relatedUserLink).toHaveAttribute('href', '/user/user-456');

    // Check NFT link
    const nftLink = screen.getByRole('link', { name: 'Test NFT' });
    expect(nftLink).toHaveAttribute('href', '/nft/nft-789');
    expect(nftLink).toHaveClass('activity-link', 'nft-link', 'font-bold');
  });

  it('should render collection link correctly', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      action_type: ActionType.FAVORITE_COLLECTION,
      details: null,
    };

    render(<ActivityLogInfo activity={activity} />);

    const collectionLink = screen.getByRole('link', { name: 'Test Collection' });
    expect(collectionLink).toHaveAttribute('href', '/collections/collection-101');
    expect(collectionLink).toHaveClass('activity-link', 'collection-link', 'font-bold');
  });

  it('should call formatTimeAgo with correct timestamp', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      action_type: ActionType.MINT_NFT,
      details: null,
      created_at: '2023-05-15T10:30:00Z',
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(mockFormatTimeAgo).toHaveBeenCalledWith('2023-05-15T10:30:00Z');
  });

  it('should render time ago with proper styling', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      action_type: ActionType.MINT_NFT,
      details: null,
    };

    const { container } = render(<ActivityLogInfo activity={activity} />);

    const timeSpan = container.querySelector('.time-ago');
    expect(timeSpan).toBeInTheDocument();
    expect(timeSpan).toHaveClass('time-ago');
  });

  it('should handle details with missing price or currency', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      action_type: ActionType.LIST_NFT,
      details: { price: undefined, currency: undefined } as any,
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(screen.getByText(/售价 0 ETH/)).toBeInTheDocument(); // Default values
  });

  it('should handle partial details object', () => {
    const activity: ActivityLogItem = {
      ...baseActivity,
      action_type: ActionType.SELL_NFT,
      details: { price: 250 } as any, // Missing currency
    };

    render(<ActivityLogInfo activity={activity} />);

    expect(screen.getByText(/价格为 250 ETH/)).toBeInTheDocument(); // Default currency
  });
});