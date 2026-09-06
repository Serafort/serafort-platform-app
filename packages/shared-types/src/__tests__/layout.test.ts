import { describe, it, expect } from "vitest";
import {
  isWidgetNode,
  getWidgetIdFromSlotValue,
  getSubLayoutFromSlotValue,
  createWidgetNode,
} from "../layout";

describe("Layout helpers", () => {
  describe("isWidgetNode", () => {
    it("should return true for valid WidgetNode objects", () => {
      expect(isWidgetNode({ widgetId: "test-widget" })).toBe(true);
      expect(isWidgetNode({ widgetId: "test-widget", title: "Test" })).toBe(true);
    });

    it("should return false for string values (WidgetId)", () => {
      expect(isWidgetNode("test-widget")).toBe(false);
    });

    it("should return false for null or undefined", () => {
      expect(isWidgetNode(null as any)).toBe(false);
      expect(isWidgetNode(undefined)).toBe(false);
    });

    it("should return false for objects without widgetId", () => {
      expect(isWidgetNode({ id: "123" } as any)).toBe(false);
      expect(isWidgetNode({} as any)).toBe(false);
    });

    it("should return false for other primitive types", () => {
      expect(isWidgetNode(123 as any)).toBe(false);
      expect(isWidgetNode(true as any)).toBe(false);
      expect(isWidgetNode([] as any)).toBe(false);
    });
  });

  describe("getWidgetIdFromSlotValue", () => {
    it("should return undefined for falsy values", () => {
      expect(getWidgetIdFromSlotValue(undefined)).toBeUndefined();
      expect(getWidgetIdFromSlotValue(null as any)).toBeUndefined();
    });

    it("should return the string itself if the value is a string (WidgetId)", () => {
      expect(getWidgetIdFromSlotValue("test-widget-id")).toBe("test-widget-id");
    });

    it("should return widgetId property if the value is a WidgetNode", () => {
      expect(
        getWidgetIdFromSlotValue({ widgetId: "node-widget-id", title: "Title" })
      ).toBe("node-widget-id");
    });
  });

  describe("getSubLayoutFromSlotValue", () => {
    it("should return undefined if the value is not a WidgetNode", () => {
      expect(getSubLayoutFromSlotValue("test-widget-id")).toBeUndefined();
      expect(getSubLayoutFromSlotValue(undefined)).toBeUndefined();
    });

    it("should return undefined if the WidgetNode does not have a subLayout", () => {
      expect(
        getSubLayoutFromSlotValue({ widgetId: "node-widget-id" })
      ).toBeUndefined();
    });

    it("should return the subLayout if the WidgetNode has one", () => {
      const mockSubLayout = { slots: [], slotWidgets: {} };
      expect(
        getSubLayoutFromSlotValue({
          widgetId: "node-widget-id",
          subLayout: mockSubLayout,
        })
      ).toBe(mockSubLayout);
    });
  });

  describe("createWidgetNode", () => {
    it("should create a basic WidgetNode with only widgetId", () => {
      const result = createWidgetNode("test-widget-id");
      expect(result).toEqual({ widgetId: "test-widget-id" });
    });

    it("should create a WidgetNode with additional options", () => {
      const options = {
        title: "Test Title",
        config: { foo: "bar" },
        size: { span: 4 as const, height: 200 as const },
      };
      const result = createWidgetNode("test-widget-id", options);
      expect(result).toEqual({
        widgetId: "test-widget-id",
        title: "Test Title",
        config: { foo: "bar" },
        size: { span: 4, height: 200 },
      });
    });

    it("should allow creating a WidgetNode with a subLayout", () => {
      const mockSubLayout = { slots: ["slot1"], slotWidgets: {} };
      const result = createWidgetNode("test-widget-id", {
        subLayout: mockSubLayout,
      });
      expect(result).toEqual({
        widgetId: "test-widget-id",
        subLayout: mockSubLayout,
      });
    });
  });
});
