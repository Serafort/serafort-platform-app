// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { globalWidgetRegistry } from "@cap/platform-core";
import type { WidgetDefinition } from "@cap/shared-types";

const storeState: Record<string, unknown> = {
  user: null,
  selectedProvider: "gemini",
  selectedModel: "gemini-3.6-flash",
};

vi.mock("@cap/platform-store", () => ({
  useAppStore: Object.assign(() => storeState, {
    getState: () => storeState,
  }),
}));

import {
  DSL_SCHEMA_VERSION,
  migrateWidgetDsl,
  stampSchemaVersion,
} from "../agents/dslSchema";
import {
  adoptServerAuditEntries,
  buildClientAuditEntry,
  isAttestedTrail,
  resolveActor,
} from "../agents/auditTrail";
import {
  applyStructuralRefinement,
  buildRefinementPrompt,
  buildRefinementRequest,
  detectStructuralIntent,
} from "../agents/refineDraft";
import { resolveGeneratedDsl } from "../agents/ValidationAgent";

const REGISTERED_ID = "dashboard-widget-revenueChart";

const dsl = (over: Partial<WidgetDefinition> = {}): WidgetDefinition =>
  ({
    id: "widget-1",
    name: "Revenue",
    version: "1.0.0",
    component: REGISTERED_ID,
    layout: { width: 4, height: 280 },
    props: {},
    ...over,
  }) as WidgetDefinition;

beforeEach(() => {
  globalWidgetRegistry.register({
    id: REGISTERED_ID,
    titleKey: "test.revenue",
    Component: (() => null) as never,
  });
  storeState.user = null;
  storeState.selectedModel = "gemini-3.6-flash";
});

describe("schema versioning", () => {
  it("treats a definition with no schemaVersion as the pre-versioning shape", () => {
    const { from, migrated } = migrateWidgetDsl(dsl());
    expect(from).toBe(1);
    expect(migrated).toBe(true);
  });

  it("stamps the current version once migrated", () => {
    const { dsl: out } = migrateWidgetDsl(dsl());
    expect(out.schemaVersion).toBe(DSL_SCHEMA_VERSION);
  });

  it("leaves a current record alone", () => {
    const current = stampSchemaVersion(dsl());
    const { migrated, from } = migrateWidgetDsl(current);
    expect(migrated).toBe(false);
    expect(from).toBe(DSL_SCHEMA_VERSION);
  });

  it("does not mangle a record written by a newer build", () => {
    // Downgrading is not this function's job; a future shape passes through.
    const future = { ...dsl(), schemaVersion: 99, somethingNew: true };
    const { dsl: out, migrated } = migrateWidgetDsl(future);
    expect(migrated).toBe(false);
    expect((out as unknown as Record<string, unknown>).somethingNew).toBe(true);
  });

  it("drops behaviour keys the schema does not declare", () => {
    const { dsl: out } = migrateWidgetDsl({
      ...dsl(),
      behavior: { autoRefresh: true, interactive: false, legacyFlag: "x" },
    });
    expect(out.behavior).toEqual({ autoRefresh: true, interactive: false });
  });

  it("coerces a refresh interval stored as a string", () => {
    const { dsl: out } = migrateWidgetDsl({
      ...dsl(),
      behavior: { autoRefresh: true, refreshInterval: "30" },
    });
    expect(out.behavior?.refreshInterval).toBe(30);
  });

  it("drops a refresh interval that is not a number at all", () => {
    const { dsl: out } = migrateWidgetDsl({
      ...dsl(),
      behavior: { refreshInterval: "soon" },
    });
    expect(out.behavior?.refreshInterval).toBeUndefined();
  });

  it("survives a non-object record", () => {
    expect(() => migrateWidgetDsl(null)).not.toThrow();
    expect(() => migrateWidgetDsl("nope")).not.toThrow();
  });
});

describe("data source binding", () => {
  it("accepts a provider the platform serves", () => {
    const { validation } = resolveGeneratedDsl(
      dsl({ dataSource: { provider: "rest", config: { path: "/x" } } }),
    );
    expect(validation.isValid).toBe(true);
  });

  it("carries the binding through instead of dropping it", () => {
    // The sanitiser predates dataSource and keeps only the keys it knows.
    const { dsl: out } = resolveGeneratedDsl(
      dsl({ dataSource: { provider: "rest" } }),
    );
    expect(out.dataSource?.provider).toBe("rest");
  });

  it("rejects a provider that does not exist", () => {
    const { validation } = resolveGeneratedDsl(
      dsl({ dataSource: { provider: "definitely-not-a-provider" } }),
    );
    expect(validation.isValid).toBe(false);
    expect(validation.componentErrors.join(" ")).toContain(
      "definitely-not-a-provider",
    );
  });

  it("rejects a binding with no provider", () => {
    const { validation } = resolveGeneratedDsl(
      dsl({ dataSource: { provider: "" } }),
    );
    expect(validation.isValid).toBe(false);
  });

  it("rejects a config that is not an object", () => {
    const { validation } = resolveGeneratedDsl(
      dsl({ dataSource: { provider: "rest", config: "oops" } } as never),
    );
    expect(validation.isValid).toBe(false);
    expect(validation.schemaErrors.join(" ")).toContain("dataSource.config");
  });
});

