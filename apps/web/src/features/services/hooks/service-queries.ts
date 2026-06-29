"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import type {
  ServiceApiItem,
  ServiceCategoryApiItem,
  ServiceRegisterRequest,
  ServiceRegisterResponse,
} from "@/features/services/types/service";
import { requestJson } from "@/services/http/fetcher";

export const serviceQueryKeys = {
  categories: ["services", "categories"] as const,
  categoryServices: (categoryKey: string) =>
    ["services", "category", categoryKey] as const,
};

type ServiceRegisterError = Error & {
  status?: number;
};

async function registerService(serviceId: string) {
  const fallbackMessage = "Unable to register for this service right now.";

  try {
    const response = await fetch("/api/services/register", {
      body: JSON.stringify({
        serviceId,
      } satisfies ServiceRegisterRequest),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const data = (await response.json().catch(() => null)) as
      | ({ message?: string } & Partial<ServiceRegisterResponse>)
      | null;

    if (!response.ok) {
      const error = new Error(
        data?.message ?? fallbackMessage,
      ) as ServiceRegisterError;
      error.status = response.status;
      throw error;
    }

    return (data ?? {
      message: "Registered to service successfully",
      success: true,
    }) as ServiceRegisterResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(fallbackMessage);
  }
}

export function useServiceCategoriesQuery(
  initialData: ServiceCategoryApiItem[],
) {
  return useQuery({
    queryKey: serviceQueryKeys.categories,
    queryFn: () =>
      requestJson<ServiceCategoryApiItem[]>("/api/services/categories", {
        fallbackMessage: "Unable to load service categories right now.",
      }),
    initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useServicesByCategoryQuery(categoryKey: string | null) {
  return useQuery({
    queryKey: serviceQueryKeys.categoryServices(categoryKey ?? "all"),
    queryFn: () =>
      requestJson<ServiceApiItem[]>(
        `/api/services?category=${encodeURIComponent(categoryKey ?? "")}`,
        {
          fallbackMessage:
            "Unable to load services for this category right now.",
        },
      ),
    enabled: Boolean(categoryKey),
    staleTime: 60 * 1000,
  });
}

export function useRegisterServiceMutation() {
  return useMutation({
    mutationFn: registerService,
  });
}

export function isRegisterServiceUnauthorizedError(error: unknown) {
  return (
    error instanceof Error &&
    "status" in error &&
    typeof (error as ServiceRegisterError).status === "number" &&
    (error as ServiceRegisterError).status === 401
  );
}
