import { describe, expect, it } from "vitest";

import {
  getIncompleteEnrollmentSteps,
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
  // Free jump navigation: every step is navigable at all times, no matter
  // what has been completed. Completion only affects styling (and gating
  // the final submit), never movement between steps.
  it("allows every step when nothing is completed", () => {
    const state = stepState();

    for (const step of [1, 2, 3, 4, 5]) {
      expect(isEnrollmentStepNavigable(state, step)).toBe(true);
    }
  });

  it("allows every step while the state is still loading (null/undefined)", () => {
    for (const missingState of [null, undefined] as const) {
      for (const step of [1, 2, 3, 4, 5]) {
        expect(isEnrollmentStepNavigable(missingState, step)).toBe(true);
      }
    }
  });

  it("allows steps past a gap (some prior step incomplete)", () => {
    const state = stepState({ "1": true, "3": true });

    expect(isEnrollmentStepNavigable(state, 2)).toBe(true);
    expect(isEnrollmentStepNavigable(state, 4)).toBe(true);
    expect(isEnrollmentStepNavigable(state, 5)).toBe(true);
  });
});

describe("getIncompleteEnrollmentSteps", () => {
  it("returns no steps once steps 1-4 are complete (step 5 never gates itself)", () => {
    const state = stepState({ "1": true, "2": true, "3": true, "4": true });

    expect(getIncompleteEnrollmentSteps(state)).toEqual([]);
  });

  it("lists every required step when nothing is completed", () => {
    expect(
      getIncompleteEnrollmentSteps(stepState()).map((step) => step.step),
    ).toEqual([1, 2, 3, 4]);
  });

  it("lists only the missing steps, with their titles and links", () => {
    const state = stepState({ "2": true, "3": true });

    expect(getIncompleteEnrollmentSteps(state)).toEqual([
      { step: 1, title: "Demographics", href: "/enrollment/step-1" },
      { step: 4, title: "Documents", href: "/enrollment/step-4" },
    ]);
  });

  it("treats a null/undefined (loading) state as all-incomplete", () => {
    for (const missingState of [null, undefined] as const) {
      expect(
        getIncompleteEnrollmentSteps(missingState).map((step) => step.step),
      ).toEqual([1, 2, 3, 4]);
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

    expect(resolved).toEqual(stepState({ "1": true, "2": true, "5": true }));
  });
});
