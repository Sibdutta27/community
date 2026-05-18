import { getBackendAuthHeaders } from "@/app/api/_shared/backend-auth";
import type { ServiceRegistrationApiItem } from "@/features/services/types/service";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";

export async function getRegisteredServices(): Promise<
  ServiceRegistrationApiItem[]
> {
  const authHeaders = await getBackendAuthHeaders();

  if (!authHeaders) {
    return [];
  }

  return apiConnector<ServiceRegistrationApiItem[]>(
    "post",
    endpoints.SERVICES.REGISTER_LIST,
    undefined,
    authHeaders,
  );
}
