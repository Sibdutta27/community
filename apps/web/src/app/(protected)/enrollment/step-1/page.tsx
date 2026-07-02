import { EnrollmentStepOneForm } from "@/features/enrollment/components/enrollment-step-one-form";
import { EnrollmentStepLayout } from "@/features/enrollment/components/enrollment-step-layout";

export default function EnrollmentStep1Page() {
  return (
    <EnrollmentStepLayout step={1}>
      <EnrollmentStepOneForm />
    </EnrollmentStepLayout>
  );
}
