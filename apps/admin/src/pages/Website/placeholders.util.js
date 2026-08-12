/**
 * ICU arguments (`{name}`) and rich-text tags (`<highlight>`) a message
 * declares.
 *
 * Mirrors `apps/api/src/modules/content/content.util.ts`. The server is the
 * authority — it refuses a mismatched save regardless of what happens here —
 * but repeating the check in the editor means the problem shows up beside the
 * field being typed in rather than as a toast after the fact.
 */
export function extractPlaceholders(value) {
  if (typeof value !== "string") {
    return [];
  }

  const tokens = new Set();

  for (const match of value.matchAll(/\{\s*(\w+)/g)) {
    tokens.add(`{${match[1]}}`);
  }

  for (const match of value.matchAll(/<(\w+)>/g)) {
    tokens.add(`<${match[1]}>`);
  }

  return [...tokens].sort();
}

/**
 * Tokens the default declares that the candidate has dropped.
 *
 * Dropping one is not a typo: next-intl throws when a message references an
 * argument that was not supplied, so the page stops rendering.
 */
export function missingPlaceholders(defaultValue, candidate) {
  if (typeof candidate !== "string" || candidate.trim() === "") {
    return [];
  }

  const actual = extractPlaceholders(candidate);

  return extractPlaceholders(defaultValue).filter(
    (token) => !actual.includes(token),
  );
}
