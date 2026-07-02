import { describe, expect, it } from "vitest";

import {
  isEnrollmentStepNavigable,
  resolveEnrollmentStepState,
} from "@/features/enrollment/config/enrollment-steps";
import type {
  AccountInfoResponse,
  EnrollmentStepKey,
  EnrollmentStepState,
} from "@/types/enrollment";

function stepState(
  overrides: Partial<Record<EnrollmentStepKey, boolean>> = {},
): EnrollmentStepState {
  return {
    "1": false,
    "2": false,
    "3": false,
    "4": false,
    "5": false,
    ...overrides,
  };
}

function accountInfoWithEnrollment(
  steps: EnrollmentStepState,
  status: string,
): Pick<
  AccountInfoResponse,
  "enrollment" | "enrollmentStep" | "enrollmentStatus"
> {
  return {
    enrollment: {
      steps,
      status,
    } as unknown as AccountInfoResponse["enrollment"],
  };
}

describe("isEnrollmentStepNavigable", () => {
  // Partition: stepNumber <= 1 — always navigable, regardless of state.
  it("always allows step 1 (and below), even without any step state", () => {
    expect(isEnrollmentStepNavigable(null, 1)).toBe(true);
    expect(isEnrollmentStepNavigable(undefined, 1)).toBe(true);
    expect(isEnrollmentStepNavigable(stepState(), 1)).toBe(true);
    expect(isEnrollmentStepNavigable(stepState(), 0)).toBe(true);
  });

  // Partition: the step's own state is completed — revisiting is allowed
  // even when an earlier step has since become incomplete.
  it("allows a step whose own state is completed even with a prior gap", () => {
    const state = stepState({ "1": true, "2": false, "3": true });

    expect(isEnrollmentStepNavigable(state, 3)).toBe(true);
  });

  // Partition: the "frontier" — every prior step completed, the step itself not.
  it("allows the frontier step (all prior steps completed)", () => {
    const state = stepState({ "1": true, "2": true });

    expect(isEnrollmentStepNavigable(state, 3)).toBe(true);
  });

  // Partition: a "gap" — some prior step incomplete and the step itself
  // not completed — must stay locked.
  it("locks a step past a gap (some prior step incomplete)", () => {
    const state = stepState({ "1": true, "3": true });

    // Step 2 is incomplete, so steps 4 and 5 beyond the gap stay locked.
    expect(isEnrollmentStepNavigable(state, 4)).toBe(false);
    expect(isEnrollmentStepNavigable(state, 5)).toBe(false);
    // Step 2 itself is the frontier (step 1 completed), so it is navigable.
    expect(isEnrollmentStepNavigable(state, 2)).toBe(true);
  });

  it("locks every step past the frontier when nothing is completed", () => {
    const state = stepState();

    expect(isEnrollmentStepNavigable(state, 2)).toBe(false);
    expect(isEnrollmentStepNavigable(state, 3)).toBe(false);
    expect(isEnrollmentStepNavigable(state, 4)).toBe(false);
    expect(isEnrollmentStepNavigable(state, 5)).toBe(false);
  });

  // Partition: null/loading state — behaves conservatively (as if nothing
  // is completed): only step 1 is navigable.
  it("treats a null/undefined (loading) state conservatively", () => {
    for (const missingState of [null, undefined] as const) {
      expect(isEnrollmentStepNavigable(missingState, 2)).toBe(false);
      expect(isEnrollmentStepNavigable(missingState, 3)).toBe(false);
      expect(isEnrollmentStepNavigable(missingState, 4)).toBe(false);
      expect(isEnrollmentStepNavigable(missingState, 5)).toBe(false);
    }
  });
});

describe("resolveEnrollmentStepState", () => {
  it("returns null when there is no account info", () => {
    expect(resolveEnrollmentStepState(null)).toBeNull();
    expect(resolveEnrollmentStepState(undefined)).toBeNull();
  });

  it("returns null when the backend provides no step state", () => {
    expect(
      resolveEnrollmentStepState({
        enrollment: null,
        enrollmentStep: null,
        enrollmentStatus: "DRAFT",
      }),
    ).toBeNull();
  });

  it("keeps step 5 incomplete while the enrollment is a DRAFT", () => {
    const resolved = resolveEnrollmentStepState(
      accountInfoWithEnrollment(
        stepState({ "1": true, "2": true, "3": true, "4": true }),
        "DRAFT",
      ),
    );

    expect(resolved).toEqual(
      stepState({ "1": true, "2": true, "3": true, "4": true, "5": false }),
    );
  });

  it("marks step 5 complete once the enrollment is SUBMITTED", () => {
    const resolved = resolveEnrollmentStepState(
      accountInfoWithEnrollment(
        stepState({ "1": true, "2": true, "3": true, "4": true }),
        "SUBMITTED",
      ),
    );

    expect(resolved?.["5"]).toBe(true);
  });

  it("marks step 5 complete for an APPROVED enrollment", () => {
    const resolved = resolveEnrollmentStepState(
      accountInfoWithEnrollment(
        stepState({ "1": true, "2": true, "3": true, "4": true }),
        "APPROVED",
      ),
    );

    expect(resolved?.["5"]).toBe(true);
  });

  it("compares the enrollment status case-insensitively", () => {
    const steps = stepState({ "1": true, "2": true, "3": true, "4": true });

    expect(
      resolveEnrollmentStepState(accountInfoWithEnrollment(steps, "draft"))?.[
        "5"
      ],
    ).toBe(false);
    expect(
      resolveEnrollmentStepState(
        accountInfoWithEnrollment(steps, "submitted"),
      )?.["5"],
    ).toBe(true);
  });

  it("does not treat a missing/empty status as submitted", () => {
    expect(
      resolveEnrollmentStepState(accountInfoWithEnrollment(stepState(), ""))?.[
        "5"
      ],
    ).toBe(false);
    expect(
      resolveEnrollmentStepState({
        enrollment: null,
        enrollmentStep: stepState({ "1": true }),
        enrollmentStatus: null,
      })?.["5"],
    ).toBe(false);
  });

  it("preserves a backend-reported completed step 5 even for a DRAFT", () => {
    const resolved = resolveEnrollmentStepState(
      accountInfoWithEnrollment(stepState({ "5": true }), "DRAFT"),
    );

    expect(resolved?.["5"]).toBe(true);
  });

  it("falls back to the flat enrollmentStep/enrollmentStatus fields", () => {
    const resolved = resolveEnrollmentStepState({
      enrollment: null,
      enrollmentStep: stepState({ "1": true, "2": true }),
      enrollmentStatus: "SUBMITTED",
    });

    expect(resolved).toEqual(
      stepState({ "1": true, "2": true, "5": true }),
    );
  });
});
