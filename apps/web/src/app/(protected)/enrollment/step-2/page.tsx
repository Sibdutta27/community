import { notFound } from "next/navigation";

import { EnrollmentProgressSection } from "@/features/enrollment/components/enrollment-progress-section";
import { EnrollmentStepHero } from "@/features/enrollment/components/enrollment-step-hero";
import { EnrollmentStepTwoForm } from "@/features/enrollment/components/enrollment-step-two-form";
import {
  enrollmentTotalSteps,
  getEnrollmentStepDefinition,
} from "@/features/enrollment/config/enrollment-steps";

export default function EnrollmentStep2Page() {
  const step = getEnrollmentStepDefinition(2);

  if (!step) {
    notFound();
  }

  return (
    <>
      <EnrollmentStepHero
        className="-mx-4 sm:-mx-6 lg:-mx-8"
        description="Document your mother and maternal grandparents to continue your enrollment journey and support your kinship claim."
        step={step.step}
        title="Maternal Kinship"
        totalSteps={enrollmentTotalSteps}
      />
      <EnrollmentProgressSection
        className="-mx-4 sm:-mx-6 lg:-mx-8"
        currentStage={step.step}
      />
      <section className="-mx-4 bg-background sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8">
          <EnrollmentStepTwoForm />
        </div>
      </section>
    </>
  );
}
