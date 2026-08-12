import { api } from "./client";

/**
 * Website Studio — yukayeke territories.
 *
 * The list is the whole catalog, not just the edited rows: the Studio has no
 * copy of the territory table, so the values it is overriding travel with the
 * overrides. 21 records is one payload.
 */
export async function getTerritories() {
  const response = await api.get("/admin/content/territories");

  return response.data;
}

/**
 * Save one territory's edits.
 *
 * A territory has no draft column to park an edit in, so this IS a publish —
 * the change is on the site as soon as it saves. Only the five editable fields
 * are ever sent; the server rejects anything else.
 */
export async function saveTerritoryOverride({
  slug,
  displayName,
  cacique,
  altNames,
  municipalities,
  status,
}) {
  const response = await api.put(
    `/admin/content/territories/${encodeURIComponent(slug)}`,
    { displayName, cacique, altNames, municipalities, status },
  );

  return response.data;
}

/**
 * Drop every edit for one territory — it returns to the values in the code.
 */
export async function revertTerritoryOverride(slug) {
  const response = await api.delete(
    `/admin/content/territories/${encodeURIComponent(slug)}`,
  );

  return response.data;
}
