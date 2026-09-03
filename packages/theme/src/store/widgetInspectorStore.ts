import { useSyncExternalStore } from "react";

export interface InspectorWidgetRef {
  pageId: string;
  slotId: string;
  widgetId: string;
  title?: string;
  customTitle?: string;
  accentColor?: string;
  refreshInterval?: number;
}

export interface WidgetInspectorState {
  isOpen: boolean;
  inspectingWidget: InspectorWidgetRef | null;
}

let state: WidgetInspectorState = {
  isOpen: false,
  inspectingWidget: null,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const widgetInspectorStore = {
  getState(): WidgetInspectorState {
    return state;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  openInspector(ref: InspectorWidgetRef) {
    state = {
      isOpen: true,
      inspectingWidget: ref,
    };
    notify();
  },

  closeInspector() {
    state = {
      isOpen: false,
      inspectingWidget: null,
    };
    notify();
  },

  updateInspectingWidget(updates: Partial<InspectorWidgetRef>) {
    if (!state.inspectingWidget) return;
    state = {
      ...state,
      inspectingWidget: {
        ...state.inspectingWidget,
        ...updates,
      },
    };
    notify();
  },
};

export function useWidgetInspectorStore(): WidgetInspectorState;
export function useWidgetInspectorStore<T>(
  selector: (state: WidgetInspectorState) => T,
): T;
export function useWidgetInspectorStore<T>(
  selector?: (state: WidgetInspectorState) => T,
): T | WidgetInspectorState {
  const current = useSyncExternalStore(
    widgetInspectorStore.subscribe,
    widgetInspectorStore.getState,
    widgetInspectorStore.getState,
  );

  return selector ? selector(current) : current;
}

export default widgetInspectorStore;
