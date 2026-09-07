/**
 * Audit entries, and what they are worth.
 *
 * The panel used to write entries claiming `createdBy: "current-user"` with a
 * model string that defaulted to "gemini-2.0-flash" - a model the store never
 * selects, since its own default is "gemini-3.6-flash". Both read like facts
 * and neither was one. In an application whose documentation makes an audit
 * trail a release gate, a fabricated entry is worse than no entry: it is
 * indistinguishable from a real one.
 *
 * So two things happen here. Client entries record only what this browser can
 * actually know - the signed-in user's id, or "unknown"; the model that was
 * actually selected - and are stamped `source: "client"`. Entries the backend
 * sends are adopted as-is and stamped `source: "server"`. Only the second kind
 * is evidence, because only the second kind was written by something the user
 * does not control, and the UI says so.
 */
import type {
  WidgetAuditEntry,
  WidgetDefinition,
  WidgetLifecycle,
} from "@cap/shared-types";
import { useAppStore } from "@cap/platform-store";

/** The signed-in user's id, or "unknown" - never a placeholder that reads real. */
export function resolveActor(): string {
  const auth = useAppStore.getState().user;
  const id = auth?.user?.id ?? auth?.id;
  return id !== undefined && id !== null ? String(id) : "unknown";
}

export interface ClientAuditInput {
  dsl: WidgetDefinition;
  action: WidgetLifecycle;
  runId?: number;
  /** The model actually used, when the caller knows it better than the store. */
  model?: string;
}

/** A local record of what this browser did. Not evidence; labelled as such. */
export function buildClientAuditEntry({
  dsl,
  action,
  runId,
  model,
}: ClientAuditInput): WidgetAuditEntry {
  const store = useAppStore.getState();
  return {
    widgetId: dsl.id,
    createdBy: resolveActor(),
    generatedAt: new Date().toISOString(),
    // No literal fallback: if nothing is selected, say so rather than naming
    // a model that may not have run.
    model: model || store.selectedModel || "unknown",
    version: dsl.version || "1.0.0",
    action,
    source: "client",
  };
}

/**
 * Adopt entries the backend sent with a run.
 *
 * Anything missing is filled from the entry's own context rather than from
 * this browser's state - a server entry must not quietly acquire the local
 * user's id.
 */
export function adoptServerAuditEntries(
  raw: unknown,
  context: { runId?: number; widgetId?: string } = {},
): WidgetAuditEntry[] {
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];

  return list
    .filter((entry): entry is Record<string, unknown> => {
      return Boolean(entry) && typeof entry === "object";
    })
    .map((entry) => ({
      widgetId: String(entry.widgetId ?? context.widgetId ?? ""),
      createdBy: String(entry.createdBy ?? "unknown"),
      generatedAt: String(entry.generatedAt ?? new Date().toISOString()),
      model: String(entry.model ?? "unknown"),
      version: String(entry.version ?? "1.0.0"),
      action: (entry.action as WidgetLifecycle) ?? "published",
      source: "server" as const,
      ...(typeof entry.runId === "number"
        ? { runId: entry.runId }
        : context.runId !== undefined
          ? { runId: context.runId }
          : {}),
    }))
    .filter((entry) => entry.widgetId !== "");
}

/** True when every entry came from the backend, i.e. the trail is evidence. */
export function isAttestedTrail(entries: WidgetAuditEntry[]): boolean {
  return entries.length > 0 && entries.every((e) => e.source === "server");
}
