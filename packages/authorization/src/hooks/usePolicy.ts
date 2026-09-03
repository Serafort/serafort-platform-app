import { useMemo } from "react";
import { useAppStore } from "@cap/platform-store";
import {
  PolicyAction,
  PolicyDecision,
  PolicyResource,
  PolicyEffectEnum,
} from "../types/policy.types";
import { policyEngine } from "../engine/engine";
import { buildSubject } from "../subject/buildSubject";

/**
 * Returns the raw authorization decision for an action and resource.
 */
export function usePolicy(
  action: PolicyAction,
  resource: PolicyResource,
): PolicyDecision {
  const user = useAppStore((state: any) => state.user);
  const isAuthenticated = useAppStore((state: any) => state.isAuthenticated);

  return useMemo(() => {
    if (!isAuthenticated || !user)
      return {
        effect: PolicyEffectEnum.DENY,
        reason: "User is not authenticated",
      };

    const subject = buildSubject(user);
    if (!subject)
      return {
        effect: PolicyEffectEnum.DENY,
        reason: "Failed to build policy subject",
      };

    return policyEngine.evaluate({ subject, resource, action });
  }, [user, isAuthenticated, action, resource]);
}
