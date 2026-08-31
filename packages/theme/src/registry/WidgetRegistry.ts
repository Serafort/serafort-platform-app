import React from "react";
import type { WidgetId } from "@cap/shared-types";

export interface WidgetDescriptor {
  id: WidgetId;
  /** i18n key for the widget display title. */
  titleKey: string;
  Component:
    | React.ComponentType<any>
    | React.LazyExoticComponent<React.ComponentType<any>>;
}

export interface RegisterModuleWidgetsOptions {
  /** Optional custom ID overrides mapping widget keys or basenames to specific WidgetIds. */
  idMapping?: Record<string, string>;
}

class WidgetRegistry {
  private widgets = new Map<WidgetId, WidgetDescriptor>();

  register(descriptor: WidgetDescriptor) {
    if (this.widgets.has(descriptor.id) && import.meta.env.DEV) {
      console.warn(
        `[WidgetRegistry] Overwriting widget with id: ${descriptor.id}`,
      );
    }
    this.widgets.set(descriptor.id, descriptor);
  }

  get(id: WidgetId): WidgetDescriptor | undefined {
    return this.widgets.get(id);
  }

  getAll(): WidgetDescriptor[] {
    return Array.from(this.widgets.values());
  }

  /**
   * Dynamically registers all widget components in a module using Vite's `import.meta.glob`.
   *
   * Title key format: `${moduleName}.widgets.${widgetKey}.title`
   *
   * @param moduleName - The module namespace (e.g. 'landing', 'dashboard')
   * @param globModules - Result of `import.meta.glob('./widgets/*.tsx')`
   * @param options - Optional custom ID mapping
   */
  registerModuleWidgets(
    moduleName: string,
    globModules: Record<string, () => Promise<any>>,
    options?: RegisterModuleWidgetsOptions,
  ) {
    Object.entries(globModules).forEach(([filePath, loader]) => {
      // Exclude index files
      if (filePath.endsWith("index.ts") || filePath.endsWith("index.tsx"))
        return;

      // Extract file basename without extension (e.g. "./widgets/HeroBannerWidget.tsx" -> "HeroBannerWidget")
      const basename = filePath
        .substring(filePath.lastIndexOf("/") + 1)
        .replace(/\.(tsx|ts|jsx|js)$/, "");

      // Strip trailing "Widget" if present ("HeroBannerWidget" -> "HeroBanner")
      const rawKey = basename.replace(/Widget$/, "");
      const camelKey = rawKey.charAt(0).toLowerCase() + rawKey.slice(1);

      // Title key: `${moduleName}.widgets.${camelKey}.title`
      const titleKey = `${moduleName}.widgets.${camelKey}.title`;

      // Determine Widget ID (check custom mapping, or default to `${moduleName}-widget-${camelKey}`)
      const id =
        options?.idMapping?.[camelKey] ||
        options?.idMapping?.[basename] ||
        `${moduleName}-widget-${camelKey}`;

      this.register({
        id,
        titleKey,
        Component: React.lazy(loader),
      });
    });
  }
}

export const globalWidgetRegistry = new WidgetRegistry();

export const registerModuleWidgets = (
  moduleName: string,
  globModules: Record<string, () => Promise<any>>,
  options?: RegisterModuleWidgetsOptions,
) =>
  globalWidgetRegistry.registerModuleWidgets(moduleName, globModules, options);
