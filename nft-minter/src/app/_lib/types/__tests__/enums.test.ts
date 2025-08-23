import { 
  TransactionType, 
  NFTMarketStatus, 
  ActionType, 
  NFTVisibilityStatus,
  TransactionStatus,
  NFTOrderStatus,
  NFTOrderType,
  SORT_OPTIONS
} from '../enums';

describe('Enums', () => {
  describe('TransactionType', () => {
    it('should have correct values', () => {
      expect(TransactionType.Sale).toBe('SALE');
      expect(TransactionType.Transfer).toBe('TRANSFER');
      expect(TransactionType.Mint).toBe('MINT');
      expect(TransactionType.List).toBe('LIST');
      expect(TransactionType.Unlist).toBe('UNLIST');
    });
  });

  describe('NFTMarketStatus', () => {
    it('should have correct values', () => {
      expect(NFTMarketStatus.NotListed).toBe('NotListed');
      expect(NFTMarketStatus.ListedFixedPrice).toBe('ListedFixedPrice');
      expect(NFTMarketStatus.ListedAuction).toBe('ListedAuction');
      expect(NFTMarketStatus.ReservedForBuyer).toBe('ReservedForBuyer');
      expect(NFTMarketStatus.ExpiredListing).toBe('ExpiredListing');
      expect(NFTMarketStatus.InactiveListing).toBe('InactiveListing');
    });
  });

  describe('ActionType', () => {
    it('should have correct values', () => {
      expect(ActionType.FOLLOW_USER).toBe('FOLLOW_USER');
      expect(ActionType.UNFOLLOW_USER).toBe('UNFOLLOW_USER');
      expect(ActionType.MINT_NFT).toBe('MINT_NFT');
      expect(ActionType.CREATE_COLLECTION).toBe('CREATE_COLLECTION');
      expect(ActionType.BUY_NFT).toBe('BUY_NFT');
      expect(ActionType.SELL_NFT).toBe('SELL_NFT');
    });
  });

  describe('NFTVisibilityStatus', () => {
    it('should have correct values', () => {
      expect(NFTVisibilityStatus.Visible).toBe('Visible');
      expect(NFTVisibilityStatus.HiddenByUser).toBe('HiddenByUser');
      expect(NFTVisibilityStatus.DelistedByPlatform).toBe('DelistedByPlatform');
    });
  });

  describe('TransactionStatus', () => {
    it('should have correct values', () => {
      expect(TransactionStatus.Pending).toBe('Pending');
      expect(TransactionStatus.Successful).toBe('Successful');
      expect(TransactionStatus.Failed).toBe('Failed');
      expect(TransactionStatus.Cancelled).toBe('Cancelled');
    });
  });

  describe('NFTOrderStatus', () => {
    it('should have correct values', () => {
      expect(NFTOrderStatus.Active).toBe('active');
      expect(NFTOrderStatus.Filled).toBe('filled');
      expect(NFTOrderStatus.Cancelled).toBe('cancelled');
      expect(NFTOrderStatus.Expired).toBe('expired');
      expect(NFTOrderStatus.Pending).toBe('pending');
      expect(NFTOrderStatus.Rejected).toBe('rejected');
    });
  });

  describe('NFTOrderType', () => {
    it('should have correct values', () => {
      expect(NFTOrderType.LISTING).toBe('LISTING');
      expect(NFTOrderType.OFFER).toBe('OFFER');
    });
  });

  describe('SORT_OPTIONS', () => {
    it('should have correct values', () => {
      expect(SORT_OPTIONS.RECENT_LISTED).toBe('recent_listed');
      expect(SORT_OPTIONS.PRICE_ASC).toBe('price_asc');
      expect(SORT_OPTIONS.PRICE_DESC).toBe('price_desc');
      expect(SORT_OPTIONS.RECENT_CREATED).toBe('recent_created');
    });
  });
});