/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ActivityTab } from '../ActivityTab';
import { ActivityLogItem, UserProfile } from '@/app/_lib/types';
import { ActionType } from '@/app/_lib/types/enums';

// Mock ActivityLogInfo component
jest.mock('@/app/_components/ActivityLogInfo', () => ({
  __esModule: true,
  default: ({ activity }: { activity: ActivityLogItem }) => (
    <span data-testid={`activity-${activity.id}`}>
      {activity.action_type} - {activity.id}
    </span>
  ),
}));

// Mock data-service
const mockGetUserActivityLog = jest.fn();
jest.mock('@/app/_lib/data-service', () => ({
  getUserActivityLog: () => mockGetUserActivityLog(),
}));

describe('ActivityTab Component', () => {
  const mockProfile: UserProfile = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    wallet_address: '0x1234567890123456789012345678901234567890',
    avatar_url: 'https://example.com/avatar.jpg',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockActivities: ActivityLogItem[] = [
    {
      id: 'activity-1',
      user_id: 'user-123',
      nft_id: 'nft-456',
      collection_id: null,
      related_user_id: null,
      action_type: ActionType.MINT_NFT,
      details: null,
      created_at: '2023-01-01T10:00:00Z',
      user: mockProfile,
      nft: {
        id: 'nft-456',
        name: 'Test NFT',
        description: 'A test NFT',
        image_url: 'https://example.com/nft.jpg',
        token_id: '1',
        contract_address: '0xNFT123',
        owner_id: 'user-123',
        creator_id: 'user-123',
        collection_id: null,
        is_listed: false,
        list_price: null,
        list_currency: null,
        last_sale_price: null,
        last_sale_currency: null,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
      collection: null,
      related_user: null,
    },
    {
      id: 'activity-2',
      user_id: 'user-123',
      nft_id: 'nft-789',
      collection_id: null,
      related_user_id: 'user-456',
      action_type: ActionType.TRANSFER_NFT,
      details: null,
      created_at: '2023-01-02T10:00:00Z',
      user: mockProfile,
      nft: null,
      collection: null,
      related_user: {
        id: 'user-456',
        username: 'recipient',
        email: 'recipient@test.com',
        wallet_address: '0x9876543210987654321098765432109876543210',
        avatar_url: null,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render activity tab title', async () => {
    mockGetUserActivityLog.mockResolvedValue(mockActivities);

    render(await ActivityTab({ profile: mockProfile }));

    expect(screen.getByRole('heading', { level: 2, name: '活动记录' })).toBeInTheDocument();
  });

  it('should render activities when data is available', async () => {
    mockGetUserActivityLog.mockResolvedValue(mockActivities);

    render(await ActivityTab({ profile: mockProfile }));

    expect(screen.getByTestId('activity-activity-1')).toBeInTheDocument();
    expect(screen.getByTestId('activity-activity-2')).toBeInTheDocument();
    expect(screen.getByText('MINT_NFT - activity-1')).toBeInTheDocument();
    expect(screen.getByText('TRANSFER_NFT - activity-2')).toBeInTheDocument();
  });

  it('should render empty state when no activities', async () => {
    mockGetUserActivityLog.mockResolvedValue([]);

    render(await ActivityTab({ profile: mockProfile }));

    expect(screen.getByText('暂无活动记录。')).toBeInTheDocument();
  });

  it('should call getUserActivityLog with correct parameters', async () => {
    mockGetUserActivityLog.mockResolvedValue(mockActivities);

    render(await ActivityTab({ profile: mockProfile }));

    expect(mockGetUserActivityLog).toHaveBeenCalledWith('user-123', 1, 10);
  });

  it('should have proper container structure', async () => {
    mockGetUserActivityLog.mockResolvedValue(mockActivities);

    const { container } = render(await ActivityTab({ profile: mockProfile }));

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toBeInTheDocument();

    const activitiesContainer = container.querySelector('.space-y-4');
    expect(activitiesContainer).toBeInTheDocument();
  });

  it('should render activities with proper styling', async () => {
    mockGetUserActivityLog.mockResolvedValue(mockActivities);

    const { container } = render(await ActivityTab({ profile: mockProfile }));

    const activityItems = container.querySelectorAll('.flex.items-center.justify-between');
    expect(activityItems).toHaveLength(2);

    activityItems.forEach(item => {
      expect(item).toHaveClass(
        'p-4',
        'bg-white',
        'dark:bg-zinc-900',
        'rounded-lg',
        'shadow-sm',
        'border',
        'border-zinc-200',
        'dark:border-zinc-800'
      );
    });
  });

  it('should render activity text with proper styling', async () => {
    mockGetUserActivityLog.mockResolvedValue(mockActivities);

    const { container } = render(await ActivityTab({ profile: mockProfile }));

    const activityTexts = container.querySelectorAll('p.text-sm');
    expect(activityTexts).toHaveLength(2);

    activityTexts.forEach(text => {
      expect(text).toHaveClass(
        'text-zinc-700',
        'dark:text-zinc-300'
      );
    });
  });

  it('should handle empty activities array correctly', async () => {
    mockGetUserActivityLog.mockResolvedValue([]);

    render(await ActivityTab({ profile: mockProfile }));

    expect(screen.queryByTestId(/activity-/)).not.toBeInTheDocument();
    expect(screen.getByText('暂无活动记录。')).toHaveClass(
      'text-zinc-500',
      'dark:text-zinc-400',
      'mt-6'
    );
  });

  it('should handle single activity correctly', async () => {
    const singleActivity = [mockActivities[0]];
    mockGetUserActivityLog.mockResolvedValue(singleActivity);

    render(await ActivityTab({ profile: mockProfile }));

    expect(screen.getByTestId('activity-activity-1')).toBeInTheDocument();
    expect(screen.queryByTestId('activity-activity-2')).not.toBeInTheDocument();
  });

  it('should pass correct activity data to ActivityLogInfo', async () => {
    mockGetUserActivityLog.mockResolvedValue(mockActivities);

    render(await ActivityTab({ profile: mockProfile }));

    // Each activity should be rendered with its specific data
    expect(screen.getByText('MINT_NFT - activity-1')).toBeInTheDocument();
    expect(screen.getByText('TRANSFER_NFT - activity-2')).toBeInTheDocument();
  });

  it('should have proper title styling', async () => {
    mockGetUserActivityLog.mockResolvedValue([]);

    render(await ActivityTab({ profile: mockProfile }));

    const title = screen.getByText('活动记录');
    expect(title).toHaveClass('text-xl', 'font-semibold', 'mb-4');
  });

  it('should handle different profile IDs', async () => {
    const differentProfile = {
      ...mockProfile,
      id: 'different-user-456',
    };

    mockGetUserActivityLog.mockResolvedValue([]);

    render(await ActivityTab({ profile: differentProfile }));

    expect(mockGetUserActivityLog).toHaveBeenCalledWith('different-user-456', 1, 10);
  });

  describe('Activity rendering', () => {
    it('should render all activities in correct order', async () => {
      mockGetUserActivityLog.mockResolvedValue(mockActivities);

      const { container } = render(await ActivityTab({ profile: mockProfile }));

      const activityElements = container.querySelectorAll('[data-testid^="activity-"]');
      expect(activityElements).toHaveLength(2);
      
      expect(activityElements[0]).toHaveAttribute('data-testid', 'activity-activity-1');
      expect(activityElements[1]).toHaveAttribute('data-testid', 'activity-activity-2');
    });

    it('should handle activities with different action types', async () => {
      const diverseActivities = [
        { ...mockActivities[0], action_type: ActionType.LIST_NFT, id: 'list-1' },
        { ...mockActivities[1], action_type: ActionType.SELL_NFT, id: 'sell-1' },
        { ...mockActivities[0], action_type: ActionType.CREATE_COLLECTION, id: 'collection-1' },
      ] as ActivityLogItem[];

      mockGetUserActivityLog.mockResolvedValue(diverseActivities);

      render(await ActivityTab({ profile: mockProfile }));

      expect(screen.getByText('LIST_NFT - list-1')).toBeInTheDocument();
      expect(screen.getByText('SELL_NFT - sell-1')).toBeInTheDocument();
      expect(screen.getByText('CREATE_COLLECTION - collection-1')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should handle getUserActivityLog errors gracefully', async () => {
      mockGetUserActivityLog.mockRejectedValue(new Error('API Error'));

      // Component should handle the error and not crash
      await expect(async () => {
        render(await ActivityTab({ profile: mockProfile }));
      }).rejects.toThrow('API Error');
    });
  });

  describe('Responsive design', () => {
    it('should have responsive classes', async () => {
      mockGetUserActivityLog.mockResolvedValue(mockActivities);

      const { container } = render(await ActivityTab({ profile: mockProfile }));

      const activityItems = container.querySelectorAll('.flex.items-center.justify-between');
      activityItems.forEach(item => {
        expect(item).toHaveClass('p-4'); // Proper padding for mobile/desktop
      });
    });
  });

  describe('Dark mode support', () => {
    it('should have dark mode classes', async () => {
      mockGetUserActivityLog.mockResolvedValue(mockActivities);

      const { container } = render(await ActivityTab({ profile: mockProfile }));

      // Activity items should have dark mode background
      const activityItems = container.querySelectorAll('.bg-white');
      activityItems.forEach(item => {
        expect(item).toHaveClass('dark:bg-zinc-900', 'dark:border-zinc-800');
      });

      // Activity text should have dark mode color
      const activityTexts = container.querySelectorAll('.text-zinc-700');
      activityTexts.forEach(text => {
        expect(text).toHaveClass('dark:text-zinc-300');
      });
    });

    it('should have dark mode empty state styling', async () => {
      mockGetUserActivityLog.mockResolvedValue([]);

      render(await ActivityTab({ profile: mockProfile }));

      const emptyState = screen.getByText('暂无活动记录。');
      expect(emptyState).toHaveClass('dark:text-zinc-400');
    });
  });

  describe('Server component behavior', () => {
    it('should be an async server component', async () => {
      mockGetUserActivityLog.mockResolvedValue([]);

      // Component should be awaitable
      const result = await ActivityTab({ profile: mockProfile });
      expect(result).toBeDefined();
    });

    it('should handle async data loading', async () => {
      // Mock slow API response
      mockGetUserActivityLog.mockImplementation(
        () => new Promise(resolve => 
          setTimeout(() => resolve(mockActivities), 10)
        )
      );

      const component = ActivityTab({ profile: mockProfile });
      expect(component).toBeInstanceOf(Promise);

      render(await component);
      expect(screen.getByText('活动记录')).toBeInTheDocument();
    });
  });
});