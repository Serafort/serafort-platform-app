/**
 * Notification Type Definitions
 *
 * Generic notification types that can be used across packages.
 * Application-specific notification types should be defined in the consuming app.
 */

// ============================================
// Notification Types
// ============================================

export type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// Toast Types
// ============================================

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// ============================================
// Type Guards
// ============================================

export function isNotification(value: unknown): value is Notification {
  if (!value || typeof value !== "object") return false;
  const n = value as Record<string, unknown>;
  return (
    typeof n.id === "string" &&
    typeof n.title === "string" &&
    typeof n.message === "string" &&
    typeof n.timestamp === "string" &&
    typeof n.read === "boolean"
  );
}

export function isNotificationType(value: unknown): value is NotificationType {
  const validTypes: NotificationType[] = [
    "success",
    "error",
    "warning",
    "info",
    "system",
  ];
  return (
    typeof value === "string" && validTypes.includes(value as NotificationType)
  );
}
