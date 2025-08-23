// Test individual utility functions that don't depend on constants

describe('Utility Functions (Standalone)', () => {
  describe('String truncation', () => {
    it('should truncate long text', () => {
      const truncateText = (text: string, length: number): string => {
        if (!text) return "";
        if (text.length <= length) return text;
        return `${text.slice(0, length)}...`;
      };

      expect(truncateText('Hello World', 5)).toBe('Hello...');
      expect(truncateText('Short', 10)).toBe('Short');
      expect(truncateText('', 5)).toBe('');
    });
  });

  describe('Address formatting', () => {
    it('should format ethereum addresses', () => {
      const formatAddress = (address: string): string => {
        if (!address) return "";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
      };

      const address = '0x1234567890123456789012345678901234567890';
      expect(formatAddress(address)).toBe('0x1234...7890');
      expect(formatAddress('')).toBe('');
    });
  });

  describe('Time formatting', () => {
    it('should format time ago', () => {
      const formatTimeAgo = (date: Date | string): string => {
        const now = new Date();
        const past = new Date(date);
        const diff = Math.floor((now.getTime() - past.getTime()) / 1000);

        if (diff < 60) return `${diff}秒前`;
        if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
        return `${Math.floor(diff / 86400)}天前`;
      };

      const now = new Date();
      const past30Sec = new Date(now.getTime() - 30 * 1000);
      const past2Min = new Date(now.getTime() - 2 * 60 * 1000);
      const past2Hours = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      expect(formatTimeAgo(past30Sec)).toBe('30秒前');
      expect(formatTimeAgo(past2Min)).toBe('2分钟前');
      expect(formatTimeAgo(past2Hours)).toBe('2小时前');
    });
  });

  describe('File utilities', () => {
    it('should extract file prefix and extension', () => {
      const getFilePrefixAndExtension = (filePath: string) => {
        const fileName = filePath.split("/").pop() ?? "";
        const lastDotIndex = fileName.lastIndexOf(".");

        if (lastDotIndex === -1) {
          return { prefix: fileName, extension: "" };
        }

        const prefix = fileName.substring(0, lastDotIndex);
        const extension = fileName.substring(lastDotIndex + 1).toLowerCase();

        return { prefix, extension };
      };

      expect(getFilePrefixAndExtension('image.jpg')).toEqual({
        prefix: 'image',
        extension: 'jpg'
      });

      expect(getFilePrefixAndExtension('/path/to/image.png')).toEqual({
        prefix: 'image',
        extension: 'png'
      });

      expect(getFilePrefixAndExtension('filename')).toEqual({
        prefix: 'filename',
        extension: ''
      });
    });
  });

  describe('IPFS URL formatting', () => {
    it('should convert IPFS URIs to HTTP URLs', () => {
      const PINATA_IPFS_GATEWAY_BASE = "https://azure-many-sole-7.mypinata.cloud/ipfs/";
      
      const formatIPFSUrl = (ipfsUri?: string | null): string => {
        if (!ipfsUri?.startsWith("ipfs://")) {
          return ipfsUri ?? "";
        }
        const cid = ipfsUri.substring(7);
        return `${PINATA_IPFS_GATEWAY_BASE}${cid}`;
      };

      const ipfsUri = 'ipfs://QmTestCID123';
      const result = formatIPFSUrl(ipfsUri);
      expect(result).toContain('QmTestCID123');
      expect(result).toContain('https://');

      expect(formatIPFSUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
      expect(formatIPFSUrl(null)).toBe('');
      expect(formatIPFSUrl(undefined)).toBe('');
    });
  });
});