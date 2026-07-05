import type { Metadata } from "next";

import { BrandKitPage } from "@/features/brand-kit/components/brand-kit-page";

export const metadata: Metadata = {
  title: "Brand Kit",
  description:
    "The living style guide for the member-facing app — palette, typography, spacing, components, patterns and motion.",
};

export default function BrandKitRoute() {
  return <BrandKitPage />;
}
