// Mock environment variables first
jest.mock('../../config/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test-key',
    NEXT_PUBLIC_MY_NFT_FACTORY_ADDRESS: '0x1234567890123456789012345678901234567890',
    NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS: '0x0987654321098765432109876543210987654321',
    NEXT_PUBLIC_WETH_CONTRACT_ADDRESS: '0x1111111111111111111111111111111111111111',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    NEXT_PUBLIC_APP_BASE_URL: 'https://test.example.com',
    JWT_SECRET_KEY: 'test-jwt-secret',
    PRIVATE_KEY: 'test-private-key',
  },
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    const d = new Date(date);
    if (formatStr === 'yyyy-MM-dd') {
      return d.toISOString().split('T')[0];
    }
    if (formatStr === 'yyyy-MM-dd HH:mm') {
      return d.toISOString().split('T')[0] + ' ' + d.toISOString().split('T')[1].substring(0, 5);
    }
    return d.toISOString();
  }),
}));

import {
  cn,
  truncateText,
  formatAddress,
  formatPrice,
  shortenAddress,
  formatTimeAgo,
  formatIPFSUrl,
  formatDate,
  formatDateTime,
  getFilePrefixAndExtension,
  ethToWei,
  weiToEth,
  getCookieOptions,
  generateWalletP
} from '../index';

