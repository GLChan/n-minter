import { PINATA_IPFS_GATEWAY_BASE, sessionCookieName, ZERO_ADDRESS, SECONDS_IN_A_DAY } from '../constants';

describe('Constants (Basic)', () => {
  it('should have session cookie name', () => {
    expect(sessionCookieName).toBe('session');
  });

  it('should have IPFS gateway URL', () => {
    expect(PINATA_IPFS_GATEWAY_BASE).toContain('https://');
    expect(PINATA_IPFS_GATEWAY_BASE).toContain('ipfs/');
  });

  it('should have zero address', () => {
    expect(ZERO_ADDRESS).toBe('0x0000000000000000000000000000000000000000');
    expect(ZERO_ADDRESS.length).toBe(42);
  });

  it('should have seconds in a day', () => {
    expect(SECONDS_IN_A_DAY).toBe(86400);
  });
});