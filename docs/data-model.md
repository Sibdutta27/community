# Data Model (Prisma)

Source of truth: `apps/api/prisma/schema.prisma`. Postgres; client generated to
`apps/api/src/generated/prisma`. Keep this file in sync after migrations
(`community-kb refresh backend`).

The datasource declares no `url` — the connection is supplied at runtime by the
`PrismaPg` adapter (`DatabaseService`), which also selects the Postgres **schema**
from `DATABASE_SCHEMA` (unset => `public`). Same for `prisma/seed/seed.ts` and the
one-off scripts under `prisma/scripts/`.

## Core entities & relations

```
User 1───1 Enrollment 1───1 Contact
 │            │        1───* EnrollmentStep     (unique per [enrollmentId, stepNumber])
 │            │        1───* Ancestry           (unique per [enrollmentId, relation])
 │            │        *───* Consent            (via EnrollmentConsent)
 │            └───* Document
 ├───* Document
 ├───* Feedback                                 (userId nullable — signed-out submits)
 ├───* ServiceRegistration *───1 Service *───1 ServiceCategory
 └───* EventRegistration   *───1 Event   *───1 EventCategory

CulturalConnection — standalone lookup table (the enrollment join was dropped in
                     the Figma rebuild; no relation to Enrollment remains)
```

## Models

- **User** — `id` (uuid), `serial` (BigInt autoincrement, unique), `publicId?` (unique),
  `name?`, `email` (unique), `password`, `role` (default USER), `lastActiveAt?`. One optional
  `Enrollment`; many `Document`, `Feedback`, `ServiceRegistration`, `EventRegistration`.
- **Enrollment** — `userId` (unique), `status` (default DRAFT). Flat personal fields:
  `firstName?`, `lastName?`, `dateOfBirth?`, birth place (`cityOfBirth`,
  `municipalityOfBirth`, `countryOfBirth`), `sex?`, `gender?`, `genderSelfDescribe?`
  (free text when `gender = SELF_DESCRIBE`), `maritalStatus?`, `occupation?`,
  `identity?`, `hasChildren?`, `hasMinorChildren?`, `yucayeke?`, `yucayekeUnknown?`.
  Confirmation block: `signatureName?`, `signatureDate?`, `agreedToTerms?` (**derived
  server-side** at `completeEnrollment` — never trusted from the client), plus
  `consentAccepted` (default false, written by `consent.service` once every required
  consent is accepted) and `approvalDate?`. Relations: contact, consent, ancestry,
  documents, steps.
- **EnrollmentStep** — `stepNumber`, `isCompleted`. Unique `[enrollmentId, stepNumber]`;
  rows 1–4 are created up-front by `startEnrollment`. Cascade-deleted with the enrollment.
- **Ancestry** — the six kinship slots captured across steps 2 (maternal) and 3 (paternal):
  `relation` (`AncestryRelation`), `name?`, `dateOfBirth?`, `nationality?`, `municipality?`,
  `yucayeke?` (**free text on purpose** — a grandparent's historical yucayeke may not be on
  the official list), `isBorikuaTaino?`, plus admin attestation
  (`verificationStatus` default UNVERIFIED, `verifiedAt?`, `verifiedByUserId?`; a member edit
  resets it). Unique `[enrollmentId, relation]`, cascade delete.
- **Contact** — email, phoneNumber, `phoneType`, `allowSMS`. Unique per enrollment.
- **Document** — optional `enrollmentId` / `userId`, `type`, `status` (default PENDING),
  fileName, `fileKey` (unique), fileUrl, mimeType, fileSize, `storageProvider` (default S3),
  `verifiedByAdmin`, `rejectedReason?`. Indexed on `[enrollmentId]` and `[userId]`.
- **Consent** — key, version, title, content (Text), `required`, `active`. Unique `[key, version]`.
- **EnrollmentConsent** — join: `accepted`, `acceptedAt?`. Unique `[enrollmentId, consentId]`.
- **CulturalConnection** — `key` (unique), description (Text), `active`. Reference/lookup only.
- **Service** — name, description?, icon?, `categoryId`, `isFeatured`, `status`, location?, phone?,
  email?, `actionType` (default EXTERNAL), actionLabel?/Url?/Route?, `highlights[]`.
- **ServiceCategory** — `key` (unique), name, icon?.
- **ServiceRegistration** — serviceId, userId, `date`, `status` (free string).
- **Event** — title, description?, `categoryId`, `startDateTime`, `endDateTime?`,
  `locationType` (default PHYSICAL), location?, meetingUrl?, maxCapacity?, isFeatured,
  externalUrl?.
