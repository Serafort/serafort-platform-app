export type WidgetEventCallback<T = any> = (payload: T) => void;

export const WIDGET_EVENTS = {
  DATE_RANGE_CHANGED: "WIDGET:DATE_RANGE_CHANGED",
  FILTER_APPLIED: "WIDGET:FILTER_APPLIED",
  METRIC_HIGHLIGHTED: "WIDGET:METRIC_HIGHLIGHTED",
  RELOAD_REQUESTED: "WIDGET:RELOAD_REQUESTED",
  THEME_VARIANT_CHANGED: "WIDGET:THEME_VARIANT_CHANGED",
} as const;

export type StandardWidgetEventType =
  (typeof WIDGET_EVENTS)[keyof typeof WIDGET_EVENTS];
export type WidgetEventType = StandardWidgetEventType | (string & {});

export interface WidgetEventLogEntry {
  id: string;
  eventType: string;
  payload: any;
  timestamp: number;
}

export class WidgetEventBus {
  private events: Map<string, Set<WidgetEventCallback>> = new Map();
  private eventLog: WidgetEventLogEntry[] = [];
  private maxLogEntries = 50;

  subscribe<T = any>(
    eventType: WidgetEventType,
    callback: WidgetEventCallback<T>,
  ): () => void {
    if (!this.events.has(eventType)) {
      this.events.set(eventType, new Set());
    }
    this.events.get(eventType)!.add(callback);

    return () => {
      const callbacks = this.events.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.events.delete(eventType);
        }
      }
    };
  }

  publish<T = any>(eventType: WidgetEventType, payload?: T): void {
    const logEntry: WidgetEventLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      eventType,
      payload,
      timestamp: Date.now(),
    };

    this.eventLog.unshift(logEntry);
    if (this.eventLog.length > this.maxLogEntries) {
      this.eventLog.pop();
    }

    if (import.meta.env.DEV) {
      console.log(`[WidgetEventBus] Published "${eventType}":`, payload);
    }

    const callbacks = this.events.get(eventType);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(payload);
        } catch (err) {
          console.error(
            `[WidgetEventBus] Error handling event "${eventType}":`,
            err,
          );
        }
      });
    }
  }

  getEventHistory(): WidgetEventLogEntry[] {
    return [...this.eventLog];
  }

  clearHistory(): void {
    this.eventLog = [];
  }
}

export const widgetEventBus = new WidgetEventBus();
export default widgetEventBus;
