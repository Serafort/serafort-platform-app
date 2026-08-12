import { useSyncExternalStore } from 'react';

export interface WidgetMarketplaceState {
  isOpen: boolean;
  activePageId: string;
  searchQuery: string;
  selectedCategory: string;
  activeTab: number;
}

let state: WidgetMarketplaceState = {
  isOpen: false,
  activePageId: 'dashboard',
  searchQuery: '',
  selectedCategory: 'all',
  activeTab: 0,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const widgetMarketplaceStore = {
  getState(): WidgetMarketplaceState {
    return state;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  openMarketplace(pageId?: string, tabIndex: number = 0) {
    state = {
      ...state,
      isOpen: true,
      activePageId: pageId || state.activePageId || 'dashboard',
      activeTab: tabIndex,
    };
    notify();
  },

  closeMarketplace() {
    state = {
      ...state,
      isOpen: false,
    };
    notify();
  },

  setActivePageId(pageId: string) {
    state = {
      ...state,
      activePageId: pageId,
    };
    notify();
  },

  setSearchQuery(query: string) {
    state = {
      ...state,
      searchQuery: query,
    };
    notify();
  },

  setSelectedCategory(category: string) {
    state = {
      ...state,
      selectedCategory: category,
    };
    notify();
  },

  setActiveTab(tab: number) {
    state = {
      ...state,
      activeTab: tab,
    };
    notify();
  },
};

export function useWidgetMarketplaceStore(): WidgetMarketplaceState;
export function useWidgetMarketplaceStore<T>(selector: (state: WidgetMarketplaceState) => T): T;
export function useWidgetMarketplaceStore<T>(selector?: (state: WidgetMarketplaceState) => T): T | WidgetMarketplaceState {
  const current = useSyncExternalStore(
    widgetMarketplaceStore.subscribe,
    widgetMarketplaceStore.getState,
    widgetMarketplaceStore.getState
  );

  return selector ? selector(current) : current;
}

export default widgetMarketplaceStore;
