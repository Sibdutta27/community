import { SupportSection } from "@/components/shared/support-section";

import { ContactHero } from "./contact-hero";

export function ContactPageContent() {
  return (
    <main className="bg-background">
      <ContactHero />
      <SupportSection />
    </main>
  );
}
