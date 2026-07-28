"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import type { TerritoryFeatureCollection } from "./geometry";

export const yucayekeMapQueryKeys = {
  geometry: ["yucayeke-map", "geometry"] as const,
};

/**
 * Territory boundary GeoJSON, served as a static asset from
 * `public/geo/` (same-origin, immutable per deploy) — so plain `fetch`,
 * not the BFF `requestJson` helper, and cached forever in the client.
 */
export function useYucayekeGeometryQuery() {
  const t = useTranslations("yucayekeMap");

  return useQuery({
    queryKey: yucayekeMapQueryKeys.geometry,
    queryFn: async (): Promise<TerritoryFeatureCollection> => {
      const response = await fetch("/geo/yucayeke-boundaries.json");
      if (!response.ok) {
        throw new Error(t("states.error"));
      }
      return (await response.json()) as TerritoryFeatureCollection;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
