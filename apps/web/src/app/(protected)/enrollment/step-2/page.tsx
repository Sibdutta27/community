import { EnrollmentStepTwoForm } from "@/features/enrollment/components/enrollment-step-two-form";
import { EnrollmentStepLayout } from "@/features/enrollment/components/enrollment-step-layout";

export default function EnrollmentStep2Page() {
  return (
    <EnrollmentStepLayout step={2}>
      <EnrollmentStepTwoForm />
    </EnrollmentStepLayout>
  );
}
