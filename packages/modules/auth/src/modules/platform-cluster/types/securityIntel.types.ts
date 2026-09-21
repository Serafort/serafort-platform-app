/**
 * Anomaly detection and alert triage types.
 *
 * These mirror the backend `Anomaly` and `Alert` models, which are real,
 * persisted records — not the placeholder surfaces next to them. Two backend
 * endpoints in the same family are stubs today and are deliberately **not**
 * modelled here, so no screen can render fabricated data as if it were real:
 *
 * - `admin.threatIntel.heatmap` and `.indicators` return `[]` unconditionally.
 *   The geographic view is therefore built from
 *   `admin.statistics.sessionStatistics.geographicBreakdown`, which is derived
 *   from real `session_logs` rows.
 * - `admin.alertRules.*` echoes its input without persisting, so a rules
 *   manager built on it would silently discard every rule an operator wrote.
 */

/**
 * Anomaly lifecycle. `detected` is the inbox; the other four are the outcomes
 * of triage. `false_positive` is distinct from `resolved` on purpose — it is
 * feedback about the detector, not about the incident.
 */
export type AnomalyStatus =
  | "detected"
  | "investigating"
  | "confirmed"
  | "false_positive"
  | "resolved";

export interface AnomalyAffectedUser {
  id: number;
  email?: string;
  fullName?: string | null;
}

/**
 * One detection. The baseline/observed pair is what makes an anomaly
 * explainable rather than just a score: `baselineExpectedValue` with its range
 * and sample size says what normal looked like, `observedValue` says what
 * happened, and `deviationPercent` is the gap the detector fired on.
 */
export interface Anomaly {
  id: number;
  /** Detector name, e.g. `impossible_travel`, `baseline_shift`. */
  type: string;
  score: number;
  status: AnomalyStatus;
  affectedUserId: number | null;
  affectedUser?: AnomalyAffectedUser | null;
  affectedIp: string | null;

  baselineMetric: string | null;
  baselineExpectedValue: number | null;
  baselineExpectedRangeMin: number | null;
  baselineExpectedRangeMax: number | null;
  baselineSampleSize: number | null;
  baselineWindowDays: number | null;

  observedMetric: string | null;
  observedValue: number | null;
  deviationPercent: number | null;

  metadata: Record<string, any>;
  detectedAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface AnomalyPage {
  data: Anomaly[];
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
  };
}

/** Grouped counts. Lucid returns aggregate rows, so counts arrive as strings. */
export interface AnomalyStats {
  total: Array<{ total: number | string }>;
  byType: Array<{ type: string; count: number | string }>;
  byStatus: Array<{ status: string; count: number | string }>;
  recent: Anomaly[];
}

export interface SecurityScore {
  overall: number;
  authentication?: number;
  authorization?: number;
  anomalyDetection?: number;
  fraudPrevention?: number;
  threatIntelligence?: number;
  computedAt: string;
}

export type AlertSeverity = "critical" | "high" | "medium" | "low" | "info";

/**
 * Alert lifecycle. `suppressed` is what the backend records for a dismissal;
 * the UI calls that action "Dismiss" because that is what an operator is doing,
 * but the stored state is `suppressed`.
 */
export type AlertStatus =
  | "open"
  | "acknowledged"
  | "resolved"
  | "suppressed"
  | "expired";

export interface SecurityAlert {
  id: number;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  category: string;
  sourceModule: string;
  sourceDetector: string;
  sourceEventType: string;
  affectedUserId: number | null;
  affectedIp: string | null;
  affectedResource: string | null;
  metadata: Record<string, any>;
  /** Set when the alert was raised by a detector rather than by hand. */
  anomalyId: number | null;
  createdAt: string;
  updatedAt: string;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  expiresAt: string | null;
}

/**
 * The four triage actions, and what each means.
 *
 * `falsePositive` is not a synonym for `dismiss`. Dismissing suppresses one
 * alert; marking a false positive records that the *detector* was wrong, and it
 * applies to the underlying anomaly rather than the alert, which is why it is
 * routed to the anomaly endpoint.
 */
export type TriageAction =
  | "acknowledge"
  | "resolve"
  | "dismiss"
  | "falsePositive";

/**
 * Which actions make sense for an alert in a given state. Centralised so the
 * table, the detail drawer and the tests cannot disagree about it.
 */
export function availableTriageActions(
  alert: Pick<SecurityAlert, "status" | "anomalyId">,
): TriageAction[] {
  if (alert.status === "resolved" || alert.status === "expired") return [];

  const actions: TriageAction[] = [];
  if (alert.status === "open") actions.push("acknowledge");
  if (alert.status !== "suppressed") actions.push("resolve", "dismiss");
  // Only a detector-raised alert has a detector to be wrong about.
  if (alert.anomalyId !== null) actions.push("falsePositive");
  return actions;
}

/** Ordering for severity, highest first. */
export const ALERT_SEVERITY_ORDER: AlertSeverity[] = [
  "critical",
  "high",
  "medium",
  "low",
  "info",
];

/**
 * A country's share of recent sign-ins, from `session_logs`. This is the real
 * geographic signal available today — `admin.threatIntel.heatmap` is a stub
 * that returns an empty array.
 */
export interface GeographicLoginPoint {
  country: string;
  code?: string;
  count: number;
}
