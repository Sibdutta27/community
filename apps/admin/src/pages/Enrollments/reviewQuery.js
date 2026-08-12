/**
 * Shared query options for the enrollment review steps.
 *
 * An applicant who simply hasn't filled in a step yet makes the API answer
 * 400 "Step N not completed yet". That is a normal, expected state for a DRAFT
 * enrollment — but TanStack retries three times with backoff by default, so
 * that 400 sat behind a full-page loading skeleton for several seconds before
 * saying anything at all. A 4xx will never come good on a retry.
 *
 * See `StepUnavailable` for how the resulting error is presented.
 */
export function reviewQuery(queryKey, queryFn) {
  return {
    queryKey,
    queryFn,
    // Client errors are answers, not failures — take them at face value.
    retry: (failureCount, error) => {
      const status = error?.response?.status;

      if (status >= 400 && status < 500) {
        return false;
      }

      return failureCount < 2;
    },
  };
}

/** True when the API said "this step has not been completed yet". */
export function isIncompleteStep(error) {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;

  return status === 400 && /not completed yet/i.test(message || "");
}
