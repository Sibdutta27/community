import type { Metadata } from "next";

import { EnrollmentSuccess } from "@/features/enrollment/components/enrollment-success";

export const metadata: Metadata = {
  title: "Application Submitted",
};

export default function EnrollmentSuccessPage() {
  return <EnrollmentSuccess className="-mx-4 sm:-mx-6 lg:-mx-8" />;
}
