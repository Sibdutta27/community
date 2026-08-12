"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { TERRITORIES, type Territory } from "../content/territories";
import {
  applyTerritoryOverride,
  applyTerritoryOverrides,
  NO_TERRITORY_OVERRIDES,
  type TerritoryOverrideMap,
} from "./apply-territory-override";

/**
 * The render boundary for Website Studio territory edits.
 *
 * The overrides ride in on the same cached `/content/messages` fetch that
 * feeds next-intl (see `i18n/content-overrides.ts`) and are handed down from
 * the root layout. They stop here: nothing puts them back into
 * `territories.ts`, so `resolveTerritory` keeps answering from git and an
 * edited alias can never collide its way into another yucayeke's lookup.
 *
 * Defaults to nothing overridden, so a component rendered outside the provider
 * — a test, a story — shows exactly what the code ships.
 */
const TerritoryOverridesContext = createContext<TerritoryOverrideMap>(
  NO_TERRITORY_OVERRIDES,
);

type TerritoryOverridesProviderProps = Readonly<{
  value: TerritoryOverrideMap;
  children: ReactNode;
}>;

export function TerritoryOverridesProvider({
  value,
  children,
}: TerritoryOverridesProviderProps) {
  return (
    <TerritoryOverridesContext value={value}>
      {children}
    </TerritoryOverridesContext>
  );
}

export function useTerritoryOverrides(): TerritoryOverrideMap {
  return useContext(TerritoryOverridesContext);
}

/**
 * One territory as it should be DISPLAYED. Pass the canonical record in; keep
 * using the canonical record for slugs, geometry keys and selection state.
 */
export function useTerritoryView(territory: Territory): Territory;
export function useTerritoryView(territory: Territory | null): Territory | null;
export function useTerritoryView(
  territory: Territory | null,
): Territory | null {
  const overrides = useTerritoryOverrides();

  return useMemo(
    () =>
      territory === null
        ? null
        : applyTerritoryOverride(territory, overrides[territory.slug]),
    [territory, overrides],
  );
}

/** The whole catalog as it should be displayed, in catalog order. */
export function useTerritoryViews(): readonly Territory[] {
  const overrides = useTerritoryOverrides();

  return useMemo(
    () => applyTerritoryOverrides(TERRITORIES, overrides),
    [overrides],
  );
}