describe('Utility Functions', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('should handle undefined and null values', () => {
      const result = cn('class1', undefined, null, 'class2');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base', isActive && 'active');
      expect(result).toContain('base');
      expect(result).toContain('active');
    });

    it('should handle conditional classes when false', () => {
      const isActive = false;
      const result = cn('base', isActive && 'active');
      expect(result).toContain('base');
      expect(result).not.toContain('active');
    });
  });

  describe('truncateText', () => {
    it('should truncate text longer than specified length', () => {
      expect(truncateText('Hello World', 5)).toBe('Hello...');
      expect(truncateText('Short', 10)).toBe('Short');
      expect(truncateText('', 5)).toBe('');
    });

    it('should handle null/undefined input', () => {
      expect(truncateText('', 5)).toBe('');
    });
  });

  describe('formatAddress', () => {
    it('should format Ethereum address correctly', () => {
      const address = '0x1234567890123456789012345678901234567890';
      expect(formatAddress(address)).toBe('0x1234...7890');
    });

    it('should handle empty address', () => {
      expect(formatAddress('')).toBe('');
    });
  });

  describe('formatPrice', () => {
    it('should format price with ETH suffix', () => {
      const result = formatPrice('1.5');
      expect(result).toContain('ETH');
      expect(result).toContain('1.50');
    });

    it('should handle zero price', () => {
      const result = formatPrice('0');
      expect(result).toContain('ETH');
    });
  });

  describe('shortenAddress', () => {
    it('should shorten address like formatAddress', () => {
      const address = '0x1234567890123456789012345678901234567890';
      expect(shortenAddress(address)).toBe('0x1234...7890');
    });

    it('should handle empty address', () => {
      expect(shortenAddress('')).toBe('');
    });
  });

  describe('formatTimeAgo', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-01-01T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should format seconds ago', () => {
      const past = new Date('2023-01-01T11:59:30Z');
      expect(formatTimeAgo(past)).toBe('30秒前');
    });

    it('should format minutes ago', () => {
      const past = new Date('2023-01-01T11:58:00Z');
      expect(formatTimeAgo(past)).toBe('2分钟前');
    });

    it('should format hours ago', () => {
      const past = new Date('2023-01-01T10:00:00Z');
      expect(formatTimeAgo(past)).toBe('2小时前');
    });

    it('should format days ago', () => {
      const past = new Date('2022-12-30T12:00:00Z');
      expect(formatTimeAgo(past)).toBe('2天前');
    });
  });

  describe('formatIPFSUrl', () => {
    it('should convert IPFS URI to HTTP URL', () => {
      const ipfsUri = 'ipfs://QmTestCID123';
      const result = formatIPFSUrl(ipfsUri);
      expect(result).toContain('QmTestCID123');
      expect(result).toContain('https://');
    });

    it('should return original URL if not IPFS', () => {
      const httpUrl = 'https://example.com/image.jpg';
      expect(formatIPFSUrl(httpUrl)).toBe(httpUrl);
    });

    it('should handle null/undefined input', () => {
      expect(formatIPFSUrl(null)).toBe('');
      expect(formatIPFSUrl(undefined)).toBe('');
    });
  });

  describe('formatDate', () => {
    it('should format date to YYYY-MM-DD', () => {
      const date = new Date('2023-01-15T10:30:00Z');
      expect(formatDate(date)).toBe('2023-01-15');
    });

    it('should handle string input', () => {
      expect(formatDate('2023-01-15')).toBe('2023-01-15');
    });

    it('should handle empty input', () => {
      expect(formatDate('')).toBe('');
    });
  });

  describe('formatDateTime', () => {
    it('should format date with time', () => {
      const date = new Date('2023-01-15T10:30:00Z');
      expect(formatDateTime(date)).toBe('2023-01-15 10:30');
    });

    it('should handle empty input', () => {
      expect(formatDateTime('')).toBe('');
    });
  });

  describe('getFilePrefixAndExtension', () => {
    it('should extract file prefix and extension', () => {
      expect(getFilePrefixAndExtension('image.jpg')).toEqual({
        prefix: 'image',
        extension: 'jpg'
      });
    });

    it('should handle file path with directories', () => {
      expect(getFilePrefixAndExtension('/path/to/image.png')).toEqual({
        prefix: 'image',
        extension: 'png'
      });
    });

    it('should handle file without extension', () => {
      expect(getFilePrefixAndExtension('filename')).toEqual({
        prefix: 'filename',
        extension: ''
      });
    });

    it('should handle empty path', () => {
      expect(getFilePrefixAndExtension('')).toEqual({
        prefix: '',
        extension: ''
      });
    });
  });

  describe('ethToWei', () => {
    it('should convert ETH to Wei', () => {
      expect(ethToWei('1')).toBe('1000000000000000000');
      expect(ethToWei(1)).toBe('1000000000000000000');
    });

    it('should handle zero', () => {
      expect(ethToWei('0')).toBe('0');
    });

    it('should handle empty string', () => {
      expect(ethToWei('')).toBe('0');
    });
  });

  describe('weiToEth', () => {
    it('should convert Wei to ETH', () => {
      expect(weiToEth('1000000000000000000')).toBe('1.0');
    });

    it('should handle bigint input', () => {
      expect(weiToEth(BigInt('1000000000000000000'))).toBe('1.0');
    });

    it('should handle zero', () => {
      expect(weiToEth('0')).toBe('0.0');
    });

    it('should handle empty string', () => {
      expect(weiToEth('')).toBe('0.0');
    });
  });

  describe('getCookieOptions', () => {
    it('should return cookie options with correct properties', () => {
      const options = getCookieOptions();
      expect(options).toHaveProperty('name');
      expect(options).toHaveProperty('httpOnly', true);
      expect(options).toHaveProperty('sameSite', 'lax');
      expect(typeof options.secure).toBe('boolean');
    });
  });

  describe('generateWalletP', () => {
    // Mock process.env.PROJECT_SECRET for this function
    const originalEnv = process.env;
    
    beforeEach(() => {
      process.env = { ...originalEnv, PROJECT_SECRET: 'test-secret' };
    });
    
    afterEach(() => {
      process.env = originalEnv;
    });
    
    it('should generate a password from wallet address', () => {
      const walletAddress = '0x1234567890123456789012345678901234567890';
      const password = generateWalletP(walletAddress);
      
      expect(typeof password).toBe('string');
      expect(password.length).toBe(16); // (34-2)/2 = 16 characters
    });
    
    it('should generate different passwords for different addresses', () => {
      const address1 = '0x1234567890123456789012345678901234567890';
      const address2 = '0x0987654321098765432109876543210987654321';
      
      const password1 = generateWalletP(address1);
      const password2 = generateWalletP(address2);
      
      expect(password1).not.toBe(password2);
    });
    
    it('should generate consistent password for same address', () => {
      const walletAddress = '0x1234567890123456789012345678901234567890';
      
      const password1 = generateWalletP(walletAddress);
      const password2 = generateWalletP(walletAddress);
      
      expect(password1).toBe(password2);
    });
  });
});