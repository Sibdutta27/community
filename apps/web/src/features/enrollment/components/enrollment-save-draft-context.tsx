"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Bridge between a step form and the enrollment layout header.
 *
 * The "Save & finish later" handler lives INSIDE each step form (it needs the
 * form's `getValues()` + that step's save-draft mutation), but the top utility
 * row is rendered by the layout (the form's parent). Steps 1–3 register their
 * handler here via `useEnrollmentSaveDraft`; the layout header reads the
 * registration via `useEnrollmentSaveDraftRegistration` and renders the top
 * action only while one exists (steps 4/5 register nothing, so it hides).
 */
export type EnrollmentSaveDraftRegistration = Readonly<{
  /** Save the current values as a partial draft and return to the dashboard. */
  onSaveDraft: () => void;
  /** The draft save is in flight. */
  pending: boolean;
  /** Saving is temporarily unavailable (e.g. the step submit is in flight). */
  disabled: boolean;
}>;

type EnrollmentSaveDraftContextValue = Readonly<{
  registration: EnrollmentSaveDraftRegistration | null;
  registerSaveDraft: (
    registration: EnrollmentSaveDraftRegistration | null,
  ) => void;
}>;

const EnrollmentSaveDraftContext =
  createContext<EnrollmentSaveDraftContextValue | null>(null);

export function EnrollmentSaveDraftProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [registration, setRegistration] =
    useState<EnrollmentSaveDraftRegistration | null>(null);

  const value = useMemo(
    () => ({ registration, registerSaveDraft: setRegistration }),
    [registration],
  );

  return (
    <EnrollmentSaveDraftContext.Provider value={value}>
      {children}
    </EnrollmentSaveDraftContext.Provider>
  );
}

/**
 * Read the step's registered "Save & finish later" action (layout header
 * side). `null` when the current step offers no draft save.
 */
export function useEnrollmentSaveDraftRegistration(): EnrollmentSaveDraftRegistration | null {
  return useContext(EnrollmentSaveDraftContext)?.registration ?? null;
}

/**
 * Register this step's "Save & finish later" handler with the layout header
 * (step-form side). Re-registers when `pending`/`disabled` change and
 * unregisters on unmount. Safe to call outside the provider (e.g. a form
 * rendered standalone in tests) — it simply no-ops.
 */
export function useEnrollmentSaveDraft({
  disabled = false,
  onSaveDraft,
  pending = false,
}: Readonly<{
  disabled?: boolean;
  onSaveDraft: () => void;
  pending?: boolean;
}>): void {
  const registerSaveDraft = useContext(
    EnrollmentSaveDraftContext,
  )?.registerSaveDraft;

  // Step forms recreate the handler each render; route calls through a ref so
  // registration only churns when pending/disabled actually change.
  const onSaveDraftRef = useRef(onSaveDraft);
  useEffect(() => {
    onSaveDraftRef.current = onSaveDraft;
  });
  const stableOnSaveDraft = useCallback(() => {
    onSaveDraftRef.current();
  }, []);

  useEffect(() => {
    if (!registerSaveDraft) {
      return;
    }

    registerSaveDraft({ disabled, onSaveDraft: stableOnSaveDraft, pending });

    return () => {
      registerSaveDraft(null);
    };
  }, [disabled, pending, registerSaveDraft, stableOnSaveDraft]);
}
