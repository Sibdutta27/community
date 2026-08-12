import { useQuery } from "@tanstack/react-query";
import { getServiceCategories } from "@/api/serviceCat.api";

/**
 * Get service category query
 */
export function useServiceCategory(params = {}) {
  return useQuery({
    queryKey: ["service-categories", { params }],

    queryFn: () => getServiceCategories(params),
  });
}
