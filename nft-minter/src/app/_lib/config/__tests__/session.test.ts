/**
 * @jest-environment jsdom
 */

import { SessionOptions } from 'iron-session';

describe('Session Configuration', () => {
  let IRON_OPTIONS: SessionOptions;

  beforeEach(() => {
    // Clear module cache to test different env scenarios
    jest.resetModules();
    
    // Mock environment variable
    process.env.IRON_SESSION_PASSWORD = 'test_password_at_least_32_characters_long';
  });

  afterEach(() => {
    delete process.env.IRON_SESSION_PASSWORD;
  });

  it('should export IRON_OPTIONS with correct structure', () => {
    const { IRON_OPTIONS } = require('../session');

    expect(IRON_OPTIONS).toBeDefined();
    expect(typeof IRON_OPTIONS).toBe('object');
    expect(IRON_OPTIONS).toHaveProperty('cookieName');
    expect(IRON_OPTIONS).toHaveProperty('password');
    expect(IRON_OPTIONS).toHaveProperty('ttl');
    expect(IRON_OPTIONS).toHaveProperty('cookieOptions');
  });

  it('should have correct cookie name', () => {
    const { IRON_OPTIONS } = require('../session');

    expect(IRON_OPTIONS.cookieName).toBe('revoke_session');
  });

  it('should use environment password when available', () => {
    process.env.IRON_SESSION_PASSWORD = 'custom_environment_password_for_testing';
    const { IRON_OPTIONS } = require('../session');

    expect(IRON_OPTIONS.password).toBe('custom_environment_password_for_testing');
  });

  it('should use default password when environment variable is not set', () => {
    delete process.env.IRON_SESSION_PASSWORD;
    const { IRON_OPTIONS } = require('../session');

    expect(IRON_OPTIONS.password).toBe('complex_password_at_least_32_characters_long_for_security');
  });

  it('should have correct TTL (24 hours)', () => {
    const { IRON_OPTIONS } = require('../session');

    const expectedTTL = 60 * 60 * 24; // 24 hours in seconds
    expect(IRON_OPTIONS.ttl).toBe(expectedTTL);
  });

  it('should have secure cookie options', () => {
    const { IRON_OPTIONS } = require('../session');

    expect(IRON_OPTIONS.cookieOptions).toBeDefined();
    expect(IRON_OPTIONS.cookieOptions!.secure).toBe(true);
    expect(IRON_OPTIONS.cookieOptions!.sameSite).toBe('none');
  });

  it('should be compatible with SessionOptions interface', () => {
    const { IRON_OPTIONS } = require('../session');

    // Verify it has the required properties for SessionOptions
    expect(IRON_OPTIONS).toHaveProperty('cookieName');
    expect(IRON_OPTIONS).toHaveProperty('password');
    
    // Verify types
    expect(typeof IRON_OPTIONS.cookieName).toBe('string');
    expect(typeof IRON_OPTIONS.password).toBe('string');
    expect(typeof IRON_OPTIONS.ttl).toBe('number');
    expect(typeof IRON_OPTIONS.cookieOptions).toBe('object');
  });

  describe('Cookie Options', () => {
    it('should have secure flag enabled for production safety', () => {
      const { IRON_OPTIONS } = require('../session');

      expect(IRON_OPTIONS.cookieOptions!.secure).toBe(true);
    });

    it('should have sameSite set to none for cross-site compatibility', () => {
      const { IRON_OPTIONS } = require('../session');

      expect(IRON_OPTIONS.cookieOptions!.sameSite).toBe('none');
    });

    it('should not have httpOnly flag set explicitly', () => {
      const { IRON_OPTIONS } = require('../session');

      // Should not be explicitly set, allowing iron-session defaults
      expect(IRON_OPTIONS.cookieOptions!.httpOnly).toBeUndefined();
    });

    it('should not have domain restriction', () => {
      const { IRON_OPTIONS } = require('../session');

      expect(IRON_OPTIONS.cookieOptions!.domain).toBeUndefined();
    });
  });

  describe('Security Configuration', () => {
    it('should use a sufficiently long password', () => {
      const { IRON_OPTIONS } = require('../session');

      expect(IRON_OPTIONS.password.length).toBeGreaterThanOrEqual(32);
    });

    it('should have reasonable session timeout', () => {
      const { IRON_OPTIONS } = require('../session');

      const oneDayInSeconds = 24 * 60 * 60;
      expect(IRON_OPTIONS.ttl).toBe(oneDayInSeconds);
      expect(IRON_OPTIONS.ttl).toBeGreaterThan(0);
      expect(IRON_OPTIONS.ttl).toBeLessThanOrEqual(7 * 24 * 60 * 60); // Not more than 7 days
    });
  });

  describe('Environment Variable Handling', () => {
    it('should handle empty environment variable', () => {
      process.env.IRON_SESSION_PASSWORD = '';
      const { IRON_OPTIONS } = require('../session');

      expect(IRON_OPTIONS.password).toBe('complex_password_at_least_32_characters_long_for_security');
    });

    it('should handle undefined environment variable', () => {
      process.env.IRON_SESSION_PASSWORD = undefined;
      const { IRON_OPTIONS } = require('../session');

      expect(IRON_OPTIONS.password).toBe('complex_password_at_least_32_characters_long_for_security');
    });

    it('should handle whitespace-only environment variable', () => {
      process.env.IRON_SESSION_PASSWORD = '   ';
      const { IRON_OPTIONS } = require('../session');

      expect(IRON_OPTIONS.password).toBe('   ');
    });

    it('should use custom environment password when provided', () => {
      const customPassword = 'my_super_secure_password_for_sessions_that_is_very_long';
      process.env.IRON_SESSION_PASSWORD = customPassword;
      const { IRON_OPTIONS } = require('../session');

      expect(IRON_OPTIONS.password).toBe(customPassword);
    });
  });

  describe('Module Type Definitions', () => {
    it('should import SessionOptions type correctly', () => {
      const sessionModule = require('../session');
      
      expect(sessionModule).toHaveProperty('IRON_OPTIONS');
      expect(typeof sessionModule.IRON_OPTIONS).toBe('object');
    });

    it('should be a valid iron-session configuration', () => {
      const { IRON_OPTIONS } = require('../session');

      // Verify all required SessionOptions properties are present
      const requiredProperties = ['cookieName', 'password'];
      requiredProperties.forEach(prop => {
        expect(IRON_OPTIONS).toHaveProperty(prop);
        expect(IRON_OPTIONS[prop]).not.toBeNull();
        expect(IRON_OPTIONS[prop]).not.toBeUndefined();
      });
    });
  });

  describe('Production vs Development', () => {
    it('should have secure settings suitable for production', () => {
      const { IRON_OPTIONS } = require('../session');

      // Production-ready settings
      expect(IRON_OPTIONS.cookieOptions!.secure).toBe(true);
      expect(IRON_OPTIONS.cookieOptions!.sameSite).toBe('none');
      expect(typeof IRON_OPTIONS.password).toBe('string');
      expect(IRON_OPTIONS.password.length).toBeGreaterThanOrEqual(32);
    });

    it('should have note about local testing with Safari', () => {
      // This test ensures the comment in the original file is relevant
      const { IRON_OPTIONS } = require('../session');

      // secure: true might need to be false for local Safari testing
      expect(IRON_OPTIONS.cookieOptions!.secure).toBe(true);
    });
  });

  describe('Default Values', () => {
    it('should have sensible defaults for all options', () => {
      const { IRON_OPTIONS } = require('../session');

      expect(IRON_OPTIONS.cookieName).toBe('revoke_session');
      expect(IRON_OPTIONS.ttl).toBe(86400); // 24 hours
      expect(IRON_OPTIONS.cookieOptions!.secure).toBe(true);
      expect(IRON_OPTIONS.cookieOptions!.sameSite).toBe('none');
    });

    it('should not override other SessionOptions defaults unnecessarily', () => {
      const { IRON_OPTIONS } = require('../session');

      // Should not set properties that iron-session handles by default
      expect(IRON_OPTIONS.cookieOptions!.path).toBeUndefined();
      expect(IRON_OPTIONS.cookieOptions!.maxAge).toBeUndefined();
    });
  });
});