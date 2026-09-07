export * from "./auth";
export * from "./permissions";
export * from "./user";
export * from "./common";
export * from "./table";
export * from "./layout";
export * from "./module";
export * from "./module-pipeline.types";
export * from "./theme";
export * from "./contracts/plugin.contracts";

// Core domain types
export * from "./tenant.types";
export * from "./notification.types";
export * from "./queue.types";

// Admin module types
export * from "./admin.types";
export * from "./admin-api.types";

export * from "./routes";

// i18n locale config + module dictionary registry (Tier 0 Foundation)
export * from "./i18n/i18n";
export * from "./i18n/registry";

// AI Widget Studio — Widget DSL and agent pipeline types
export * from "./widget-studio.types";
export type DemoName = 'demo-1' | 'demo-2' | 'demo-3' | 'demo-4' | 'demo-5' | 'demo-6' | null;
