"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ServiceListCard } from "@/features/services/components/service-list-card";
import {
  getServiceCategoryPresentation,
  popularServicesContent,
} from "@/features/services/constants/services-content";
import {
  isRegisterServiceUnauthorizedError,
  useRegisterServiceMutation,
  useServiceCategoriesQuery,
  useServicesByCategoryQuery,
} from "@/features/services/hooks/service-queries";
import type {
  ServiceApiItem,
  ServiceCategoryApiItem,
} from "@/features/services/types/service";
import { appendNextQuery, SIGN_IN_PATH } from "@/lib/auth";

type PopularServicesSectionProps = Readonly<{
  initialCategories: ServiceCategoryApiItem[];
  initialRegisteredServiceIds: string[];
  initialServices: ServiceApiItem[];
  isAuthenticated: boolean;
}>;

const ALL_SERVICES_KEY = "all";
const requestedCategoryAliases: Record<string, readonly string[]> = {
  community_support: ["community_support", "support", "community-support"],
  education_training: ["education_training", "education", "education-training"],
  health: ["health", "health-wellness", "health_wellness"],
  legal: ["legal", "legal-assistance", "legal_assistance"],
  support: ["support", "community_support", "community-support"],
  education: ["education", "education_training", "education-training"],
};

function resolveSelectedCategoryKey(
  requestedCategoryKey: string | null,
  categories: readonly ServiceCategoryApiItem[],
) {
  if (!requestedCategoryKey || requestedCategoryKey === ALL_SERVICES_KEY) {
    return ALL_SERVICES_KEY;
  }

  const normalizedRequestedCategoryKey = requestedCategoryKey
    .trim()
    .toLowerCase();

  const exactCategory = categories.find(
    (category) =>
      category.key.trim().toLowerCase() === normalizedRequestedCategoryKey,
  );

  if (exactCategory) {
    return exactCategory.key;
  }

  const aliasesToMatch = new Set<string>([
    normalizedRequestedCategoryKey,
    ...(requestedCategoryAliases[normalizedRequestedCategoryKey] ?? []),
  ]);

  const aliasedCategory = categories.find((category) => {
    const normalizedCategoryKey = category.key.trim().toLowerCase();
    const normalizedCategoryName = category.name.trim().toLowerCase();

    return (
      aliasesToMatch.has(normalizedCategoryKey) ||
      aliasesToMatch.has(normalizedCategoryName.replaceAll(" & ", "_")) ||
      aliasesToMatch.has(normalizedCategoryName.replaceAll(" ", "_")) ||
      aliasesToMatch.has(normalizedCategoryName.replaceAll(" ", "-"))
    );
  });

  return aliasedCategory ? aliasedCategory.key : ALL_SERVICES_KEY;
}

export function PopularServicesSection({
  initialCategories,
  initialRegisteredServiceIds,
  initialServices,
  isAuthenticated,
}: PopularServicesSectionProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pendingServiceId, setPendingServiceId] = useState<string | null>(null);
  const [registeredServiceIds, setRegisteredServiceIds] = useState<string[]>(
    initialRegisteredServiceIds,
  );
  const categoryQuery = useServiceCategoriesQuery(initialCategories);
  const categories = categoryQuery.data ?? initialCategories;
  const requestedCategoryKey = searchParams.get("category");
  const [selectedCategoryKey, setSelectedCategoryKey] = useState(() =>
    resolveSelectedCategoryKey(requestedCategoryKey, initialCategories),
  );
  const filteredServicesQuery = useServicesByCategoryQuery(
    selectedCategoryKey === ALL_SERVICES_KEY ? null : selectedCategoryKey,
  );
  const registerMutation = useRegisterServiceMutation();
  const services = useMemo(() => {
    if (selectedCategoryKey === ALL_SERVICES_KEY) {
      return initialServices;
    }

    return filteredServicesQuery.data ?? [];
  }, [filteredServicesQuery.data, initialServices, selectedCategoryKey]);

  useEffect(() => {
    const nextSelectedCategoryKey = resolveSelectedCategoryKey(
      requestedCategoryKey,
      categories,
    );

    setSelectedCategoryKey((currentCategoryKey) =>
      currentCategoryKey === nextSelectedCategoryKey
        ? currentCategoryKey
        : nextSelectedCategoryKey,
    );
  }, [categories, requestedCategoryKey]);

  async function handleRegister(serviceId: string) {
    if (
      registeredServiceIds.includes(serviceId) ||
      pendingServiceId === serviceId
    ) {
      return;
    }

    if (!isAuthenticated) {
      router.push(appendNextQuery(SIGN_IN_PATH, pathname));
      return;
    }

    setPendingServiceId(serviceId);

    try {
      await registerMutation.mutateAsync(serviceId);
      setRegisteredServiceIds((currentIds) =>
        currentIds.includes(serviceId)
          ? currentIds
          : [...currentIds, serviceId],
      );
    } catch (error) {
      if (isRegisterServiceUnauthorizedError(error)) {
        router.push(appendNextQuery(SIGN_IN_PATH, pathname));
        return;
      }

      console.error(error);
    } finally {
      setPendingServiceId((currentId) =>
        currentId === serviceId ? null : currentId,
      );
    }
  }

  return (
    <section
      id="popular-services"
      className="bg-surface py-10 sm:py-12 lg:py-14"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-foreground text-[1.6rem] leading-tight font-semibold tracking-tight sm:text-[1.95rem] lg:text-[2.4rem]">
            {popularServicesContent.title}
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-3xl text-[0.92rem] leading-6 sm:text-[0.98rem] sm:leading-7">
            {popularServicesContent.description}
          </p>
        </div>

        <div className="mt-5 max-w-full overflow-x-auto overscroll-x-contain py-2">
          <div className="flex min-w-max justify-center gap-2.5 lg:min-w-0">
            <Button
              aria-pressed={selectedCategoryKey === ALL_SERVICES_KEY}
              size="sm"
              type="button"
              variant={
                selectedCategoryKey === ALL_SERVICES_KEY ? "primary" : "outline"
              }
              onClick={() => setSelectedCategoryKey(ALL_SERVICES_KEY)}
            >
              All Services
            </Button>

            {categories.map((category) => {
              const presentation = getServiceCategoryPresentation(category);

              return (
                <Button
                  key={category.id}
                  aria-pressed={selectedCategoryKey === category.key}
                  size="sm"
                  type="button"
                  variant={
                    selectedCategoryKey === category.key ? "primary" : "outline"
                  }
                  onClick={() => setSelectedCategoryKey(category.key)}
                >
                  {presentation.title}
                </Button>
              );
            })}
          </div>
        </div>

        {filteredServicesQuery.isLoading ? (
          <p className="text-muted-foreground mt-5 text-sm">
            Loading services...
          </p>
        ) : null}

        {services.length > 0 ? (
          <div className="mx-auto mt-5 grid max-w-5xl gap-4 lg:grid-cols-2">
            {services.map((service) => (
              <ServiceListCard
                key={service.id}
                isRegistered={registeredServiceIds.includes(service.id)}
                isRegistering={pendingServiceId === service.id}
                service={service}
                onRegister={() => void handleRegister(service.id)}
              />
            ))}
          </div>
        ) : (
          <div className="border-border bg-surface-muted/60 text-muted-foreground mt-5 rounded-2xl border px-5 py-4 text-[0.9rem]">
            No services are available for this category right now.
          </div>
        )}
      </div>
    </section>
  );
}
