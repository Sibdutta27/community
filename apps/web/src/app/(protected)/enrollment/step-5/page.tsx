import { notFound } from "next/navigation";

import { EnrollmentConfirmationForm } from "@/features/enrollment/components/enrollment-confirmation-form";
import { EnrollmentProgressSection } from "@/features/enrollment/components/enrollment-progress-section";
import { EnrollmentStepHero } from "@/features/enrollment/components/enrollment-step-hero";
import {
  enrollmentTotalSteps,
  getEnrollmentStepDefinition,
} from "@/features/enrollment/config/enrollment-steps";

export default function EnrollmentStep5Page() {
  const step = getEnrollmentStepDefinition(5);

  if (!step) {
    notFound();
  }

  return (
    <>
      <EnrollmentStepHero
        className="-mx-4 sm:-mx-6 lg:-mx-8"
        description="Sign your application electronically and submit it to the council for enrollment review."
        step={step.step}
        title={step.title}
        totalSteps={enrollmentTotalSteps}
      />
      <EnrollmentProgressSection
        className="-mx-4 sm:-mx-6 lg:-mx-8"
        currentStage={step.step}
      />
      <section className="-mx-4 bg-background sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8">
          <EnrollmentConfirmationForm />
        </div>
      </section>
    </>
  );
}
