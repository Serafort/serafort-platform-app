// @vitest-environment jsdom
import { describe, it, expect, beforeAll, vi } from "vitest";
import { globalWidgetRegistry } from "@cap/platform-core";
import {
  getApprovedWidgetIds,
  resolveGeneratedDsl,
  describeValidationFailure,
  validateWidgetDsl,
  APPROVED_WIDGETS,
} from "../agents/ValidationAgent";
import { buildGeneratePayload } from "../agents/pipeline";
import type { WidgetDefinition } from "@cap/shared-types";

/**
 * The real store persists through an encrypted storage adapter, so writing to
 * it from a test throws "VITE_STORAGE_ENCRYPTION_KEY is not defined". The
 * payload builder only reads three fields; a plain object is a truer unit
 * boundary than standing the whole store up.
 */
const storeState: Record<string, unknown> = {
  user: null,
  selectedProvider: "openrouter",
  selectedModel: "openai/gpt-4o-mini",
};

vi.mock("@cap/platform-store", () => ({
  useAppStore: Object.assign(() => storeState, {
    getState: () => storeState,
    setState: (patch: Record<string, unknown>) =>
      Object.assign(storeState, patch),
  }),
}));

/**
 * The engine's correctness rules, as opposed to the pure helpers covered in
 * widgetStudio.test.ts. Everything here is about one question: can a widget
 * definition that cannot be rendered - or should not be - reach the store?
 */

const REGISTERED_ID = "dashboard-widget-revenueChart";

const validDsl = (): Partial<WidgetDefinition> => ({
  component: REGISTERED_ID,
  layout: { width: 4, height: 280 },
  props: { title: "Revenue" },
});

beforeAll(() => {
  // The registry is a module singleton; giving it a known entry makes
  // getApprovedWidgetIds() take its real path rather than the fallback.
  globalWidgetRegistry.register({
    id: REGISTERED_ID,
    titleKey: "test.revenue",
    Component: (() => null) as never,
  });
});

describe("approved components come from the registry", () => {
  it("uses what is registered, not a hand-copied list", () => {
    const ids = getApprovedWidgetIds();
    expect(ids).toContain(REGISTERED_ID);
    // The static catalogue named six widgets while the running app registers
    // fourteen. Anything registered is renderable and must be accepted.
    expect(ids).toEqual(globalWidgetRegistry.getAll().map((d) => d.id));
  });

  it("falls back to the static catalogue when nothing has registered", () => {
    // An empty registry must not mean "reject everything" - that is the state
    // in unit tests and during SSR.
    const ids = validateWidgetDsl(
      { ...validDsl(), id: "x", name: "x", version: "1.0.0" },
      APPROVED_WIDGETS.map((w) => w.id),
    );
    expect(ids.componentErrors).toEqual([]);
  });
});

