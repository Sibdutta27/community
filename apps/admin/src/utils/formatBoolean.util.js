/**
 * Format a nullable boolean the way a reviewer reads it.
 *
 * Null/undefined stays null so the caller can render its own "not provided"
 * fallback — an unanswered question and an answered "No" are different facts
 * about an application and must not collapse into the same word.
 */
export function formatBoolean(value) {
  if (value === true) {
    return "Yes";
  }

  if (value === false) {
    return "No";
  }

  return null;
}
