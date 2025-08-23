/**
 * @jest-environment jsdom
 */

import { notFound } from 'next/navigation';
import {
  addActivityLog,
  getCurrentUser,
  getUserProfile,
  getProfileByWallet,
  createGuest,
  getProfileByUserId,
  updateProfile,
  getUserNFTs,
  getNFTById,
  getNFTAttributes,
  getNFTHistory,
  getCollectionByUserId,
  listNFT,
  unlistNFT,
  getCollectionCategories,
  getCollectionById,
  getCollectionStatsById,
  getNFTsByCollectionIdAndPage,
  getNFTsByCollectionId,
  getUserActivityLog,
  getNftsByCollectionCategoryId,
  fetchCollectionsWithFilters,
  addOrder,
  getActiveOrderByNFTId,
} from '../data-service';

import { ActionType, NFTMarketStatus, NFTOrderStatus, NFTOrderType, NFTVisibilityStatus, SORT_OPTIONS, TransactionStatus, TransactionType } from '../types/enums';

// Mock dependencies
jest.mock('@/app/_lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

const mockSupabaseClient = {
  from: jest.fn(),
  auth: {
    getUser: jest.fn(),
  },
  rpc: jest.fn(),
};

const mockQuery: Record<string, jest.Mock> = {
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  select: jest.fn(),
  eq: jest.fn(),
  neq: jest.fn(),
  in: jest.fn(),
  single: jest.fn(),
  maybeSingle: jest.fn(),
  order: jest.fn(),
  limit: jest.fn(),
  range: jest.fn(),
};

const mockCreateClient = require('@/app/_lib/supabase/client').createClient;
const mockNotFound = notFound as jest.MockedFunction<typeof notFound>;

describe('Data Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient.mockReturnValue(mockSupabaseClient);

    // Reset all query methods to return chainable mock
    Object.keys(mockQuery).forEach(key => {
      mockQuery[key].mockReturnValue(mockQuery);
    });

    mockSupabaseClient.from.mockReturnValue(mockQuery);
  });

  describe('addActivityLog', () => {
    it('should add activity log successfully', async () => {
      const mockActivityLog = {
        user_id: 'user-123',
        action_type: ActionType.MINT_NFT,
        nft_id: 'nft-123',
      };
      const mockResult = { id: 'log-123', ...mockActivityLog };

      mockQuery.single.mockResolvedValue({ data: mockResult, error: null });

      const result = await addActivityLog(mockActivityLog);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('activity_log');
      expect(mockQuery.insert).toHaveBeenCalledWith(mockActivityLog);
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(result).toEqual(mockResult);
    });

    it('should throw error when insert fails', async () => {
      const mockActivityLog = { user_id: 'user-123' };
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' }
      });

      await expect(addActivityLog(mockActivityLog)).rejects.toThrow('添加活动日志失败');
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const result = await getCurrentUser();

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw error when getUser fails', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' }
      });

      await expect(getCurrentUser()).rejects.toThrow('获取用户失败');
    });
  });

  describe('getUserProfile', () => {
    it('should get user profile successfully', async () => {
      const mockUser = { id: 'user-123' };
      const mockProfile = { id: 'user-123', username: 'testuser' };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });
      mockQuery.single.mockResolvedValue({ data: mockProfile, error: null });

      const result = await getUserProfile();

      expect(result).toEqual(mockProfile);
    });

    it('should return null when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      const result = await getUserProfile();

      expect(result).toBeNull();
    });

    it('should return null when profile is not found', async () => {
      const mockUser = { id: 'user-123' };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });
      mockQuery.single.mockResolvedValue({ data: null, error: null });

      const result = await getUserProfile();

      expect(result).toBeNull();
    });
  });

  describe('getProfileByWallet', () => {
    it('should get profile by wallet address successfully', async () => {
      const walletAddress = '0x123456789abcdef';
      const mockProfile = { id: 'user-123', wallet_address: walletAddress };

      mockQuery.single.mockResolvedValue({ data: mockProfile, error: null });

      const result = await getProfileByWallet(walletAddress);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(mockQuery.eq).toHaveBeenCalledWith('wallet_address', walletAddress);
      expect(result).toEqual(mockProfile);
    });

    it('should throw error when profile not found', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Profile not found' }
      });

      await expect(getProfileByWallet('0x123')).rejects.toThrow('获取用户资料失败');
    });
  });

  describe('createGuest', () => {
    it('should create guest profile successfully', async () => {
      const mockProfile = { wallet_address: '0x123456789abcdef' };
      const mockResult = { id: 'user-123', ...mockProfile };

      mockQuery.insert.mockResolvedValue({ data: mockResult, error: null });

      const result = await createGuest(mockProfile);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(mockQuery.insert).toHaveBeenCalledWith(mockProfile);
      expect(result).toEqual(mockResult);
    });

    it('should throw error when creation fails', async () => {
      mockQuery.insert.mockResolvedValue({
        data: null,
        error: { message: 'Creation failed' }
      });

      await expect(createGuest({})).rejects.toThrow('Profiles could not be created');
    });
  });

  describe('getProfileByUserId', () => {
    it('should get profile by user ID successfully', async () => {
      const userId = 'user-123';
      const mockProfile = { id: userId, username: 'testuser' };

      mockQuery.single.mockResolvedValue({ data: mockProfile, error: null });

      const result = await getProfileByUserId(userId);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(mockQuery.eq).toHaveBeenCalledWith('id', userId);
      expect(result).toEqual(mockProfile);
    });

    it('should call notFound when profile not found', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Profile not found' }
      });

      await getProfileByUserId('user-123');

      expect(mockNotFound).toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const userId = 'user-123';
      const profileData = { username: 'newusername' };
      const mockUpdatedProfile = { id: userId, ...profileData };

      mockQuery.single.mockResolvedValue({ data: mockUpdatedProfile, error: null });

      const result = await updateProfile(userId, profileData);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(mockQuery.update).toHaveBeenCalledWith(profileData);
      expect(mockQuery.eq).toHaveBeenCalledWith('id', userId);
      expect(result).toEqual(mockUpdatedProfile);
    });

    it('should throw error when update fails', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' }
      });

      await expect(updateProfile('user-123', {})).rejects.toThrow('更新用户资料失败');
    });

    it('should throw error when no data returned', async () => {
      mockQuery.single.mockResolvedValue({ data: null, error: null });

      await expect(updateProfile('user-123', {})).rejects.toThrow('更新用户资料失败，未返回数据');
    });
  });

  describe('getUserNFTs', () => {
    it('should get user NFTs successfully', async () => {
      const mockNFTs = [
        { id: 'nft-1', name: 'NFT 1' },
        { id: 'nft-2', name: 'NFT 2' }
      ];

      mockQuery.order.mockResolvedValue({ data: mockNFTs, error: null });

      const result = await getUserNFTs({
        page: 1,
        pageSize: 10,
        ownerId: 'user-123'
      });

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('nfts');
      expect(mockQuery.eq).toHaveBeenCalledWith('owner_id', 'user-123');
      expect(mockQuery.range).toHaveBeenCalledWith(0, 9);
      expect(result).toEqual(mockNFTs);
    });

    it('should call notFound when query fails', async () => {
      mockQuery.order.mockResolvedValue({
        data: null,
        error: { message: 'Query failed' }
      });

      await getUserNFTs({ page: 1, pageSize: 10 });

      expect(mockNotFound).toHaveBeenCalled();
    });

    it('should filter by creator ID when provided', async () => {
      mockQuery.order.mockResolvedValue({ data: [], error: null });

      await getUserNFTs({
        page: 1,
        pageSize: 10,
        creatorId: 'creator-123'
      });

      expect(mockQuery.eq).toHaveBeenCalledWith('creator_id', 'creator-123');
    });

    it('should filter by status when provided', async () => {
      mockQuery.order.mockResolvedValue({ data: [], error: null });

      await getUserNFTs({
        page: 1,
        pageSize: 10,
        status: NFTVisibilityStatus.Visible
      });

      expect(mockQuery.eq).toHaveBeenCalledWith('status', NFTVisibilityStatus.Visible);
    });
  });

  describe('getNFTById', () => {
    it('should get NFT by ID successfully', async () => {
      const nftId = 'nft-123';
      const mockNFT = { id: nftId, name: 'Test NFT' };

      mockQuery.single.mockResolvedValue({ data: mockNFT, error: null });

      const result = await getNFTById(nftId);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('nfts');
      expect(mockQuery.eq).toHaveBeenCalledWith('id', nftId);
      expect(result).toEqual(mockNFT);
    });

    it('should call notFound when NFT not found', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'NFT not found' }
      });

      await getNFTById('nft-123');

      expect(mockNotFound).toHaveBeenCalled();
    });
  });

  describe('getNFTAttributes', () => {
    it('should get NFT attributes successfully', async () => {
      const nftId = 'nft-123';
      const mockAttributes = [
        { id: 1, attribute_name: 'Color', value: 'Red' },
        { id: 2, attribute_name: 'Rarity', value: 'Epic' }
      ];

      mockQuery.eq.mockResolvedValue({ data: mockAttributes, error: null });

      const result = await getNFTAttributes(nftId);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('nft_attributes');
      expect(mockQuery.eq).toHaveBeenCalledWith('nft_id', nftId);
      expect(result).toEqual(mockAttributes);
    });

    it('should call notFound when query fails', async () => {
      mockQuery.eq.mockResolvedValue({
        data: null,
        error: { message: 'Query failed' }
      });

      await getNFTAttributes('nft-123');

      expect(mockNotFound).toHaveBeenCalled();
    });
  });

  describe('listNFT', () => {
    it('should list NFT successfully', async () => {
      const nftId = 'nft-123';
      const order = {
        seller: '0x123' as const,
        buyer: '0x000' as const,
        currency: '0xabc' as const,
        price: BigInt('1000000000000000000'),
        nonce: BigInt('1'),
        deadline: BigInt('1234567890')
      };
      const signature = '0xsignature';

      const mockNFT = {
        id: nftId,
        name: 'Test NFT',
        owner_id: 'user-123',
        contract_address: '0xcontract',
        token_id: '1'
      };

      // Mock NFT update
      mockQuery.single.mockResolvedValueOnce({
        data: mockNFT,
        error: null
      });

      // Mock order insert
      mockQuery.single.mockResolvedValueOnce({
        data: { id: 'order-123' },
        error: null
      });

      // Mock transaction insert
      mockQuery.insert.mockResolvedValue({
        data: { id: 'tx-123' },
        error: null
      });

      const result = await listNFT(nftId, order, signature);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('nfts');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('orders');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('transactions');
      expect(result).toEqual({ id: 'tx-123' });
    });
  });

  describe('getCollectionCategories', () => {
    it('should get collection categories successfully', async () => {
      const mockCategories = [
        { id: 1, name: 'Art' },
        { id: 2, name: 'Gaming' }
      ];

      mockQuery.order.mockResolvedValue({ data: mockCategories, error: null });

      const result = await getCollectionCategories();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('collections_categories');
      expect(mockQuery.order).toHaveBeenCalledWith('name', { ascending: true });
      expect(result).toEqual(mockCategories);
    });

    it('should return empty array when query fails', async () => {
      mockQuery.order.mockResolvedValue({
        data: null,
        error: { message: 'Query failed' }
      });

      const result = await getCollectionCategories();

      expect(result).toEqual([]);
    });
  });

  describe('fetchCollectionsWithFilters', () => {
    it('should fetch collections with filters successfully', async () => {
      const mockCollections = [
        { id: 'col-1', name: 'Collection 1' },
        { id: 'col-2', name: 'Collection 2' }
      ];

      mockSupabaseClient.rpc.mockResolvedValue({
        data: mockCollections,
        error: null
      });

      const params = {
        categoryId: '1',
        userId: 'user-123',
        timeRange: '7d',
        sortBy: 'volume',
        sortDirection: 'DESC' as const,
        page: 1,
        pageSize: 10
      };

      const result = await fetchCollectionsWithFilters(params);

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
        'get_collections_with_filters_and_sort',
        expect.objectContaining({
          p_category_id: '1',
          p_user_id: 'user-123',
          p_time_range: '7d',
          p_sort_by: 'volume',
          p_sort_direction: 'DESC',
          p_limit: 10,
          p_offset: 0
        })
      );
      expect(result).toEqual(mockCollections);
    });

    it('should handle RPC call failure', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC failed' }
      });

      await expect(fetchCollectionsWithFilters()).rejects.toThrow();
    });

    it('should work with empty parameters', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({
        data: [],
        error: null
      });

      const result = await fetchCollectionsWithFilters();

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
        'get_collections_with_filters_and_sort',
        {}
      );
      expect(result).toEqual([]);
    });
  });

  describe('getNftsByCollectionCategoryId', () => {
    it('should get NFTs by collection category successfully', async () => {
      const mockCollections = [{ id: 'col-1' }, { id: 'col-2' }];
      const mockNFTs = [{ id: 'nft-1' }, { id: 'nft-2' }];

      // Mock collections query
      mockQuery.eq.mockResolvedValueOnce({
        data: mockCollections,
        error: null
      });

      // Mock NFTs query
      mockQuery.range.mockResolvedValue({
        data: mockNFTs,
        error: null
      });

      const result = await getNftsByCollectionCategoryId({
        categoryId: 1,
        page: 1,
        pageSize: 10,
        sortBy: SORT_OPTIONS.RECENT_CREATED
      });

      expect(result).toEqual(mockNFTs);
    });

    it('should handle category ID 0 (all categories)', async () => {
      const mockNFTs = [{ id: 'nft-1' }];

      mockQuery.range.mockResolvedValue({
        data: mockNFTs,
        error: null
      });

      const result = await getNftsByCollectionCategoryId({
        categoryId: 0,
        page: 1,
        pageSize: 10,
        sortBy: SORT_OPTIONS.RECENT_CREATED
      });

      expect(mockQuery.in).not.toHaveBeenCalled();
      expect(result).toEqual(mockNFTs);
    });

    it('should handle errors gracefully', async () => {
      mockQuery.eq.mockResolvedValue({
        data: null,
        error: { message: 'Query failed' }
      });

      const result = await getNftsByCollectionCategoryId({
        categoryId: 1,
        page: 1,
        pageSize: 10,
        sortBy: SORT_OPTIONS.RECENT_CREATED
      });

      expect(result).toEqual([]);
    });
  });

  describe('addOrder', () => {
    it('should add order successfully', async () => {
      const nftId = 'nft-123';
      const order = {
        seller: '0x123' as const,
        buyer: '0x456' as const,
        currency: '0xabc' as const,
        price: BigInt('1000000000000000000'),
        nonce: BigInt('1'),
        deadline: BigInt('1234567890')
      };
      const signature = '0xsignature';

      const mockNFT = {
        id: nftId,
        contract_address: '0xcontract',
        token_id: '1',
        owner_id: 'user-123'
      };

      const mockOrder = {
        id: 'order-123',
        offerer_id: 'user-123',
        ...order
      };

      // Mock NFT select
      mockQuery.single.mockResolvedValueOnce({
        data: mockNFT,
        error: null
      });

      // Mock order insert
      mockQuery.single.mockResolvedValueOnce({
        data: mockOrder,
        error: null
      });

      const result = await addOrder(nftId, order, signature);

      expect(result).toEqual(mockOrder);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('nfts');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('orders');
    });

    it('should throw error when order insertion fails', async () => {
      const nftId = 'nft-123';
      const order = {
        seller: '0x123' as const,
        buyer: '0x456' as const,
        currency: '0xabc' as const,
        price: BigInt('1000000000000000000'),
        nonce: BigInt('1'),
        deadline: BigInt('1234567890')
      };

      mockQuery.single.mockResolvedValueOnce({
        data: { id: 'nft-123' },
        error: null
      });

      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Insert failed' }
      });

      await expect(addOrder(nftId, order, '0xsig')).rejects.toThrow('添加Order失败');
    });
  });

  describe('getActiveOrderByNFTId', () => {
    it('should get active order by NFT ID successfully', async () => {
      const nftId = 'nft-123';
      const mockOrder = {
        id: 'order-123',
        nft_id: nftId,
        status: NFTOrderStatus.Active
      };

      mockQuery.single.mockResolvedValue({
        data: mockOrder,
        error: null
      });

      const result = await getActiveOrderByNFTId(nftId);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('orders');
      expect(mockQuery.eq).toHaveBeenCalledWith('nft_id', nftId);
      expect(mockQuery.eq).toHaveBeenCalledWith('status', NFTOrderStatus.Active);
      expect(result).toEqual(mockOrder);
    });

    it('should call notFound when order not found', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Order not found' }
      });

      await getActiveOrderByNFTId('nft-123');

      expect(mockNotFound).toHaveBeenCalled();
    });
  });
});