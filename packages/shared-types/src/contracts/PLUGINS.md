# Plugin System

The CAP Platform Plugin System allows modules to register components, routes, services, and i18n translations at runtime.

## Overview

Plugins are modular units of functionality that can be:

- **Component Plugins** - Provide React components for UI injection
- **Route Plugins** - Provide application routes
- **Service Plugins** - Provide business logic services (API clients, utilities, etc.)
- **i18n Plugins** - Provide translation dictionaries
- **Hybrid Plugins** - Combine multiple plugin types

## Plugin Contract

All plugins must implement the `BasePlugin` interface:

```typescript
interface BasePlugin extends PluginMetadata {
  id: string; // Unique identifier
  name: string; // Human-readable name
  version: string; // Semver version
  pluginType: string; // Type of plugin
  category?: string; // For organization
  dependencies?: string[]; // Other plugin IDs this depends on

  install: (context: PluginInstallContext) => void | Promise<void>;
  uninstall?: (context: PluginUninstallContext) => void | Promise<void>;
}
```

## Creating a Service Plugin

```typescript
import type { ServicePlugin } from "@cap/shared-types";

export const MyServicePlugin: ServicePlugin = {
  id: "my-service",
  name: "My Service Plugin",
  version: "1.0.0",
  pluginType: "service",
  category: "service",

  services: {
    myService: new MyService(),
  },

  install: async (context) => {
    console.log("Installing my service plugin");
  },

  uninstall: async (context) => {
    console.log("Uninstalling my service plugin");
  },
};
```

## Creating a Component Plugin

```typescript
import type { ComponentPlugin } from "@cap/shared-types";
import { MyWidget } from "./components/MyWidget";

export const MyComponentPlugin: ComponentPlugin = {
  id: "my-components",
  name: "My Components",
  version: "1.0.0",
  pluginType: "component",
  category: "ui",

  components: {
    MyWidget,
    MySidebar,
  },

  install: async (context) => {
    console.log("Installing component plugin");
  },
};
```

## Using the Plugin Registry

### Global Registry

```typescript
import { globalPluginRegistry } from "@cap/platform-core";

// Register a plugin
await globalPluginRegistry.register(myPlugin);

// Get a plugin
const plugin = globalPluginRegistry.getPlugin("my-plugin");

// Get all plugins of a type
const services = globalPluginRegistry.getPluginsByType("service");

// Get a registered service
const myService = globalPluginRegistry.getService<MyService>("myService");
```

### Module Plugins

Modules can declare plugins in their definition:

```typescript
export const MyModule: CAPModule = {
  id: "my-module",
  version: "1.0.0",
  plugins: [MyServicePlugin, MyComponentPlugin],
  // ... other module config
};
```

## Plugin Lifecycle

1. **Pending** - Plugin is registered but not yet installed
2. **Installing** - Plugin install() is being called
3. **Active** - Plugin is successfully installed
4. **Error** - Plugin installation failed
5. **Uninstalled** - Plugin has been removed

## Plugin Dependencies

Plugins can declare dependencies on other plugins:

```typescript
export const MyDependentPlugin: ServicePlugin = {
  id: "my-dependent-plugin",
  dependencies: ["my-service", "my-components"],
  // ...
};
```

The registry will throw an error if dependencies are not met.

## Best Practices

1. **Keep plugins focused** - Each plugin should have a single responsibility
2. **Use semantic versioning** - Follow semver for plugin versions
3. **Handle errors gracefully** - Implement proper error handling in install/uninstall
4. **Document dependencies** - Clearly declare plugin dependencies
5. **Clean up on uninstall** - Remove all resources in the uninstall hook
