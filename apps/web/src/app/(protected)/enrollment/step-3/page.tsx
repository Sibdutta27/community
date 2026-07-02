import { notFound } from "next/navigation";

import { EnrollmentProgressSection } from "@/features/enrollment/components/enrollment-progress-section";
import { EnrollmentStepHero } from "@/features/enrollment/components/enrollment-step-hero";
import { EnrollmentStepThreeForm } from "@/features/enrollment/components/enrollment-step-three-form";
import {
  enrollmentTotalSteps,
  getEnrollmentStepDefinition,
} from "@/features/enrollment/config/enrollment-steps";

export default function EnrollmentStep3Page() {
  const step = getEnrollmentStepDefinition(3);

  if (!step) {
    notFound();
  }

  return (
    <>
      <EnrollmentStepHero
        className="-mx-4 sm:-mx-6 lg:-mx-8"
        description="Document your father and paternal grandparents to complete the kinship record for your enrollment review."
        step={step.step}
        title="Paternal Kinship"
        totalSteps={enrollmentTotalSteps}
      />
      <EnrollmentProgressSection
        className="-mx-4 sm:-mx-6 lg:-mx-8"
        currentStage={step.step}
      />
      <section className="-mx-4 bg-background sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8">
          <EnrollmentStepThreeForm />
        </div>
      </section>
    </>
  );
}
