import { describe, it, expect } from "vitest";
import { getCondition, registerCondition } from "../engine/conditions";
import { PolicySubject, PolicyResource } from "../types/policy.types";

describe("ABAC Conditions", () => {
  const subject: PolicySubject = {
    id: 42,
    roles: ["user"],
    permissions: [],
    attributes: { orgId: 100 },
  };

  it("evaluates built-in owns condition correctly", () => {
    const ownsEvaluator = getCondition("owns")!;
    expect(ownsEvaluator).toBeDefined();

    const ownResource: PolicyResource = {
      type: "item",
      attributes: { ownerId: 42 },
    };
    const notOwnResource: PolicyResource = {
      type: "item",
      attributes: { ownerId: 99 },
    };

    expect(ownsEvaluator(subject, ownResource)).toBe(true);
    expect(ownsEvaluator(subject, notOwnResource)).toBe(false);
  });

  it("evaluates built-in sameOrg condition correctly", () => {
    const sameOrgEvaluator = getCondition("sameOrg")!;
    expect(sameOrgEvaluator).toBeDefined();

    const sameOrgResource: PolicyResource = {
      type: "item",
      attributes: { orgId: 100 },
    };
    const diffOrgResource: PolicyResource = {
      type: "item",
      attributes: { orgId: 200 },
    };

    expect(sameOrgEvaluator(subject, sameOrgResource)).toBe(true);
    expect(sameOrgEvaluator(subject, diffOrgResource)).toBe(false);
  });

  it("supports custom registered conditions", () => {
    registerCondition("customVipOnly", (sub) => sub.attributes.isVip === true);
    const customEvaluator = getCondition("customVipOnly")!;

    const vipSubject: PolicySubject = {
      id: 1,
      roles: [],
      permissions: [],
      attributes: { isVip: true },
    };

    expect(customEvaluator(vipSubject, { type: "lounge" })).toBe(true);
    expect(customEvaluator(subject, { type: "lounge" })).toBe(false);
  });
});
