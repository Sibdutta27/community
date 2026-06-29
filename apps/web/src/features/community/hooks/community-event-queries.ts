"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import type {
  CommunityEventApiItem,
  CommunityEventCategory,
  CommunityEventRegisterRequest,
  CommunityEventRegisterResponse,
} from "@/features/community/types/community-event";
import { requestJson } from "@/services/http/fetcher";

export const communityEventQueryKeys = {
  categories: ["community", "events", "categories"] as const,
  categoryEvents: (categoryKey: string) =>
    ["community", "events", "category", categoryKey] as const,
};

type CommunityEventRegisterError = Error & {
  status?: number;
};

async function registerCommunityEvent(eventId: string) {
  const fallbackMessage = "Unable to register for this event right now.";

  try {
    const response = await fetch("/api/events/register", {
      body: JSON.stringify({
        eventId,
      } satisfies CommunityEventRegisterRequest),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const data = (await response.json().catch(() => null)) as
      | ({ message?: string } & Partial<CommunityEventRegisterResponse>)
      | null;

    if (!response.ok) {
      const error = new Error(
        data?.message ?? fallbackMessage,
      ) as CommunityEventRegisterError;
      error.status = response.status;
      throw error;
    }

    return (data ?? {
      message: "Event registered successfully",
      success: true,
    }) as CommunityEventRegisterResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(fallbackMessage);
  }
}

export function useCommunityEventCategoriesQuery(
  initialData: CommunityEventCategory[],
) {
  return useQuery({
    queryKey: communityEventQueryKeys.categories,
    queryFn: () =>
      requestJson<CommunityEventCategory[]>("/api/events/categories", {
        fallbackMessage: "Unable to load event categories right now.",
      }),
    initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCommunityEventsByCategoryQuery(categoryKey: string | null) {
  return useQuery({
    queryKey: communityEventQueryKeys.categoryEvents(categoryKey ?? "all"),
    queryFn: () =>
      requestJson<CommunityEventApiItem[]>(
        `/api/events?category=${encodeURIComponent(categoryKey ?? "")}`,
        {
          fallbackMessage:
            "Unable to load the selected category events right now.",
        },
      ),
    enabled: Boolean(categoryKey),
    staleTime: 60 * 1000,
  });
}

export function useRegisterCommunityEventMutation() {
  return useMutation({
    mutationFn: registerCommunityEvent,
  });
}

export function isRegisterCommunityEventUnauthorizedError(error: unknown) {
  return (
    error instanceof Error &&
    "status" in error &&
    typeof (error as CommunityEventRegisterError).status === "number" &&
    (error as CommunityEventRegisterError).status === 401
  );
}