describe("audit entries", () => {
  it("says unknown rather than inventing an actor", () => {
    expect(resolveActor()).toBe("unknown");
    const entry = buildClientAuditEntry({ dsl: dsl(), action: "published" });
    // "current-user" read like a real identity and was not one.
    expect(entry.createdBy).toBe("unknown");
    expect(entry.createdBy).not.toBe("current-user");
  });

  it("uses the signed-in user when there is one", () => {
    storeState.user = { id: 7, email: "a@b.c", user: null, tokens: null };
    expect(buildClientAuditEntry({ dsl: dsl(), action: "published" }).createdBy).toBe(
      "7",
    );
  });

  it("records the model that was actually selected", () => {
    // The old default named gemini-2.0-flash, which the store never selects.
    const entry = buildClientAuditEntry({ dsl: dsl(), action: "published" });
    expect(entry.model).toBe("gemini-3.6-flash");

    storeState.selectedModel = undefined;
    expect(
      buildClientAuditEntry({ dsl: dsl(), action: "published" }).model,
    ).toBe("unknown");
  });

  it("marks its own entries as client-written", () => {
    expect(
      buildClientAuditEntry({ dsl: dsl(), action: "published" }).source,
    ).toBe("client");
  });

  it("adopts server entries without lending them local identity", () => {
    storeState.user = { id: 7, email: "a@b.c", user: null, tokens: null };
    const [entry] = adoptServerAuditEntries(
      [{ widgetId: "w1", createdBy: "42", action: "published" }],
      { runId: 9 },
    );

    expect(entry.source).toBe("server");
    expect(entry.createdBy).toBe("42");
    expect(entry.runId).toBe(9);
  });

  it("discards an entry with nothing to attach it to", () => {
    expect(adoptServerAuditEntries([{ createdBy: "42" }])).toEqual([]);
    expect(adoptServerAuditEntries(null)).toEqual([]);
  });

  it("only calls a trail attested when every entry came from the server", () => {
    const client = buildClientAuditEntry({ dsl: dsl(), action: "published" });
    const [server] = adoptServerAuditEntries([{ widgetId: "w1" }]);

    expect(isAttestedTrail([server])).toBe(true);
    expect(isAttestedTrail([server, client])).toBe(false);
    expect(isAttestedTrail([])).toBe(false);
  });
});

describe("refining a draft", () => {
  it("recognises the size asks", () => {
    expect(detectStructuralIntent("wider")).toBe("wider");
    expect(detectStructuralIntent("Make it taller")).toBe("taller");
    expect(detectStructuralIntent("full width")).toBe("full-width");
    expect(detectStructuralIntent("make it compact.")).toBe("compact");
  });

  it("sends anything else to the model", () => {
    expect(detectStructuralIntent("show the last 12 months")).toBeNull();
    // A compound ask goes to the model, which can honour both halves.
    expect(detectStructuralIntent("make it wider and add a total")).toBeNull();
  });

  it("steps up the grid one stop at a time", () => {
    const { dsl: wider } = applyStructuralRefinement(dsl(), "wider");
    expect(wider?.layout.width).toBe(8);

    const { dsl: widest } = applyStructuralRefinement(
      dsl({ layout: { width: 8, height: 280 } }),
      "wider",
    );
    expect(widest?.layout.width).toBe(12);
  });

  it("says so rather than pretending when there is nowhere left to go", () => {
    const result = applyStructuralRefinement(
      dsl({ layout: { width: 12, height: 280 } }),
      "wider",
    );
    expect(result.changed).toBe(false);
    expect(result.dsl).toBeNull();
  });

  it("puts a locally-built definition through the same gate", () => {
    // A definition this module assembled is still a definition.
    const result = applyStructuralRefinement(
      dsl({ component: "not-registered" }),
      "wider",
    );
    expect(result.dsl).toBeNull();
    expect(result.error).toContain("not-registered");
  });

  it("keeps everything the ask did not mention", () => {
    const { dsl: taller } = applyStructuralRefinement(
      dsl({ props: { title: "Revenue" }, name: "Quarterly" }),
      "taller",
    );
    expect(taller?.props).toEqual({ title: "Revenue" });
    expect(taller?.name).toBe("Quarterly");
    expect(taller?.layout.height).toBe(340);
  });

  it("asks the model to revise rather than start over", () => {
    const prompt = buildRefinementPrompt(
      "A revenue chart",
      "show the last 12 months",
    );
    expect(prompt).toContain("A revenue chart");
    expect(prompt).toContain("Revise the widget above");
  });

  it("seeds a refinement run with the definition being edited", () => {
    const request = buildRefinementRequest({
      originalPrompt: "A revenue chart",
      instruction: "show the last 12 months",
      dsl: dsl(),
      parentDraftId: "draft-1",
    });

    expect(request.baseDsl.component).toBe(REGISTERED_ID);
    expect(request.parentDraftId).toBe("draft-1");
    expect(request.refinement).toBe("show the last 12 months");
  });
});
