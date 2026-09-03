import { AppPaths } from "@cap/shared-types";

export const WidgetStudioPath = {
  /** Widget Studio is a panel/drawer on the dashboard — no dedicated route for Phase 1 */
  studio: AppPaths.widgetStudio.root,
} as const;

export default WidgetStudioPath;
