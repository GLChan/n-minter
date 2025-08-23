/**
 * @jest-environment jsdom
 */

import {
  addActivityLog,
  getProfileByWallet,
  doesUserExistByWalletAddress,
  getUserInfo,
  getFeaturedNFT,
  getCollectionsByUserId,
  saveNFT,
  saveNFTAttributes,
  saveTransaction,
  isNFTFavorited,
  addNFTToFavorites,
  removeNFTFromFavorites,
  getUserFavoriteNFTs,
  getUserCollections,
  isUserFollow,
  addUserFollow,
  removeUserFollow,
  getSuggestedUsers,
  saveCollection,
  getReceivedOffers,
  recordTransaction,
} from '../actions';

import { ActionType, TransactionType } from '../types/enums';
import { createClient } from '../supabase/server';
import { getSupabaseAdmin } from '../supabase/admin';

// Mock dependencies
jest.mock('../supabase/admin', () => ({
  getSupabaseAdmin: jest.fn(),
}));

jest.mock('../supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('../types', () => ({
  ActivityLog: {},
  AttributeKeyValue: {},
  Collection: {},
  CollectionListItem: {},
  NFT: {},
  NFTAttribute: {},
  NFTInfo: {},
  OrderItem: {},
  Transaction: {},
  UserProfile: {},
}));

const mockSupabaseClient = {
  from: jest.fn(),
  auth: {
    getUser: jest.fn(),
  },
  rpc: jest.fn(),
};

const mockSupabaseAdmin = {
  from: jest.fn(),
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
};