- **EventCategory** — `key` (unique), name, description?, icon?.
- **EventRegistration** — eventId, userId.
- **Feedback** — in-app report / work order: `message` (Text), `pageUrl`, `locale`, `userAgent?`
  (forwarded by the web BFF — the API only ever sees the BFF's own agent), optional `userId`
  (**nullable — signed-out visitors may submit**), optional attachment
  (`attachmentKey/Name/MimeType/Size`), `status` (`FeedbackStatus`, default `NEW`), `createdAt`.
  Indexed on `[userId]`, `[createdAt]` and `[status, createdAt]` (the triage queue).
  `updatedAt` doubles as "when the status last moved" — the status is the only field the admin
  surface writes.

## Enums

| Enum                         | Values                                                                                                                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Role`                       | USER, ADMIN, MODERATOR                                                                                                                                                                                              |
| `EnrollmentStatus`           | DRAFT, SUBMITTED, APPROVED, REJECTED                                                                                                                                                                                |
| `Sex`                        | MALE, FEMALE, INTERSEX (optional field — unset covers "prefer not to say")                                                                                                                                          |
| `Gender`                     | WOMAN, MAN, TWO_SPIRIT, SELF_DESCRIBE (an Arawak term for Two-Spirit is pending from the client)                                                                                                                    |
| `MaritalStatus`              | SINGLE, MARRIED, DIVORCED, WIDOWED, DOMESTIC_PARTNERSHIP                                                                                                                                                            |
| `Identity`                   | ARAWAK, KALINAGO, GARIFUNA, TAINO                                                                                                                                                                                   |
| `PhoneType`                  | MOBILE, HOME, WORK                                                                                                                                                                                                  |
| `AncestryRelation`           | MOTHER, MATERNAL_GRANDMOTHER, MATERNAL_GRANDFATHER, FATHER, PATERNAL_GRANDMOTHER, PATERNAL_GRANDFATHER                                                                                                              |
| `AncestryVerificationStatus` | UNVERIFIED, VERIFIED_DNA, VERIFIED_GENEALOGY                                                                                                                                                                        |
| `DocumentType`               | PROFILE_PICTURE, USER_PHOTO, BIRTH_CERTIFICATE, FAMILY_RECORD, FAMILY_PHOTO, ADDITIONAL_EVIDENCE, **STATE_ID**, **SOCIAL_SECURITY_CARD**, GENEALOGICAL_RECORDS, KINSHIP_LETTERS, ORAL_HISTORY, DNA_TESTING, UNKNOWN |
| `DocumentStatus`             | PENDING, APPROVED, REJECTED                                                                                                                                                                                         |
| `StorageProvider`            | S3, MINIO                                                                                                                                                                                                           |
| `ServiceStatus`              | ACTIVE, INACTIVE, CLOSED                                                                                                                                                                                            |
| `ActionType`                 | INTERNAL, EXTERNAL, MODAL, NONE                                                                                                                                                                                     |
| `LocationType`               | PHYSICAL, VIRTUAL                                                                                                                                                                                                   |
| `FeedbackStatus`             | NEW, IN_REVIEW, RESOLVED, DECLINED (DECLINED = read and closed without action)                                                                                                                                      |

## Yucayeke values

`Enrollment.yucayeke` is a plain `String?`, **not** an enum: the option list lives in
`apps/api/src/modules/enrollment/common/config/yucayeke.config.ts` so it can change without a
migration. `OFFICIAL_YUCAYEKES` (the Nation's legal `Yukayeke <Name>` spellings, sourced from
`data/naming/yucayeke-names/`) is what the UI offers; `ACCEPTED_YUCAYEKE_VALUES` (official +
`LEGACY_YUCAYEKES`) is what `@IsIn` validates, and `canonicalizeYucayeke()` maps superseded
spellings forward on write **and** read. See [`architecture/backend.md`](./architecture/backend.md#yucayeke-naming).

Migrations in `apps/api/prisma/migrations/`; seed data in `prisma/seed/`. Recent migrations:
`20260811180000_yucayeke_official_names` (backfills `Enrollment.yucayeke` to the legal names;
leaves `Ancestry.yucayeke` alone), `20260811193000_add_member_feedback`,
`20260811210000_add_feedback_triage_status`. One-off remediation scripts (run by hand, not
wired into the seed) live in `prisma/scripts/` — e.g. `reopen-step4-without-state-id.ts`.
