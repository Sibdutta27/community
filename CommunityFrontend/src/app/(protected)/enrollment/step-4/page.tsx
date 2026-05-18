import { notFound } from "next/navigation";

import { EnrollmentProgressSection } from "@/features/enrollment/components/enrollment-progress-section";
import { EnrollmentStepFourForm } from "@/features/enrollment/components/enrollment-step-four-form";
import { EnrollmentStepHero } from "@/features/enrollment/components/enrollment-step-hero";
import { getEnrollmentStepDefinition } from "@/features/enrollment/config/enrollment-steps";

const totalSteps = 4;

export default function EnrollmentStep4Page() {
  const step = getEnrollmentStepDefinition(4);

  if (!step) {
    notFound();
  }

  return (
    <>
      <EnrollmentStepHero
        className="-mx-4 sm:-mx-6 lg:-mx-8"
        description="Upload identity and lineage documents required for enrollment review and final verification."
        step={step.step}
        title={step.title}
        totalSteps={totalSteps}
      />
      <EnrollmentProgressSection
        className="-mx-4 sm:-mx-6 lg:-mx-8"
        currentStage={step.step}
      />
      <section className="-mx-4 bg-[#FFFDEC] sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8">
          <EnrollmentStepFourForm />
        </div>
      </section>
    </>
  );
}
