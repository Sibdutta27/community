import { notFound } from "next/navigation";

import { EnrollmentStepHero } from "@/features/enrollment/components/enrollment-step-hero";
import { EnrollmentProgressSection } from "@/features/enrollment/components/enrollment-progress-section";
import { EnrollmentStepOneForm } from "@/features/enrollment/components/enrollment-step-one-form";
import { getEnrollmentStepDefinition } from "@/features/enrollment/config/enrollment-steps";

const totalSteps = 4;

export default function EnrollmentStep1Page() {
  const step = getEnrollmentStepDefinition(1);

  if (!step) {
    notFound();
  }

  return (
    <>
      <EnrollmentStepHero
        className="-mx-4 sm:-mx-6 lg:-mx-8"
        description="Provide the personal, contact, and address details needed to begin your enrollment application and establish your official member record."
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
          <EnrollmentStepOneForm />
        </div>
      </section>
    </>
  );
}
