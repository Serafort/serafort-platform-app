# @cap/authorization

The `@cap/authorization` package provides a unified, engine-first authorization framework for the CAP Multi-Tenant SaaS Framework. It supports both **Role-Based Access Control (RBAC)** and **Attribute-Based Access Control (ABAC)**.

Instead of writing fragmented `if (user.role === 'ADMIN')` logic across your application, this package centralizes your access rules into a robust policy engine and provides simple, declarative hooks and components for enforcing them at the route, component, and API levels.

## Core Concepts

- **Subject**: The acting principal (usually the current user). It contains the user's ID, roles, explicit permissions, and attributes.
- **Resource**: The entity being accessed (e.g., `document`, `invoice`, `user`).
- **Action**: The operation being performed (e.g., `read`, `write`, `delete`, `approve`).
- **Effect**: `PolicyEffectEnum.ALLOW` or `PolicyEffectEnum.DENY`.
- **Policy Rule**: A configuration binding an effect to specific roles, actions, resources, and custom ABAC conditions.

## Usage

### 1. The Policy Engine

The `policyEngine` is a singleton that evaluates requests against the active `PolicySet`.

```typescript
import { policyEngine } from "@cap/authorization";

const decision = policyEngine.evaluate({
  subject: { id: "user-1", roles: ["editor"], permissions: [], attributes: {} },
  resource: { type: "article", id: "art-123" },
  action: "publish",
});

if (decision.effect === "allow") {
  // Proceed
}
```

### 2. React Components

#### `<Can>` Component

Use the `<Can>` component to declaratively hide or show UI elements based on user permissions.

```tsx
import { Can } from "@cap/authorization";

export const ArticleActions = ({ article }) => {
  return (
    <div>
      <Can action="read" resource={{ type: "article", id: article.id }}>
        <button>View</button>
      </Can>

      <Can action="edit" resource={{ type: "article" }}>
        <button>Edit</button>
      </Can>
    </div>
  );
};
```

#### `<RouteGuard>` Component

Use `<RouteGuard>` in your router layout to protect entire routes or pages. If the user does not have permission, they are automatically blocked (and optionally redirected or shown a fallback UI).

```tsx
import { RouteGuard } from "@cap/authorization";

export const ProtectedDashboard = () => {
  return (
    <RouteGuard action="access" resource={{ type: "admin_dashboard" }}>
      <DashboardView />
    </RouteGuard>
  );
};
```

### 3. React Hooks

#### `useCan()`

Returns a simple boolean indicating if the current user can perform an action.

```tsx
import { useCan } from "@cap/authorization";

export const DeleteButton = () => {
  const canDelete = useCan("delete", { type: "invoice" });

  return <button disabled={!canDelete}>Delete Invoice</button>;
};
```

#### `usePolicy()`

Returns the full `PolicyDecision` object if you need to know _why_ an action was denied (e.g., to show a specific error message).

```tsx
import { usePolicy } from "@cap/authorization";

export const ActionPanel = () => {
  const decision = usePolicy("approve", { type: "expense_report" });

  if (decision.effect === "deny") {
    return <p>Cannot approve: {decision.reason}</p>;
  }

  return <button>Approve</button>;
};
```

### 4. Higher-Order Components (HOC)

If you prefer the HOC pattern, you can use `withAuth` to wrap your components.

```tsx
import { withAuth } from "@cap/authorization";

const AdminSettings = () => {
  return <div>Settings</div>;
};

export default withAuth(AdminSettings, "read", { type: "settings" });
```

### 5. API Enforcement

You can intercept and block unauthorized API requests at the network layer _before_ they leave the browser. Use `createFetchApiAuthEnforcer` to create a hook that integrates with your `fetch` client.

```typescript
import { createFetchApiAuthEnforcer } from "@cap/authorization";

const enforcer = createFetchApiAuthEnforcer({
  optimisticDeny: true,
  getResource: (endpoint) => {
    if (endpoint.includes("/api/invoices")) return { type: "invoice" };
    return undefined; // Let other requests pass through
  },
  onDenied: ({ endpoint, action }) => {
    console.error(`Blocked ${action} on ${endpoint}`);
  },
});

// Attach to your HTTP client's "before request" pipeline
myHttpClient.onBeforeRequest(enforcer.beforeRequest);
```

## Adding Custom ABAC Conditions

You can register custom rule logic (Attribute-Based Access Control) using `registerCondition`.

```typescript
import { registerCondition } from "@cap/authorization";

// Register a custom condition
registerCondition("isOwner", (subject, resource) => {
  return subject.id === resource.attributes?.ownerId;
});

// Now you can use it in your policy sets:
// {
//   effect: 'allow',
//   actions: ['edit'],
//   resources: ['document'],
//   condition: { id: 'isOwner' }
// }
```
