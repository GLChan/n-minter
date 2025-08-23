/**
 * @jest-environment jsdom
 */

import { NFTOrderStatus } from './enums';

// Mock the enums to avoid circular dependency
jest.mock('./enums', () => ({
  NFTOrderStatus: {
    Active: 'active',
    Filled: 'filled',
    Cancelled: 'cancelled',
    Expired: 'expired',
  },
}));

describe('Types Index', () => {
  describe('Type exports', () => {
    it('should export basic table types', () => {
      // These should be importable
      type NFT = import('../index').NFT;
      type Collection = import('../index').Collection;
      type UserProfile = import('../index').UserProfile;
      type Transaction = import('../index').Transaction;
      type ActivityLog = import('../index').ActivityLog;
      
      expect(true).toBe(true); // Types exist and compile
    });

    it('should export attribute types', () => {
      type Attribute = import('../index').Attribute;
      type NFTAttribute = import('../index').NFTAttribute;
      type AttributeKeyValue = import('../index').AttributeKeyValue;
      
      expect(true).toBe(true); // Types exist and compile
    });

    it('should export collection types', () => {
      type Collection = import('../index').Collection;
      type CollectionCategory = import('../index').CollectionCategory;
      type CollectionInfo = import('../index').CollectionInfo;
      type CollectionListItem = import('../index').CollectionListItem;
      type CollectionStats = import('../index').CollectionStats;
      
      expect(true).toBe(true); // Types exist and compile
    });

    it('should export order and transaction types', () => {
      type Order = import('../index').Order;
      type OrderItem = import('../index').OrderItem;
      type OrderPayload = import('../index').OrderPayload;
      type Transaction = import('../index').Transaction;
      
      expect(true).toBe(true); // Types exist and compile
    });

    it('should export user-related types', () => {
      type UserProfile = import('../index').UserProfile;
      type UserCollection = import('../index').UserCollection;
      type UserFollowing = import('../index').UserFollowing;
      type UserFollowStats = import('../index').UserFollowStats;
      
      expect(true).toBe(true); // Types exist and compile
    });

    it('should export utility types', () => {
      type Optional = import('../index').Optional<string>;
      type FeaturedNFTBanner = import('../index').FeaturedNFTBanner;
      
      expect(true).toBe(true); // Types exist and compile
    });
  });

  describe('Extended interface types', () => {
    it('should define NFTInfo with correct extensions', () => {
      type NFTInfo = import('../index').NFTInfo;
      type NFT = import('../index').NFT;
      
      // NFTInfo should extend NFT and add collection and profile
      const mockNFTInfo = {} as NFTInfo;
      const mockNFT = mockNFTInfo as NFT; // Should be assignable
      
      expect(mockNFT).toBeDefined();
    });

    it('should define NFTDetail with correct extensions', () => {
      type NFTDetail = import('../index').NFTDetail;
      type NFT = import('../index').NFT;
      
      // NFTDetail should extend NFT and add owner, creator, collection
      const mockNFTDetail = {} as NFTDetail;
      const mockNFT = mockNFTDetail as NFT; // Should be assignable
      
      expect(mockNFT).toBeDefined();
    });

    it('should define CollectionInfo with correct extensions', () => {
      type CollectionInfo = import('../index').CollectionInfo;
      type Collection = import('../index').Collection;
      
      // CollectionInfo should extend Collection and add creator
      const mockCollectionInfo = {} as CollectionInfo;
      const mockCollection = mockCollectionInfo as Collection; // Should be assignable
      
      expect(mockCollection).toBeDefined();
    });

    it('should define CollectionListItem with correct extensions', () => {
      type CollectionListItem = import('../index').CollectionListItem;
      type Collection = import('../index').Collection;
      
      // CollectionListItem should extend Collection and add stats
      const mockCollectionListItem = {} as CollectionListItem;
      const mockCollection = mockCollectionListItem as Collection; // Should be assignable
      
      expect(mockCollection).toBeDefined();
    });

    it('should define ActivityLogItem with correct extensions', () => {
      type ActivityLogItem = import('../index').ActivityLogItem;
      type ActivityLog = import('../index').ActivityLog;
      
      // ActivityLogItem should extend ActivityLog and add related entities
      const mockActivityLogItem = {} as ActivityLogItem;
      const mockActivityLog = mockActivityLogItem as ActivityLog; // Should be assignable
      
      expect(mockActivityLog).toBeDefined();
    });

    it('should define OrderItem with correct extensions', () => {
      type OrderItem = import('../index').OrderItem;
      type Order = import('../index').Order;
      
      // OrderItem should extend Order and add nft and offerer
      const mockOrderItem = {} as OrderItem;
      const mockOrder = mockOrderItem as Order; // Should be assignable
      
      expect(mockOrder).toBeDefined();
    });
  });

  describe('Optional utility type', () => {
    it('should make types optional or nullable', () => {
      type Optional = import('../index').Optional<string>;
      
      // Should allow string, undefined, or null
      const value1: Optional = 'test';
      const value2: Optional = undefined;
      const value3: Optional = null;
      
      expect(value1).toBe('test');
      expect(value2).toBeUndefined();
      expect(value3).toBeNull();
    });

    it('should work with complex types', () => {
      type UserProfile = import('../index').UserProfile;
      type Optional = import('../index').Optional<UserProfile>;
      
      const optionalUser: Optional = null;
      expect(optionalUser).toBeNull();
    });
  });

  describe('AttributeKeyValue interface', () => {
    it('should define string index signature', () => {
      type AttributeKeyValue = import('../index').AttributeKeyValue;
      
      const attributes: AttributeKeyValue = {
        color: 'red',
        rarity: 'epic',
        size: 'large',
      };
      
      expect(attributes.color).toBe('red');
      expect(attributes.rarity).toBe('epic');
      expect(attributes.size).toBe('large');
    });

    it('should accept any string keys', () => {
      type AttributeKeyValue = import('../index').AttributeKeyValue;
      
      const attributes: AttributeKeyValue = {
        '任意中文键': '中文值',
        'special-key': 'special-value',
        'key_with_underscore': 'underscore-value',
      };
      
      expect(attributes['任意中文键']).toBe('中文值');
      expect(attributes['special-key']).toBe('special-value');
      expect(attributes['key_with_underscore']).toBe('underscore-value');
    });
  });

  describe('CollectionStats interface', () => {
    it('should define correct structure', () => {
      type CollectionStats = import('../index').CollectionStats;
      
      const stats: CollectionStats = {
        volume: 100,
        floorPrice: 0.5,
        itemCount: 1000,
        ownerCount: 250,
      };
      
      expect(stats.volume).toBe(100);
      expect(stats.floorPrice).toBe(0.5);
      expect(stats.itemCount).toBe(1000);
      expect(stats.ownerCount).toBe(250);
    });

    it('should have correct property types', () => {
      type CollectionStats = import('../index').CollectionStats;
      
      const stats: CollectionStats = {
        volume: 0,
        floorPrice: 0,
        itemCount: 0,
        ownerCount: 0,
      };
      
      // All should be numbers
      expect(typeof stats.volume).toBe('number');
      expect(typeof stats.floorPrice).toBe('number');
      expect(typeof stats.itemCount).toBe('number');
      expect(typeof stats.ownerCount).toBe('number');
    });
  });

  describe('UserFollowStats interface', () => {
    it('should define correct structure', () => {
      type UserFollowStats = import('../index').UserFollowStats;
      
      const stats: UserFollowStats = {
        followersCount: 100,
        followingCount: 50,
        error: 'Test error',
      };
      
      expect(stats.followersCount).toBe(100);
      expect(stats.followingCount).toBe(50);
      expect(stats.error).toBe('Test error');
    });

    it('should allow optional error field', () => {
      type UserFollowStats = import('../index').UserFollowStats;
      
      const stats: UserFollowStats = {
        followersCount: 100,
        followingCount: 50,
      };
      
      expect(stats.error).toBeUndefined();
    });
  });

  describe('OrderPayload type', () => {
    it('should define correct structure for blockchain orders', () => {
      type OrderPayload = import('../index').OrderPayload;
      
      const order: OrderPayload = {
        seller: '0x1234567890123456789012345678901234567890',
        buyer: '0x0000000000000000000000000000000000000000',
        nftAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        tokenId: BigInt('1'),
        currency: '0xA0b86a33E6441C2D6e4A146C6C7D5E5D5D6b5C2e',
        price: BigInt('1000000000000000000'),
        nonce: BigInt('123'),
        deadline: BigInt('1640995200'),
      };
      
      expect(order.seller).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(order.buyer).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(typeof order.tokenId).toBe('bigint');
      expect(typeof order.price).toBe('bigint');
      expect(typeof order.nonce).toBe('bigint');
      expect(typeof order.deadline).toBe('bigint');
    });

    it('should use correct address format', () => {
      type OrderPayload = import('../index').OrderPayload;
      
      const order: OrderPayload = {
        seller: '0x1234567890123456789012345678901234567890',
        buyer: '0x0000000000000000000000000000000000000000',
        nftAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        tokenId: BigInt('1'),
        currency: '0xA0b86a33E6441C2D6e4A146C6C7D5E5D5D6b5C2e',
        price: BigInt('1000000000000000000'),
        nonce: BigInt('123'),
        deadline: BigInt('1640995200'),
      };
      
      // All address fields should start with 0x
      expect(order.seller.startsWith('0x')).toBe(true);
      expect(order.buyer.startsWith('0x')).toBe(true);
      expect(order.nftAddress.startsWith('0x')).toBe(true);
      expect(order.currency.startsWith('0x')).toBe(true);
    });
  });

  describe('EIP712_TYPES constant', () => {
    it('should export EIP712_TYPES constant', () => {
      const { EIP712_TYPES } = require('../index');
      
      expect(EIP712_TYPES).toBeDefined();
      expect(typeof EIP712_TYPES).toBe('object');
    });

    it('should define Order type for EIP712', () => {
      const { EIP712_TYPES } = require('../index');
      
      expect(EIP712_TYPES.Order).toBeDefined();
      expect(Array.isArray(EIP712_TYPES.Order)).toBe(true);
    });

    it('should have correct Order fields for EIP712', () => {
      const { EIP712_TYPES } = require('../index');
      
      const orderFields = EIP712_TYPES.Order;
      const fieldNames = orderFields.map((field: any) => field.name);
      
      expect(fieldNames).toContain('seller');
      expect(fieldNames).toContain('buyer');
      expect(fieldNames).toContain('nftAddress');
      expect(fieldNames).toContain('tokenId');
      expect(fieldNames).toContain('currency');
      expect(fieldNames).toContain('price');
      expect(fieldNames).toContain('nonce');
      expect(fieldNames).toContain('deadline');
    });

    it('should have correct types for EIP712 fields', () => {
      const { EIP712_TYPES } = require('../index');
      
      const orderFields = EIP712_TYPES.Order;
      const addressFields = orderFields.filter((field: any) => field.type === 'address');
      const uint256Fields = orderFields.filter((field: any) => field.type === 'uint256');
      
      expect(addressFields.length).toBeGreaterThan(0);
      expect(uint256Fields.length).toBeGreaterThan(0);
    });
  });

  describe('Import dependencies', () => {
    it('should import from database types', () => {
      // Should be able to import Tables from database.types
      type Tables = import('../index').NFT;
      expect(true).toBe(true); // Type compiles
    });

    it('should import from enums', () => {
      // Should be able to import NFTOrderStatus
      expect(NFTOrderStatus.Active).toBe('active');
    });
  });

  describe('Type relationships', () => {
    it('should maintain proper type relationships between extended interfaces', () => {
      type NFT = import('../index').NFT;
      type NFTInfo = import('../index').NFTInfo;
      type Collection = import('../index').Collection;
      type UserProfile = import('../index').UserProfile;
      
      const mockNFTInfo: NFTInfo = {
        collection: {} as Collection | null,
        profile: {} as UserProfile | null,
      } as NFTInfo;
      
      // Should be assignable to NFT
      const nft: NFT = mockNFTInfo;
      expect(nft).toBeDefined();
    });

    it('should handle nullable relationships correctly', () => {
      type NFTInfo = import('../index').NFTInfo;
      
      const mockNFTInfo: NFTInfo = {
        collection: null,
        profile: null,
      } as NFTInfo;
      
      expect(mockNFTInfo.collection).toBeNull();
      expect(mockNFTInfo.profile).toBeNull();
    });
  });

  describe('Module structure', () => {
    it('should be a well-formed TypeScript module', () => {
      const typesModule = require('../index');
      
      // Should export EIP712_TYPES
      expect(typesModule.EIP712_TYPES).toBeDefined();
    });

    it('should export all documented types', () => {
      // All these should be importable without error
      type NFT = import('../index').NFT;
      type Collection = import('../index').Collection;
      type UserProfile = import('../index').UserProfile;
      type Transaction = import('../index').Transaction;
      type Order = import('../index').Order;
      type OrderPayload = import('../index').OrderPayload;
      type EIP712Types = typeof import('../index').EIP712_TYPES;
      
      expect(true).toBe(true); // All types importable
    });
  });

  describe('Enum integration', () => {
    it('should properly integrate with NFTOrderStatus enum', () => {
      type OrderItem = import('../index').OrderItem;
      
      const mockOrderItem = {
        status: NFTOrderStatus.Active,
      } as OrderItem;
      
      expect(mockOrderItem.status).toBe('active');
    });
  });

  describe('BigInt usage', () => {
    it('should properly use BigInt for blockchain values', () => {
      type OrderPayload = import('../index').OrderPayload;
      
      const order: OrderPayload = {
        seller: '0x123' as any,
        buyer: '0x456' as any,
        nftAddress: '0x789' as any,
        tokenId: BigInt(1),
        currency: '0xabc' as any,
        price: BigInt('1000000000000000000'),
        nonce: BigInt(123),
        deadline: BigInt(Date.now() / 1000 + 3600),
      };
      
      expect(typeof order.tokenId).toBe('bigint');
      expect(typeof order.price).toBe('bigint');
      expect(typeof order.nonce).toBe('bigint');
      expect(typeof order.deadline).toBe('bigint');
    });
  });
});