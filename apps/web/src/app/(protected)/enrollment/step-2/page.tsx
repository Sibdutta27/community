import { notFound } from "next/navigation";

import { EnrollmentProgressSection } from "@/features/enrollment/components/enrollment-progress-section";
import { EnrollmentStepHero } from "@/features/enrollment/components/enrollment-step-hero";
import { EnrollmentStepTwoForm } from "@/features/enrollment/components/enrollment-step-two-form";
import { getEnrollmentStepDefinition } from "@/features/enrollment/config/enrollment-steps";

const totalSteps = 4;

export default function EnrollmentStep2Page() {
  const step = getEnrollmentStepDefinition(2);

  if (!step) {
    notFound();
  }

  return (
    <>
      <EnrollmentStepHero
        className="-mx-4 sm:-mx-6 lg:-mx-8"
        description="Document your maternal ancestry and family history to continue your enrollment journey and prepare for supporting document submission."
        step={step.step}
        title="Maternal Lineage Documentation"
        totalSteps={totalSteps}
      />
      <EnrollmentProgressSection
        className="-mx-4 sm:-mx-6 lg:-mx-8"
        currentStage={step.step}
      />
      <section className="-mx-4 bg-[#FFFDEC] sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8">
          <EnrollmentStepTwoForm />
        </div>
      </section>
    </>
  );
}
