import type {
  CAPModule,
  NavItemConfig,
  SearchItemConfig,
} from "@cap/shared-types";
import { themeRouteConfig } from "./routes/routes";
import { ThemePath } from "./routes";
import { themeDictionaries, registerDictionary } from "./i18n/registry";

export { themeRouteConfig };
export { default as ThemeEditor } from "./screens/ThemeEditor";
export { AiThemeStudioPanel } from "./components/AiThemeStudioPanel";
export type { AiThemeStudioPanelProps } from "./components/AiThemeStudioPanel";
export {
  aiThemePromptService,
  CURATED_PROMPT_SUGGESTIONS,
} from "./services/aiThemePromptService";
export type {
  PromptSuggestion,
  PromptAnalysisResult,
} from "./services/aiThemePromptService";
export * from "./services/theme.service";
export * from "./hooks/useThemeQuery";

// I18n Registry & Dictionaries
export {
  themeDictionaries,
  registerDictionary,
  getMergedDictionary,
  getAvailableLocales,
  i18n,
  type Locale,
} from "./i18n/registry";

registerDictionary(themeDictionaries as any);

export const themeNavItems: Array<NavItemConfig> = [
  {
    id: "theme-editor",
    label: "navigation.theme",
    icon: "tabler-palette",
    path: ThemePath.theme,
    variant: ["vertical", "horizontal"],
    order: 80,
  },
];

export const themeSearchItems: Array<SearchItemConfig> = [
  {
    id: "search-theme-editor",
    name: "Theme Customization",
    url: ThemePath.theme,
    icon: "tabler-palette",
    section: "Settings",
  },
];

export const ThemeModule: CAPModule = {
  id: "theme-module",
  version: "1.0.0",
  name: "Theme Customization Module",
  description: "Theme customization and live preview editor module",
  routes: themeRouteConfig as any,
  i18n: themeDictionaries,
  plugins: [],
  navItems: themeNavItems,
  searchItems: themeSearchItems,
};

export default ThemeModule;
