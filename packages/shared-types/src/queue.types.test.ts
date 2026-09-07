import { describe, it, expect } from "vitest";
import { isOfflineQueueEntry, isQueueItem } from "./queue.types";

describe("Queue Type Guards", () => {
  describe("isOfflineQueueEntry", () => {
    it("should return true for a valid OfflineQueueEntry", () => {
      const validEntry = {
        id: "entry-1",
        method: "POST",
        url: "/api/data",
        body: { key: "value" },
        timestamp: 1234567890,
        retryCount: 0,
      };
      expect(isOfflineQueueEntry(validEntry)).toBe(true);
    });

    it("should return true for valid methods", () => {
      const validMethods = ["POST", "PUT", "PATCH", "DELETE"];
      validMethods.forEach(method => {
        const entry = {
          id: "entry-1",
          method,
          url: "/api/data",
          timestamp: 1234567890,
          retryCount: 0,
        };
        expect(isOfflineQueueEntry(entry)).toBe(true);
      });
    });

    it("should return false for null or undefined", () => {
      expect(isOfflineQueueEntry(null)).toBe(false);
      expect(isOfflineQueueEntry(undefined)).toBe(false);
    });

    it("should return false for non-object types", () => {
      expect(isOfflineQueueEntry("string")).toBe(false);
      expect(isOfflineQueueEntry(123)).toBe(false);
      expect(isOfflineQueueEntry(true)).toBe(false);
    });

    it("should return false if id is missing or invalid", () => {
      const entry = {
        method: "POST",
        url: "/api/data",
        timestamp: 1234567890,
        retryCount: 0,
      };
      expect(isOfflineQueueEntry(entry)).toBe(false);
      expect(isOfflineQueueEntry({ ...entry, id: 123 })).toBe(false);
    });

    it("should return false if method is missing or invalid", () => {
      const entry = {
        id: "entry-1",
        url: "/api/data",
        timestamp: 1234567890,
        retryCount: 0,
      };
      expect(isOfflineQueueEntry(entry)).toBe(false);
      expect(isOfflineQueueEntry({ ...entry, method: "GET" })).toBe(false);
    });

    it("should return false if url is missing or invalid", () => {
      const entry = {
        id: "entry-1",
        method: "POST",
        timestamp: 1234567890,
        retryCount: 0,
      };
      expect(isOfflineQueueEntry(entry)).toBe(false);
      expect(isOfflineQueueEntry({ ...entry, url: 123 })).toBe(false);
    });

    it("should return false if timestamp is missing or invalid", () => {
      const entry = {
        id: "entry-1",
        method: "POST",
        url: "/api/data",
        retryCount: 0,
      };
      expect(isOfflineQueueEntry(entry)).toBe(false);
      expect(isOfflineQueueEntry({ ...entry, timestamp: "1234567890" })).toBe(false);
    });

    it("should return false if retryCount is missing or invalid", () => {
      const entry = {
        id: "entry-1",
        method: "POST",
        url: "/api/data",
        timestamp: 1234567890,
      };
      expect(isOfflineQueueEntry(entry)).toBe(false);
      expect(isOfflineQueueEntry({ ...entry, retryCount: "0" })).toBe(false);
    });
  });

  describe("isQueueItem", () => {
    it("should return true for a valid QueueItem", () => {
      const validItem = {
        id: "item-1",
        data: { key: "value" },
        status: "pending",
        createdAt: 1234567890,
        retryCount: 0,
        maxRetries: 3,
      };
      expect(isQueueItem(validItem)).toBe(true);
    });

    it("should return true for valid statuses", () => {
      const validStatuses = ["pending", "processing", "completed", "failed"];
      validStatuses.forEach(status => {
        const item = {
          id: "item-1",
          status,
          createdAt: 1234567890,
          retryCount: 0,
        };
        expect(isQueueItem(item)).toBe(true);
      });
    });

    it("should return false for null or undefined", () => {
      expect(isQueueItem(null)).toBe(false);
      expect(isQueueItem(undefined)).toBe(false);
    });

    it("should return false for non-object types", () => {
      expect(isQueueItem("string")).toBe(false);
      expect(isQueueItem(123)).toBe(false);
      expect(isQueueItem(true)).toBe(false);
    });

    it("should return false if id is missing or invalid", () => {
      const item = {
        status: "pending",
        createdAt: 1234567890,
        retryCount: 0,
      };
      expect(isQueueItem(item)).toBe(false);
      expect(isQueueItem({ ...item, id: 123 })).toBe(false);
    });

    it("should return false if status is missing or invalid", () => {
      const item = {
        id: "item-1",
        createdAt: 1234567890,
        retryCount: 0,
      };
      expect(isQueueItem(item)).toBe(false);
      expect(isQueueItem({ ...item, status: "invalid-status" })).toBe(false);
    });

    it("should return false if createdAt is missing or invalid", () => {
      const item = {
        id: "item-1",
        status: "pending",
        retryCount: 0,
      };
      expect(isQueueItem(item)).toBe(false);
      expect(isQueueItem({ ...item, createdAt: "1234567890" })).toBe(false);
    });

    it("should return false if retryCount is missing or invalid", () => {
      const item = {
        id: "item-1",
        status: "pending",
        createdAt: 1234567890,
      };
      expect(isQueueItem(item)).toBe(false);
      expect(isQueueItem({ ...item, retryCount: "0" })).toBe(false);
    });
  });
});
