import { describe, it, expect } from 'vitest';
import { isOfflineQueueEntry, QueueHttpMethod } from '../queue.types';

describe('isOfflineQueueEntry', () => {
  it('should return true for a valid OfflineQueueEntry', () => {
    const validEntry = {
      id: '123',
      method: 'POST' as QueueHttpMethod,
      url: '/api/data',
      body: { key: 'value' },
      timestamp: 1620000000000,
      retryCount: 0,
    };
    expect(isOfflineQueueEntry(validEntry)).toBe(true);
  });

  it('should return false for null or undefined', () => {
    expect(isOfflineQueueEntry(null)).toBe(false);
    expect(isOfflineQueueEntry(undefined)).toBe(false);
  });

  it('should return false for primitive types', () => {
    expect(isOfflineQueueEntry('string')).toBe(false);
    expect(isOfflineQueueEntry(123)).toBe(false);
    expect(isOfflineQueueEntry(true)).toBe(false);
  });

  it('should return false if id is missing or not a string', () => {
    const entry = {
      method: 'POST',
      url: '/api/data',
      timestamp: 1620000000000,
      retryCount: 0,
    };
    expect(isOfflineQueueEntry(entry)).toBe(false);
    expect(isOfflineQueueEntry({ ...entry, id: 123 })).toBe(false);
  });

  it('should return false if method is invalid', () => {
    const entry = {
      id: '123',
      url: '/api/data',
      timestamp: 1620000000000,
      retryCount: 0,
    };
    expect(isOfflineQueueEntry({ ...entry, method: 'GET' })).toBe(false);
    expect(isOfflineQueueEntry({ ...entry, method: 123 })).toBe(false);
    expect(isOfflineQueueEntry(entry)).toBe(false);
  });

  it('should return false if url is missing or not a string', () => {
    const entry = {
      id: '123',
      method: 'POST',
      timestamp: 1620000000000,
      retryCount: 0,
    };
    expect(isOfflineQueueEntry(entry)).toBe(false);
    expect(isOfflineQueueEntry({ ...entry, url: 123 })).toBe(false);
  });

  it('should return false if timestamp is missing or not a number', () => {
    const entry = {
      id: '123',
      method: 'POST',
      url: '/api/data',
      retryCount: 0,
    };
    expect(isOfflineQueueEntry(entry)).toBe(false);
    expect(isOfflineQueueEntry({ ...entry, timestamp: '1620000000000' })).toBe(false);
  });

  it('should return false if retryCount is missing or not a number', () => {
    const entry = {
      id: '123',
      method: 'POST',
      url: '/api/data',
      timestamp: 1620000000000,
    };
    expect(isOfflineQueueEntry(entry)).toBe(false);
    expect(isOfflineQueueEntry({ ...entry, retryCount: '0' })).toBe(false);
  });
});
