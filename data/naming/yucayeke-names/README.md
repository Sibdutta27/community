# Yucayeke names — official Arawakan corrections

Client-delivered naming table for the ancestral yucayeke territories of Borikén.

| File                 | Role                                                                      |
| -------------------- | ------------------------------------------------------------------------- |
| `Yucayekes.xlsx`     | **As delivered by BTF.** Never edited — this is the provenance record.    |
| `yucayeke-names.csv` | **Derived, and the contract the code reads.** Diffable, machine-readable. |
| `README.md`          | This file.                                                                |

Delivered by the Taíno Nation of Borikén admin at the **2026-07-20** sync
(`docs/product/transcripts/2026-07-20-btf-sync.md`, ~00:13:50–00:16:12). It supersedes the
placeholder `OFFICIAL_YUCAYEKES` list in
`apps/api/src/modules/enrollment/common/config/yucayeke.config.ts`.

## Why it exists

Arawak is not a written language, so its words have been transcribed through Spanish, English,
Dutch, French and Portuguese orthography. Other Arawakan nations (Lokono, Wayuu, Baniwa) have
converged on **Arawakan corrections** — phonetic spellings that drop the colonial inflection.
BTF is adopting the same convention, so `Guania` becomes `Wainia`, `Daguao` becomes `Dawao`,
and the generic term `Yucayeke` becomes **`Yukayeke`**.

## Columns

`slug` is **our addition** — it is what joins this file to
`apps/web/src/features/yucayeke/content/territories.ts`. Everything else is the client's,
carried across verbatim.

| Column                | Meaning                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------- |
| `slug`                | Our canonical territory slug. `_generic` = the word "yucayeke" itself, not a territory. |
| `currentName`         | The spelling BTF used before this correction.                                           |
| `alternativeSpelling` | Other spellings seen in the record.                                                     |
| `legalName`           | **"Legal Names used by Taino Nation of Boriken"** — e.g. `Yukayeke Wainia`.             |
| `arawakanCorrection`  | The corrected bare name; sometimes 2–3 candidates.                                      |
| `phonetic`, `ipa`     | Pronunciation.                                                                          |
| `taino`…`wayuu`       | Cognates and glosses in related Arawakan languages.                                     |
| `resources`, `notes`  | The client's research notes and sourcing.                                               |

## The derivation rule

Applied mechanically to all 18 rows — no per-row judgement:

- **Primary display name** = `legalName` minus the `Yukayeke ` prefix (`Yukayeke Wainia` → `Wainia`).
- **Alternate spellings** = the remaining `arawakanCorrection` variants + `alternativeSpelling`.
  These are _rendered publicly_ under "Also known as".
- **Legacy names** (resolution-only, never rendered) = prior `apiNames`, cacique names, GIS
  spellings, and prior display names. These exist so values already stored in
  `Enrollment.yucayeke` keep resolving.

The suffix of `legalName` is always one of the `arawakanCorrection` candidates, which is what
makes the rule safe to apply mechanically.

## Rules for maintainers

- **Do not parse the `.xlsx` at build or test time.** No spreadsheet dependency, no
  non-deterministic build input. The CSV is the contract.
- Edits go to the CSV **and** get echoed back to the client — never silently diverge from what
  BTF believes is official.
- Parity tests assert CSV ↔ `territories.ts` ↔ `OFFICIAL_YUCAYEKES` agree. If you change one,
  the tests will tell you about the other two.

## Open questions with the client

1. **18 vs 21.** This sheet covers 18 territories. The app also carries **Guajataca** (which has
   a delivered GIS polygon), **Hayuya** and **Loquillo**, from the signed Yucayekeno Report.
   They are retained and still selectable pending BTF's answer: retire them, keep them as oral
   tradition, or correct them too?
2. **Guaynabo** appears on this sheet (as `Yukayeke Wainabo`), but our data had it as oral
   tradition — the GIS README notes it appears on _both_ the confirmed and unconfirmed lists of
   the Yucayekeno Report. This sheet is treated as settling it in favour of confirmed.
3. Whether `/yucayeke` URLs, the i18n namespaces and the product name should later adopt the
   `Yukayeke` spelling. Currently **user-facing copy only** — no identifier or domain renames.
