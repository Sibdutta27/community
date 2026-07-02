import { EnrollmentStepFourForm } from "@/features/enrollment/components/enrollment-step-four-form";
import { EnrollmentStepLayout } from "@/features/enrollment/components/enrollment-step-layout";

export default function EnrollmentStep4Page() {
  return (
    <EnrollmentStepLayout step={4}>
      <EnrollmentStepFourForm />
    </EnrollmentStepLayout>
  );
}
