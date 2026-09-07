import { describe, it, expect } from "vitest";
import { isWidgetNode, getWidgetIdFromSlotValue, type WidgetNode } from "../layout";

describe("layout.ts type guards and helpers", () => {
  describe("isWidgetNode", () => {
    it("should return false for undefined", () => {
      expect(isWidgetNode(undefined)).toBe(false);
    });

    it("should return false for null", () => {
      // @ts-expect-error Testing invalid runtime input
      expect(isWidgetNode(null)).toBe(false);
    });

    it("should return false for primitive string", () => {
      expect(isWidgetNode("some-widget-id")).toBe(false);
    });

    it("should return false for an empty object", () => {
      // @ts-expect-error Testing invalid runtime input
      expect(isWidgetNode({})).toBe(false);
    });

    it("should return false for an object without widgetId", () => {
      // @ts-expect-error Testing invalid runtime input
      expect(isWidgetNode({ id: "123", title: "Test" })).toBe(false);
    });

    it("should return true for a valid WidgetNode object", () => {
      const validNode: WidgetNode = { widgetId: "my-widget" };
      expect(isWidgetNode(validNode)).toBe(true);
    });
  });

  describe("getWidgetIdFromSlotValue", () => {
    it("should return undefined for undefined", () => {
      expect(getWidgetIdFromSlotValue(undefined)).toBe(undefined);
    });

    it("should return the string itself if a primitive string is passed", () => {
      expect(getWidgetIdFromSlotValue("simple-widget-id")).toBe("simple-widget-id");
    });

    it("should return the widgetId property if a WidgetNode object is passed", () => {
      const validNode: WidgetNode = { widgetId: "complex-widget-id" };
      expect(getWidgetIdFromSlotValue(validNode)).toBe("complex-widget-id");
    });
  });
});