describe("resolveGeneratedDsl", () => {
  it("fills in the bookkeeping fields it is entitled to fill in", () => {
    const { dsl, validation } = resolveGeneratedDsl(validDsl(), {
      fallbackName: "Revenue by region",
    });

    expect(validation.isValid).toBe(true);
    expect(dsl.id).toBeTruthy();
    expect(dsl.name).toBe("Revenue by region");
    expect(dsl.version).toBe("1.0.0");
  });

  it("keeps the model's own id, name and version when it supplies them", () => {
    const { dsl } = resolveGeneratedDsl({
      ...validDsl(),
      id: "widget-abc",
      name: "Quarterly revenue",
      version: "2.1.0",
    });

    expect(dsl.id).toBe("widget-abc");
    expect(dsl.name).toBe("Quarterly revenue");
    expect(dsl.version).toBe("2.1.0");
  });

  it("rejects a component that is not registered", () => {
    // Nothing else catches this: sanitizeWidgetDsl passes an unknown component
    // straight through - it only substitutes "core-dynamic-layout" for one
    // that is missing entirely - so before the gate ran, a DSL naming a
    // component that does not exist was stored and handed to the renderer.
    const { dsl, validation } = resolveGeneratedDsl({
      ...validDsl(),
      component: "dashboard-widget-doesNotExist",
    });

    expect(validation.isValid).toBe(false);
    expect(validation.componentErrors.join(" ")).toContain(
      "dashboard-widget-doesNotExist",
    );
    expect(dsl.component).toBe("dashboard-widget-doesNotExist");
  });

  it("still rejects a DSL with no component at all", () => {
    // Here the sanitiser does substitute "core-dynamic-layout", which is why
    // validation has to run on the prepared object rather than the sanitised
    // one: afterwards there is nothing left to fail on.
    const { validation } = resolveGeneratedDsl({
      layout: { width: 4, height: 280 },
    });

    expect(validation.isValid).toBe(false);
    expect(validation.schemaErrors.join(" ")).toContain("component");
  });

  it("rejects a missing layout rather than inventing 8 x 280", () => {
    const { validation } = resolveGeneratedDsl({
      component: REGISTERED_ID,
      props: {},
    });

    expect(validation.isValid).toBe(false);
    expect(validation.schemaErrors.join(" ")).toContain("layout");
  });

  it("rejects a layout that is not on the grid", () => {
    const { validation } = resolveGeneratedDsl({
      ...validDsl(),
      layout: { width: 5, height: 999 } as never,
    });

    expect(validation.isValid).toBe(false);
    expect(validation.schemaErrors.join(" ")).toContain("layout.width");
    expect(validation.schemaErrors.join(" ")).toContain("layout.height");
  });

  it("rejects a version that is not SemVer", () => {
    const { validation } = resolveGeneratedDsl({
      ...validDsl(),
      version: "v1",
    });

    expect(validation.isValid).toBe(false);
    expect(validation.schemaErrors.join(" ")).toContain("SemVer");
  });

  it("catches an injected handler in props", () => {
    const { dsl, validation } = resolveGeneratedDsl({
      ...validDsl(),
      props: { onClick: "javascript:alert(1)" },
    });

    expect(validation.isValid).toBe(false);
    expect(validation.securityErrors.length).toBeGreaterThan(0);
    // And the sanitiser has still stripped it from the object itself.
    expect(JSON.stringify(dsl)).not.toContain("javascript:");
  });

  it("survives a non-object payload", () => {
    for (const raw of [null, undefined, "nope", 42]) {
      const { validation } = resolveGeneratedDsl(raw);
      expect(validation.isValid).toBe(false);
    }
  });
});

describe("describeValidationFailure", () => {
  it("leads with the failure and counts the rest", () => {
    const summary = describeValidationFailure({
      isValid: false,
      schemaErrors: ["Missing required field: \"layout\""],
      securityErrors: ["Dangerous pattern detected: eval\\s*\\("],
      componentErrors: [],
      tenantErrors: [],
    });

    // Security first: it is the one a reader must not miss.
    expect(summary).toContain("Dangerous pattern");
    expect(summary).toContain("+1 more");
  });

  it("says something even when the shape carries no messages", () => {
    expect(
      describeValidationFailure({
        isValid: false,
        schemaErrors: [],
        securityErrors: [],
        componentErrors: [],
        tenantErrors: [],
      }),
    ).toBe("Validation failed");
  });
});

describe("buildGeneratePayload", () => {
  it("does not invent a user id", () => {
    // Two of the three former call sites sent `userId: 1` under a comment
    // saying the server resolves the caller from the auth token. A fabricated
    // id in an audit trail is worse than no id.
    storeState.user = null;
    const payload = buildGeneratePayload({ draftId: "d1", prompt: "a chart" });

    expect(payload).not.toHaveProperty("userId");
  });

  it("sends the signed-in user's id when there is one", () => {
    storeState.user = { id: 42, email: "a@b.c", user: null, tokens: null };
    const payload = buildGeneratePayload({ draftId: "d1", prompt: "a chart" });

    expect(payload.userId).toBe(42);
  });

  it("takes the provider and model from the store, with no literal fallback", () => {
    // The old paths disagreed: one defaulted providerType to the string
    // "gemini", another to the store's selection, so which provider ran
    // depended on which entry point you came through.
    storeState.user = null;
    storeState.selectedProvider = "openrouter";
    storeState.selectedModel = "openai/gpt-4o-mini";

    const payload = buildGeneratePayload({ draftId: "d1", prompt: "a chart" });
    expect(payload.providerType).toBe("openrouter");
    expect(payload.model).toBe("openai/gpt-4o-mini");

    const overridden = buildGeneratePayload({
      draftId: "d1",
      prompt: "a chart",
      providerType: "gemini",
      model: "gemini-3.6-flash",
    });
    expect(overridden.providerType).toBe("gemini");
    expect(overridden.model).toBe("gemini-3.6-flash");
  });

  it("defaults the target page and always runs async", () => {
    const payload = buildGeneratePayload({ draftId: "d1", prompt: "a chart" });
    expect(payload.pageId).toBe("dashboard");
    expect(payload.runAsync).toBe(true);
    expect(payload.autoPublish).toBe(false);
  });
});
