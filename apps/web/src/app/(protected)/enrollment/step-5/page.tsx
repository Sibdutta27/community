import { EnrollmentConfirmationForm } from "@/features/enrollment/components/enrollment-confirmation-form";
import { EnrollmentStepLayout } from "@/features/enrollment/components/enrollment-step-layout";

export default function EnrollmentStep5Page() {
  return (
    <EnrollmentStepLayout step={5}>
      <EnrollmentConfirmationForm />
    </EnrollmentStepLayout>
  );
}
