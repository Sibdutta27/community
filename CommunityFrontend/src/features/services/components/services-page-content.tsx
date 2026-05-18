import { getServiceCategories } from "@/features/services/api/get-service-categories";
import { getRegisteredServices } from "@/features/services/api/get-registered-services";
import { getServices } from "@/features/services/api/get-services";
import { PopularServicesSection } from "@/features/services/components/popular-services-section";
import { ServicesCategoriesSection } from "@/features/services/components/services-categories-section";
import { ServicesHero } from "@/features/services/components/services-hero";
import { getSessionUser } from "@/lib/auth-session";

export async function ServicesPageContent() {
  const [categories, services, sessionUser] = await Promise.all([
    getServiceCategories(),
    getServices(),
    getSessionUser(),
  ]);
  const registeredServices = sessionUser ? await getRegisteredServices() : [];
  const initialRegisteredServiceIds = registeredServices.map(
    (serviceRegistration) => serviceRegistration.serviceId,
  );

  return (
    <main className="bg-background">
      <ServicesHero />
      <ServicesCategoriesSection categories={categories} />
      <PopularServicesSection
        initialCategories={categories}
        initialRegisteredServiceIds={initialRegisteredServiceIds}
        initialServices={services}
        isAuthenticated={Boolean(sessionUser)}
      />
    </main>
  );
}
