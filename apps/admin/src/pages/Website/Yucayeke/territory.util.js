/**
 * The two editorial judgements the site knows how to draw. A third value would
 * render an unstyled badge on the public page — the server refuses one too.
 */
export const TERRITORY_STATUS_OPTIONS = [
  { value: "confirmed", label: "Historically documented" },
  { value: "oralTradition", label: "Oral tradition" },
];

export function statusLabel(value) {
  return (
    TERRITORY_STATUS_OPTIONS.find((option) => option.value === value)?.label ??
    value
  );
}

/**
 * What the public site will actually show for one territory.
 *
 * Mirrors `applyTerritoryOverride` on the web side, and must keep agreeing
 * with it — most importantly on empty values. Blank text and empty lists mean
 * "not set", never "erase": a row saved to change only the cacique arrives
 * with empty lists, and treating that as an erasure would wipe a territory's
 * municipalities off the site as a side effect of an unrelated edit.
 */
export function effectiveValues(entry) {
  const base = entry.base;
  const override = entry.override;

  return {
    displayName: text(override?.displayName) ?? base.displayName,
    cacique: text(override?.cacique) ?? base.cacique,
    altNames: list(override?.altNames) ?? base.altNames,
    municipalities: list(override?.municipalities) ?? base.municipalities,
    status: override?.status || base.status,
  };
}

/** Which of the five editable fields differ from what the code ships. */
export function editedFields(entry) {
  const base = entry.base;
  const effective = effectiveValues(entry);

  const changed = [];

  if (effective.displayName !== base.displayName) changed.push("Name");
  if (effective.cacique !== base.cacique) changed.push("Cacique");
  if (!sameList(effective.altNames, base.altNames))
    changed.push("Also known as");
  if (!sameList(effective.municipalities, base.municipalities)) {
    changed.push("Municipalities");
  }
  if (effective.status !== base.status) changed.push("Status");

  return changed;
}

/**
 * The request body for a save — only the fields that genuinely differ from
 * what the code ships.
 *
 * Storing a value identical to the code's would be worse than storing nothing:
 * the row would keep shadowing that field forever, so a later correction in
 * `territories.ts` would never reach the site and nothing would say why.
 */
export function buildSavePayload(form, base) {
  const displayName = form.displayName.trim();
  const cacique = form.cacique.trim();

  const payload = {
    displayName: displayName === base.displayName ? undefined : displayName,
    cacique: cacique === (base.cacique ?? "") ? undefined : cacique,
    altNames: sameList(form.altNames, base.altNames) ? [] : form.altNames,
    municipalities: sameList(form.municipalities, base.municipalities)
      ? []
      : form.municipalities,
    status: form.status === base.status ? undefined : form.status,
  };

  const overridesAnything =
    payload.displayName !== undefined ||
    payload.cacique !== undefined ||
    payload.altNames.length > 0 ||
    payload.municipalities.length > 0 ||
    payload.status !== undefined;

  return { payload, overridesAnything };
}

function text(value) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  return trimmed === "" ? null : trimmed;
}

function list(value) {
  if (!Array.isArray(value) || value.length === 0) return null;

  return value;
}

function sameList(a = [], b = []) {
  return a.length === b.length && a.every((entry, index) => entry === b[index]);
}