describe('Server Actions', () => {
  const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
  const mockGetSupabaseAdmin = getSupabaseAdmin as jest.MockedFunction<typeof getSupabaseAdmin>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient.mockResolvedValue(mockSupabaseClient as any);
    mockGetSupabaseAdmin.mockReturnValue(mockSupabaseAdmin as any);

    // Reset all query methods to return chainable mock
    Object.keys(mockQuery).forEach(key => {
      mockQuery[key].mockReturnValue(mockQuery);
    });

    mockSupabaseClient.from.mockReturnValue(mockQuery);
    mockSupabaseAdmin.from.mockReturnValue(mockQuery);
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
      expect(mockQuery.single).toHaveBeenCalled();
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

  describe('getProfileByWallet', () => {
    it('should get profile by wallet address successfully', async () => {
      const walletAddress = '0x123';
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

  describe('doesUserExistByWalletAddress', () => {
    it('should return true when user exists', async () => {
      mockQuery.maybeSingle.mockResolvedValue({ 
        data: { id: 'user-123' }, 
        error: null 
      });

      const result = await doesUserExistByWalletAddress('0x123');

      expect(result).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(mockQuery.eq).toHaveBeenCalledWith('wallet_address', '0x123');
    });

    it('should return false when user does not exist', async () => {
      mockQuery.maybeSingle.mockResolvedValue({ data: null, error: null });

      const result = await doesUserExistByWalletAddress('0x123');

      expect(result).toBe(false);
    });

    it('should return false for empty address', async () => {
      const result = await doesUserExistByWalletAddress('');

      expect(result).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.maybeSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await doesUserExistByWalletAddress('0x123');

      expect(result).toBe(false);
    });
  });

  describe('getUserInfo', () => {
    it('should get user info successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@test.com' };
      const mockProfile = { id: 'user-123', username: 'testuser' };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });
      mockQuery.single.mockResolvedValue({ data: mockProfile, error: null });

      const result = await getUserInfo();

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(mockQuery.eq).toHaveBeenCalledWith('id', mockUser.id);
      expect(result).toEqual(mockProfile);
    });

    it('should return null when auth error occurs', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' }
      });

      const result = await getUserInfo();

      expect(result).toBeNull();
    });

    it('should throw error when user is not logged in', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      await expect(getUserInfo()).rejects.toThrow('You must be logged in');
    });
  });

  describe('getFeaturedNFT', () => {
    it('should get featured NFT successfully', async () => {
      const mockFeaturedNFT = { 
        id: 'banner-123', 
        nfts: { id: 'nft-123', name: 'Test NFT' } 
      };
      mockQuery.single.mockResolvedValue({ data: mockFeaturedNFT, error: null });

      const result = await getFeaturedNFT();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('featured_nft_banners');
      expect(mockQuery.select).toHaveBeenCalledWith('*, nfts!nft_id(*, profiles!owner_id(*))');
      expect(result).toEqual(mockFeaturedNFT);
    });

    it('should return null when error occurs', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' }
      });

      const result = await getFeaturedNFT();

      expect(result).toBeNull();
    });
  });

  describe('getCollectionsByUserId', () => {
    it('should get collections by user ID successfully', async () => {
      const mockCollections = [
        { id: 'col-1', name: 'Collection 1' },
        { id: 'col-2', name: 'Collection 2' }
      ];
      mockQuery.order.mockResolvedValue({ data: mockCollections, error: null });

      const result = await getCollectionsByUserId('user-123');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('collections');
      expect(mockQuery.eq).toHaveBeenCalledWith('creator_id', 'user-123');
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockCollections);
    });

    it('should throw error when retrieval fails', async () => {
      mockQuery.order.mockResolvedValue({
        data: null,
        error: { message: 'Retrieval failed' }
      });

      await expect(getCollectionsByUserId('user-123')).rejects.toThrow('Collections could not be retrieved');
    });
  });

  describe('saveNFT', () => {
    it('should save NFT successfully', async () => {
      const mockNFT = {
        creator_id: 'user-123',
        name: 'Test NFT',
        description: 'Test description',
        token_id: '1',
        contract_address: '0xabc'
      };
      const mockSavedNFT = { id: 'nft-123', ...mockNFT };

      mockQuery.single.mockResolvedValue({ data: mockSavedNFT, error: null });

      const result = await saveNFT(mockNFT);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('nfts');
      expect(mockQuery.insert).toHaveBeenCalledWith(mockNFT);
      expect(result).toEqual(mockSavedNFT);
    });

    it('should throw error when insert fails', async () => {
      const mockNFT = { name: 'Test NFT' };
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' }
      });

      await expect(saveNFT(mockNFT)).rejects.toThrow('Failed to insert NFT: Insert failed');
    });
  });

  describe('saveNFTAttributes', () => {
    it('should save NFT attributes successfully', async () => {
      const nftId = 'nft-123';
      const attributes = [
        { key: '大小', value: '中等' },
        { key: '颜色', value: '蓝色' }
      ];

      // Mock existing attributes query
      mockQuery.select.mockResolvedValueOnce({
        data: [{ id: 1, name: '大小' }],
        error: null
      });

      // Mock NFT query
      mockQuery.single.mockResolvedValueOnce({
        data: { creator_id: 'user-123' },
        error: null
      });

      // Mock insert new attributes
      mockQuery.select.mockResolvedValueOnce({
        data: [{ id: 2, name: '颜色' }],
        error: null
      });

      // Mock insert NFT attributes
      mockQuery.insert.mockResolvedValueOnce({
        data: null,
        error: null
      });

      await saveNFTAttributes(nftId, attributes);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('attributes');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('nfts');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('nft_attributes');
    });

    it('should handle empty attributes array', async () => {
      await saveNFTAttributes('nft-123', []);

      // Should not make any database calls for empty attributes
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });
  });

  describe('saveTransaction', () => {
    it('should save transaction successfully', async () => {
      const mockTransaction = {
        nft_id: 'nft-123',
        buyer_address: '0x123',
        seller_address: '0x456',
        price: '1000000000000000000'
      };
      const mockSavedTransaction = { id: 'tx-123', ...mockTransaction };

      mockQuery.single.mockResolvedValue({ data: mockSavedTransaction, error: null });

      const result = await saveTransaction(mockTransaction);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('transactions');
      expect(mockQuery.insert).toHaveBeenCalledWith(mockTransaction);
      expect(result).toEqual(mockSavedTransaction);
    });

    it('should throw error when save fails', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Save failed' }
      });

      await expect(saveTransaction({})).rejects.toThrow('保存交易数据失败: Save failed');
    });
  });

  describe('isNFTFavorited', () => {
    it('should return true when NFT is favorited', async () => {
      mockQuery.single.mockResolvedValue({
        data: { id: 'fav-123' },
        error: null
      });

      const result = await isNFTFavorited('user-123', 'nft-123');

      expect(result).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_collections');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockQuery.eq).toHaveBeenCalledWith('nft_id', 'nft-123');
    });

    it('should return false when NFT is not favorited', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' }
      });

      const result = await isNFTFavorited('user-123', 'nft-123');

      expect(result).toBe(false);
    });

    it('should return false for empty parameters', async () => {
      expect(await isNFTFavorited('', 'nft-123')).toBe(false);
      expect(await isNFTFavorited('user-123', '')).toBe(false);
    });
  });

  describe('addNFTToFavorites', () => {
    it('should add NFT to favorites successfully', async () => {
      // Mock isNFTFavorited to return false
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      });

      // Mock successful insert
      const mockFavorite = { id: 'fav-123', user_id: 'user-123', nft_id: 'nft-123' };
      mockQuery.select.mockResolvedValue({
        data: [mockFavorite],
        error: null
      });

      const result = await addNFTToFavorites('user-123', 'nft-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockFavorite]);
    });

    it('should return success if already favorited', async () => {
      // Mock isNFTFavorited to return true
      mockQuery.single.mockResolvedValue({
        data: { id: 'fav-123' },
        error: null
      });

      const result = await addNFTToFavorites('user-123', 'nft-123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('NFT已在收藏中');
    });

    it('should throw error for empty parameters', async () => {
      await expect(addNFTToFavorites('', 'nft-123')).rejects.toThrow('用户ID和NFT ID不能为空');
      await expect(addNFTToFavorites('user-123', '')).rejects.toThrow('用户ID和NFT ID不能为空');
    });
  });

  describe('removeNFTFromFavorites', () => {
    it('should remove NFT from favorites successfully', async () => {
      mockQuery.delete.mockResolvedValue({ error: null });

      const result = await removeNFTFromFavorites('user-123', 'nft-123');

      expect(result.success).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_collections');
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockQuery.eq).toHaveBeenCalledWith('nft_id', 'nft-123');
    });

    it('should throw error for empty parameters', async () => {
      await expect(removeNFTFromFavorites('', 'nft-123')).rejects.toThrow('用户ID和NFT ID不能为空');
    });
  });

  describe('getUserFavoriteNFTs', () => {
    it('should get user favorite NFTs successfully', async () => {
      const mockUserCollections = [
        { nft_id: 'nft-1' },
        { nft_id: 'nft-2' }
      ];
      const mockNFTs = [
        { id: 'nft-1', name: 'NFT 1' },
        { id: 'nft-2', name: 'NFT 2' }
      ];

      mockQuery.eq.mockResolvedValueOnce({
        data: mockUserCollections,
        error: null
      });

      mockQuery.in.mockResolvedValue({
        data: mockNFTs,
        error: null
      });

      const result = await getUserFavoriteNFTs('user-123');

      expect(result).toEqual(mockNFTs);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_collections');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('nfts');
    });

    it('should return empty array for empty user ID', async () => {
      const result = await getUserFavoriteNFTs('');
      expect(result).toEqual([]);
    });
  });

  describe('getUserCollections', () => {
    it('should get user collections successfully', async () => {
      const mockCollections = [
        { id: 'col-1', name: 'Collection 1' },
        { id: 'col-2', name: 'Collection 2' }
      ];

      mockSupabaseClient.rpc.mockResolvedValue({
        data: mockCollections,
        error: null
      });

      const result = await getUserCollections('user-123');

      expect(result).toEqual(mockCollections);
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
        'get_user_collections_with_stats',
        { p_user_id: 'user-123' }
      );
    });

    it('should return empty array for empty user ID', async () => {
      const result = await getUserCollections('');
      expect(result).toEqual([]);
    });
  });

  describe('isUserFollow', () => {
    it('should return true when user is following target', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      });

      mockQuery.maybeSingle.mockResolvedValue({
        data: { id: 'follow-123' },
        error: null
      });

      const result = await isUserFollow('target-456');

      expect(result).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_following');
      expect(mockQuery.eq).toHaveBeenCalledWith('follower_id', 'user-123');
      expect(mockQuery.eq).toHaveBeenCalledWith('following_id', 'target-456');
    });

    it('should return false when user is not logged in', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      const result = await isUserFollow('target-456');

      expect(result).toBe(false);
    });

    it('should return false when trying to follow self', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      });

      const result = await isUserFollow('user-123');

      expect(result).toBe(false);
    });
  });

  describe('addUserFollow', () => {
    it('should add user follow successfully', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      });

      // Mock existing follow check
      mockQuery.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null
      });

      // Mock successful insert
      const mockFollow = { id: 'follow-123', follower_id: 'user-123', following_id: 'target-456' };
      mockQuery.single.mockResolvedValue({
        data: mockFollow,
        error: null
      });

      const result = await addUserFollow('target-456');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockFollow);
    });

    it('should return error when user not logged in', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      const result = await addUserFollow('target-456');

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
    });

    it('should return error when trying to follow self', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      });

      const result = await addUserFollow('user-123');

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
    });
  });

  describe('removeUserFollow', () => {
    it('should remove user follow successfully', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      });

      mockQuery.delete.mockResolvedValue({ error: null });

      const result = await removeUserFollow('target-456');

      expect(result.success).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_following');
      expect(mockQuery.delete).toHaveBeenCalled();
    });

    it('should return error when user not logged in', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      const result = await removeUserFollow('target-456');

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
    });
  });

  describe('getSuggestedUsers', () => {
    it('should get suggested users successfully', async () => {
      const mockUsers = [
        { id: 'user-1', username: 'user1' },
        { id: 'user-2', username: 'user2' }
      ];

      mockQuery.order.mockResolvedValue({
        data: mockUsers,
        error: null
      });

      const result = await getSuggestedUsers();

      expect(result).toEqual(mockUsers);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles');
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should return empty array on error', async () => {
      mockQuery.order.mockResolvedValue({
        data: null,
        error: { message: 'Query failed' }
      });

      const result = await getSuggestedUsers();

      expect(result).toEqual([]);
    });
  });

  describe('saveCollection', () => {
    it('should save collection successfully', async () => {
      const mockCollection = {
        creator_id: 'user-123',
        name: 'Test Collection',
        contract_address: '0xabc'
      };
      const mockSavedCollection = { id: 'col-123', ...mockCollection };

      mockQuery.single.mockResolvedValue({
        data: mockSavedCollection,
        error: null
      });

      const result = await saveCollection(mockCollection);

      expect(result).toEqual(mockSavedCollection);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('collections');
      expect(mockQuery.insert).toHaveBeenCalledWith(mockCollection);
    });

    it('should throw error when save fails', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Save failed' }
      });

      await expect(saveCollection({})).rejects.toThrow('保存合集失败');
    });
  });

  describe('getReceivedOffers', () => {
    it('should get received offers successfully', async () => {
      // Mock getUserInfo
      jest.doMock('../actions', () => ({
        getUserInfo: jest.fn().mockResolvedValue({
          wallet_address: '0x123'
        })
      }));

      const mockOffers = [
        { id: 'offer-1', price: '1000000000000000000' },
        { id: 'offer-2', price: '2000000000000000000' }
      ];

      mockQuery.order.mockResolvedValue({
        data: mockOffers,
        error: null
      });

      const result = await getReceivedOffers();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('orders');
      expect(result).toEqual(mockOffers);
    });

    it('should return empty array on error', async () => {
      mockQuery.order.mockResolvedValue({
        data: null,
        error: { message: 'Query failed' }
      });

      const result = await getReceivedOffers();

      expect(result).toEqual([]);
    });
  });

  describe('recordTransaction', () => {
    it('should record transaction successfully', async () => {
      const transactionParams = {
        nftId: 'nft-123',
        buyerAddress: '0x123',
        sellerAddress: '0x456',
        price: '1000000000000000000',
        transactionType: TransactionType.Sale,
        transactionHash: '0xabc123'
      };

      const mockBuyer = { id: 'buyer-123', wallet_address: '0x123' };
      const mockSeller = { id: 'seller-456', wallet_address: '0x456' };
      const mockNFTData = { id: 'nft-123', name: 'Test NFT' };
      const mockTransaction = { id: 'tx-123', ...transactionParams };

      // Mock getProfileByWallet calls
      jest.doMock('../actions', () => ({
        getProfileByWallet: jest.fn()
          .mockResolvedValueOnce(mockBuyer)
          .mockResolvedValueOnce(mockSeller)
      }));

      // Mock NFT update
      mockQuery.single.mockResolvedValueOnce({
        data: mockNFTData,
        error: null
      });

      // Mock order updates
      mockQuery.update.mockResolvedValueOnce({ error: null });
      mockQuery.update.mockResolvedValueOnce({ error: null });

      // Mock transaction insert
      mockQuery.single.mockResolvedValueOnce({
        data: mockTransaction,
        error: null
      });

      const result = await recordTransaction(transactionParams);

      expect(result).toEqual(mockTransaction);
      expect(getSupabaseAdmin).toHaveBeenCalled();
    });

    it('should throw error when buyer profile not found', async () => {
      jest.doMock('../actions', () => ({
        getProfileByWallet: jest.fn().mockResolvedValue(null)
      }));

      const transactionParams = {
        nftId: 'nft-123',
        buyerAddress: '0x123',
        sellerAddress: '0x456',
        price: '1000000000000000000',
        transactionType: TransactionType.Sale,
        transactionHash: '0xabc123'
      };

      await expect(recordTransaction(transactionParams)).rejects.toThrow('获取当前用户失败');
    });
  });
});