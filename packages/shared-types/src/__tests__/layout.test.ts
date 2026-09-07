import { describe, it, expect } from "vitest";
import { isWidgetNode, getWidgetIdFromSlotValue } from "../layout";
import type { WidgetNode } from "../layout";

describe("layout helpers", () => {
  describe("isWidgetNode", () => {
    it("should return true for a valid WidgetNode", () => {
      const node: WidgetNode = { widgetId: "test-widget" };
      expect(isWidgetNode(node)).toBe(true);
    });

    it("should return true for a valid WidgetNode with extra properties", () => {
      const node: WidgetNode = { widgetId: "test-widget", title: "Test Widget" };
      expect(isWidgetNode(node)).toBe(true);
    });

    it("should return false for a string", () => {
      expect(isWidgetNode("test-widget")).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isWidgetNode(undefined)).toBe(false);
    });

    it("should return false for null", () => {
      // @ts-expect-error Testing invalid input
      expect(isWidgetNode(null)).toBe(false);
    });

    it("should return false for an object without widgetId", () => {
      // @ts-expect-error Testing invalid input
      expect(isWidgetNode({ someProp: "value" })).toBe(false);
    });
  });

  describe("getWidgetIdFromSlotValue", () => {
    it("should extract widgetId from a WidgetNode", () => {
      const node: WidgetNode = { widgetId: "test-widget", title: "Test" };
      expect(getWidgetIdFromSlotValue(node)).toBe("test-widget");
    });

    it("should return the string if passed a string", () => {
      expect(getWidgetIdFromSlotValue("test-widget")).toBe("test-widget");
    });

    it("should return undefined if passed undefined", () => {
      expect(getWidgetIdFromSlotValue(undefined)).toBeUndefined();
    });
  });
});
