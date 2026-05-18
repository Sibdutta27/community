import type { ServiceCategoryApiItem } from "@/features/services/types/service";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";

export async function getServiceCategories(): Promise<
  ServiceCategoryApiItem[]
> {
  return apiConnector<ServiceCategoryApiItem[]>(
    "get",
    endpoints.SERVICES.CATEGORIES,
  );
}
