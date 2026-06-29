import type { ServiceApiItem } from "@/features/services/types/service";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";

export function sortServicesByAvailability(services: ServiceApiItem[]) {
  return [...services].sort((left, right) => {
    const leftRank = left.status === "ACTIVE" ? 0 : 1;
    const rightRank = right.status === "ACTIVE" ? 0 : 1;

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    return (
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );
  });
}

export async function getServices(
  category?: string | null,
): Promise<ServiceApiItem[]> {
  const services = await apiConnector<ServiceApiItem[]>(
    "get",
    endpoints.SERVICES.LIST,
    undefined,
    undefined,
    {
      params: category ? { category } : undefined,
    },
  );

  return sortServicesByAvailability(services);
}
