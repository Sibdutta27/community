import { EnrollmentStepThreeForm } from "@/features/enrollment/components/enrollment-step-three-form";
import { EnrollmentStepLayout } from "@/features/enrollment/components/enrollment-step-layout";

export default function EnrollmentStep3Page() {
  return (
    <EnrollmentStepLayout step={3}>
      <EnrollmentStepThreeForm />
    </EnrollmentStepLayout>
  );
}
