/**
 * Widget DSL schema versioning.
 *
 * Two different versions live on a `WidgetDefinition` and they are easy to
 * confuse:
 *
 * - `version` is the widget's own SemVer, authored by whoever generated it.
 *   It says nothing about the shape of the record.
 * - `schemaVersion` is the shape of the record itself, owned by this module.
 *
 * The distinction matters because drafts are persisted in the browser
 * (`widgetDrafts` is in the store's partialize list), so a definition written
 * by a build from months ago is read back by today's code. Until now that was
 * simply assumed to work.
 *
 * A migration is a pure function from one shape to the next. `migrateWidgetDsl`
 * walks the chain, so adding a future shape means adding one entry.
 */
import type { WidgetDefinition } from "@cap/shared-types";

/** The shape this build writes. Bump when a migration is added. */
export const DSL_SCHEMA_VERSION = 2;

/** Behaviour keys this schema knows about; anything else is dropped. */
const KNOWN_BEHAVIOR_KEYS = new Set([
  "autoRefresh",
  "refreshInterval",
  "interactive",
]);

type RawDsl = Record<string, unknown>;

/** One step of the chain: shape N -> shape N+1. */
type Migration = (dsl: RawDsl) => RawDsl;

const migrations: Record<number, Migration> = {
  /**
   * v1 -> v2: the pre-versioning shape.
   *
   * `sanitizeWidgetDsl` has always written `behavior.interactive`, but the
   * type never declared it, so definitions carry a key no producer set
   * deliberately alongside whatever else an older sanitiser happened to copy
   * through. This normalises `behavior` to the declared keys and coerces
   * `refreshInterval` to a number, which some older records stored as a
   * string.
   */
  1: (dsl) => {
    const behavior =
      dsl.behavior && typeof dsl.behavior === "object"
        ? ({ ...dsl.behavior } as Record<string, unknown>)
        : undefined;

    if (behavior) {
      for (const key of Object.keys(behavior)) {
        if (!KNOWN_BEHAVIOR_KEYS.has(key)) delete behavior[key];
      }
      if (behavior.refreshInterval !== undefined) {
        const seconds = Number(behavior.refreshInterval);
        if (Number.isFinite(seconds)) {
          behavior.refreshInterval = Math.max(5, seconds);
        } else {
          delete behavior.refreshInterval;
        }
      }
      if (behavior.autoRefresh !== undefined) {
        behavior.autoRefresh = Boolean(behavior.autoRefresh);
      }
    }

    return { ...dsl, ...(behavior ? { behavior } : {}) };
  },
};

export interface MigrationResult {
  dsl: WidgetDefinition;
  /** The version the record arrived as; equal to DSL_SCHEMA_VERSION if current. */
  from: number;
  /** True when the record was actually rewritten. */
  migrated: boolean;
}

/**
 * Bring a stored definition up to the current shape.
 *
 * An unrecognised (future) `schemaVersion` is left alone rather than mangled:
 * a newer build wrote it, and downgrading is not this function's job.
 */
export function migrateWidgetDsl(input: unknown): MigrationResult {
  const raw = (input && typeof input === "object" ? { ...input } : {}) as RawDsl;

  const declared = Number(raw.schemaVersion);
  const from = Number.isFinite(declared) && declared > 0 ? declared : 1;

  if (from >= DSL_SCHEMA_VERSION) {
    return { dsl: raw as unknown as WidgetDefinition, from, migrated: false };
  }

  let current = raw;
  for (let version = from; version < DSL_SCHEMA_VERSION; version++) {
    const step = migrations[version];
    if (step) current = step(current);
  }
  current.schemaVersion = DSL_SCHEMA_VERSION;

  return {
    dsl: current as unknown as WidgetDefinition,
    from,
    migrated: true,
  };
}

/** Stamp the current schema version onto a definition this build produced. */
export function stampSchemaVersion(dsl: WidgetDefinition): WidgetDefinition {
  return { ...dsl, schemaVersion: DSL_SCHEMA_VERSION };
}
