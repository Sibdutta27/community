import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosRequestHeaders,
  type Method,
} from "axios";

import { env } from "@/config/env";
import type { ApiError } from "@/types/api";

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 300_000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => Promise.reject(error),
);

export async function apiConnector<T>(
  method: Method,
  url: string,
  data?: AxiosRequestConfig["data"],
  headers?: AxiosRequestHeaders,
  config?: Omit<AxiosRequestConfig, "method" | "url" | "data" | "headers">,
): Promise<T> {
  const response = await apiClient.request<T>({
    method,
    url,
    data,
    headers,
    ...config,
  });

  return response.data;
}

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiError>(error)) {
    return error.response?.data?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}
