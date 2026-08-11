/**
 * A tiny window-level bus for opening the feedback widget.
 *
 * The widget is mounted once at the root layout, while the surfaces that open
 * it (today the support section's "chat" card, tomorrow anywhere else) live
 * deep in unrelated trees — several of them server components. A DOM event
 * lets any client component ask for the panel without threading a provider
 * through every layout, and it is a no-op during SSR.
 */
const FEEDBACK_OPEN_EVENT = "community:feedback:open";

/** Ask the mounted feedback widget to open its panel. */
export function openFeedbackWidget() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(FEEDBACK_OPEN_EVENT));
}

/** Listen for open requests. Returns the unsubscribe function. */
export function subscribeToFeedbackWidget(handler: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(FEEDBACK_OPEN_EVENT, handler);

  return () => window.removeEventListener(FEEDBACK_OPEN_EVENT, handler);
}
