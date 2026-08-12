import { Alert } from "@mui/material";

import { isIncompleteStep } from "./reviewQuery";

/**
 * What to show when a review step won't load.
 *
 * Every step component used to render any failure as "Failed to load … data"
 * in red — including the routine 400 the API returns for a step the applicant
 * simply hasn't filled in yet. That tells a reviewer the system is broken when
 * in fact the application is just incomplete, which is exactly the thing they
 * need to know. A calm "nothing here yet" for that case; a real error only
 * when something actually broke.
 */
export default function StepUnavailable({ error, what }) {
  if (isIncompleteStep(error)) {
    return (
      <Alert severity="info">
        The applicant has not completed this step yet, so there is nothing to
        review here.
      </Alert>
    );
  }

  return (
    <Alert severity="error">Could not load the {what}. Try reloading.</Alert>
  );
}
