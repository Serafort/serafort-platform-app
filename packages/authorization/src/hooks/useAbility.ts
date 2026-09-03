import { useCallback } from "react";
import { useAppStore } from "@cap/platform-store";
import { PolicyAction, PolicyResource } from "../types/policy.types";
import { policyEngine } from "../engine/engine";
import { buildSubject } from "../subject/buildSubject";

/**
 * Returns a stable, memoized `can` function bound to the current subject.
 */
export function useAbility() {
  const user = useAppStore((state: any) => state.user);
  const isAuthenticated = useAppStore((state: any) => state.isAuthenticated);

  const can = useCallback(
    (action: PolicyAction, resource: PolicyResource): boolean => {
      if (!isAuthenticated || !user) return false;
      const subject = buildSubject(user);
      if (!subject) return false;
      return policyEngine.can(subject, action, resource);
    },
    [user, isAuthenticated],
  );

  return { can };
}
