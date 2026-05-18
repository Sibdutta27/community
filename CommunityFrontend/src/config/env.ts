const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

if (!apiBaseUrl) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
}

export const env = {
  apiBaseUrl,
  isDevelopment: process.env.NODE_ENV === "development",
} as const;
