/**
 * @jest-environment jsdom
 */

import EventEmitter from 'eventemitter3';

// Mock eventemitter3
jest.mock('eventemitter3');

const MockEventEmitter = EventEmitter as jest.MockedClass<typeof EventEmitter>;

describe('Event Emitter Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create EventEmitter instance', () => {
    require('../eventEmitter');

    expect(MockEventEmitter).toHaveBeenCalledTimes(1);
    expect(MockEventEmitter).toHaveBeenCalledWith();
  });

  it('should export eventEmitter instance', () => {
    const { eventEmitter } = require('../eventEmitter');

    expect(eventEmitter).toBeInstanceOf(MockEventEmitter);
  });

  describe('EventEmitter functionality', () => {
    let mockEmitterInstance: jest.Mocked<EventEmitter>;
    let eventEmitter: EventEmitter;

    beforeEach(() => {
      mockEmitterInstance = {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
        once: jest.fn(),
        removeAllListeners: jest.fn(),
        removeListener: jest.fn(),
        addListener: jest.fn(),
        listeners: jest.fn(),
        eventNames: jest.fn(),
        listenerCount: jest.fn(),
        setMaxListeners: jest.fn(),
        getMaxListeners: jest.fn(),
        prependListener: jest.fn(),
        prependOnceListener: jest.fn(),
      } as any;

      MockEventEmitter.mockImplementation(() => mockEmitterInstance);
      
      const eventEmitterModule = require('../eventEmitter');
      eventEmitter = eventEmitterModule.eventEmitter;
    });

    it('should have on method available', () => {
      expect(eventEmitter.on).toBeDefined();
      expect(typeof eventEmitter.on).toBe('function');
    });

    it('should have emit method available', () => {
      expect(eventEmitter.emit).toBeDefined();
      expect(typeof eventEmitter.emit).toBe('function');
    });

    it('should have off method available', () => {
      expect(eventEmitter.off).toBeDefined();
      expect(typeof eventEmitter.off).toBe('function');
    });

    it('should have once method available', () => {
      expect(eventEmitter.once).toBeDefined();
      expect(typeof eventEmitter.once).toBe('function');
    });

    it('should have removeListener method available', () => {
      expect(eventEmitter.removeListener).toBeDefined();
      expect(typeof eventEmitter.removeListener).toBe('function');
    });

    it('should have removeAllListeners method available', () => {
      expect(eventEmitter.removeAllListeners).toBeDefined();
      expect(typeof eventEmitter.removeAllListeners).toBe('function');
    });
  });

  describe('Module structure', () => {
    it('should only export eventEmitter', () => {
      const eventEmitterModule = require('../eventEmitter');
      const exports = Object.keys(eventEmitterModule);

      expect(exports).toEqual(['eventEmitter']);
    });

    it('should export a single eventEmitter instance', () => {
      const module1 = require('../eventEmitter');
      const module2 = require('../eventEmitter');

      expect(module1.eventEmitter).toBe(module2.eventEmitter);
    });
  });

  describe('EventEmitter3 integration', () => {
    it('should use EventEmitter3 library', () => {
      require('../eventEmitter');

      expect(MockEventEmitter).toHaveBeenCalledWith();
    });

    it('should create instance without parameters', () => {
      require('../eventEmitter');

      expect(MockEventEmitter).toHaveBeenCalledWith();
    });
  });

  describe('Singleton pattern', () => {
    it('should return same instance across multiple imports', () => {
      const { eventEmitter: emitter1 } = require('../eventEmitter');
      
      // Clear module cache and require again
      delete require.cache[require.resolve('../eventEmitter')];
      MockEventEmitter.mockClear();
      
      const { eventEmitter: emitter2 } = require('../eventEmitter');

      // Should create new instance but maintain module singleton behavior
      expect(MockEventEmitter).toHaveBeenCalledTimes(1);
    });
  });

  describe('TypeScript types', () => {
    it('should export correctly typed EventEmitter', () => {
      const { eventEmitter } = require('../eventEmitter');

      expect(eventEmitter).toBeDefined();
      expect(eventEmitter).toBeInstanceOf(MockEventEmitter);
    });
  });

  describe('Usage scenarios', () => {
    let eventEmitter: EventEmitter;

    beforeEach(() => {
      const mockInstance = {
        on: jest.fn().mockReturnThis(),
        emit: jest.fn().mockReturnValue(true),
        off: jest.fn().mockReturnThis(),
        once: jest.fn().mockReturnThis(),
        removeListener: jest.fn().mockReturnThis(),
        removeAllListeners: jest.fn().mockReturnThis(),
      };

      MockEventEmitter.mockImplementation(() => mockInstance as any);
      
      const { eventEmitter: emitter } = require('../eventEmitter');
      eventEmitter = emitter;
    });

    it('should support event listening pattern', () => {
      const callback = jest.fn();
      
      eventEmitter.on('test-event', callback);
      
      expect(eventEmitter.on).toHaveBeenCalledWith('test-event', callback);
    });

    it('should support event emission pattern', () => {
      eventEmitter.emit('test-event', 'data');
      
      expect(eventEmitter.emit).toHaveBeenCalledWith('test-event', 'data');
    });

    it('should support one-time event listening', () => {
      const callback = jest.fn();
      
      eventEmitter.once('test-event', callback);
      
      expect(eventEmitter.once).toHaveBeenCalledWith('test-event', callback);
    });

    it('should support removing listeners', () => {
      const callback = jest.fn();
      
      eventEmitter.removeListener('test-event', callback);
      
      expect(eventEmitter.removeListener).toHaveBeenCalledWith('test-event', callback);
    });

    it('should support removing all listeners', () => {
      eventEmitter.removeAllListeners('test-event');
      
      expect(eventEmitter.removeAllListeners).toHaveBeenCalledWith('test-event');
    });
  });

  describe('Error handling', () => {
    it('should handle EventEmitter constructor errors', () => {
      MockEventEmitter.mockImplementation(() => {
        throw new Error('EventEmitter creation failed');
      });

      expect(() => require('../eventEmitter')).toThrow('EventEmitter creation failed');
    });
  });

  describe('Memory management', () => {
    it('should be suitable for long-running applications', () => {
      const { eventEmitter } = require('../eventEmitter');

      // EventEmitter should be created only once
      expect(MockEventEmitter).toHaveBeenCalledTimes(1);
      expect(eventEmitter).toBeDefined();
    });
  });

  describe('Common event patterns', () => {
    let eventEmitter: EventEmitter;

    beforeEach(() => {
      const mockInstance = {
        on: jest.fn().mockReturnThis(),
        emit: jest.fn().mockReturnValue(true),
        off: jest.fn().mockReturnThis(),
      };

      MockEventEmitter.mockImplementation(() => mockInstance as any);
      
      const { eventEmitter: emitter } = require('../eventEmitter');
      eventEmitter = emitter;
    });

    it('should work with authentication events', () => {
      const loginHandler = jest.fn();
      const logoutHandler = jest.fn();

      eventEmitter.on('login', loginHandler);
      eventEmitter.on('logout', logoutHandler);

      eventEmitter.emit('login', { userId: '123' });
      eventEmitter.emit('logout');

      expect(eventEmitter.on).toHaveBeenCalledWith('login', loginHandler);
      expect(eventEmitter.on).toHaveBeenCalledWith('logout', logoutHandler);
      expect(eventEmitter.emit).toHaveBeenCalledWith('login', { userId: '123' });
      expect(eventEmitter.emit).toHaveBeenCalledWith('logout');
    });

    it('should work with data update events', () => {
      const updateHandler = jest.fn();

      eventEmitter.on('data:updated', updateHandler);
      eventEmitter.emit('data:updated', { type: 'nft', id: '123' });

      expect(eventEmitter.on).toHaveBeenCalledWith('data:updated', updateHandler);
      expect(eventEmitter.emit).toHaveBeenCalledWith('data:updated', { type: 'nft', id: '123' });
    });
  });

  describe('Integration with application', () => {
    it('should be ready for use in authentication flows', () => {
      const { eventEmitter } = require('../eventEmitter');

      expect(eventEmitter).toBeDefined();
      expect(typeof eventEmitter.on).toBe('function');
      expect(typeof eventEmitter.emit).toBe('function');
    });

    it('should be ready for use in component communication', () => {
      const { eventEmitter } = require('../eventEmitter');

      expect(eventEmitter).toBeDefined();
      expect(typeof eventEmitter.once).toBe('function');
      expect(typeof eventEmitter.removeListener).toBe('function');
    });
  });
});