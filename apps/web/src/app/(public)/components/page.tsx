import { redirect } from "next/navigation";

/**
 * The old component showcase grew into the full brand kit. Keep the URL
 * alive for bookmarks, but the living style guide now lives at /brand-kit.
 */
export default function ComponentsPage() {
  redirect("/brand-kit");
}
