# Data Model (Prisma)

Source of truth: `apps/api/prisma/schema.prisma`. Postgres; client generated to
`apps/api/src/generated/prisma`. Keep this file in sync after migrations
(`community-kb refresh backend`).

## Core entities & relations

```
User 1───1 Enrollment 1───1 Contact
 │            │        1───1 EmergencyContact
 │            │        1───* Address            (unique per [enrollmentId, type])
 │            │        1───* EnrollmentStep      (unique per [enrollmentId, stepNumber])
 │            │        1───* MaternalLineage
 │            │        *───* CulturalConnection  (via EnrollmentCulturalConnection)
 │            │        *───* Consent             (via EnrollmentConsent)
 │            └───* Document
 ├───* Document
 ├───* ServiceRegistration *───1 Service *───1 ServiceCategory
 └───* EventRegistration   *───1 Event   *───1 EventCategory
```

## Models

- **User** — `id` (uuid), `serial` (BigInt autoincrement, unique), `publicId?` (unique),
  `name?`, `email` (unique), `password`, `role` (default USER), `lastActiveAt?`. One optional
  `Enrollment`; many `Document`, `ServiceRegistration`, `EventRegistration`.
- **Enrollment** — `userId` (unique), `status` (default DRAFT). Flat personal fields:
  name parts, `dateOfBirth`, birth place (`city/municipality/countryOfBirth`), `gender?`,
  `pronouns?`, `maritalStatus?`, `occupation?`, `educationLevel?`, `languagesSpoken[]`,
  `specialSkills?`, `consentAccepted` (default false), `approvalDate?`. Relations: contact,
  addresses, emergencyContact, consent, maternalLineages, culturalConnections, documents, steps.
- **EnrollmentStep** — `stepNumber`, `isCompleted`. Unique `[enrollmentId, stepNumber]`.
- **Address** — `type` (CURRENT|MAILING), street/apartment/city/state/zipCode/country,
  `yearsLived?`. Unique `[enrollmentId, type]`.
- **Contact** — email, phoneNumber, `phoneType`, `allowSMS`. Unique per enrollment.
- **EmergencyContact** — fullName, relationship, phoneNumber. Unique per enrollment.
- **Document** — optional `enrollmentId` / `userId`, `type`, `status` (default PENDING),
  fileName, `fileKey` (unique), fileUrl, mimeType, fileSize, `storageProvider` (default S3),
  `verifiedByAdmin`, `rejectedReason?`.
- **Consent** — key, version, title, content (Text), `required`, `active`. Unique `[key, version]`.
- **EnrollmentConsent** — join: `accepted`, `acceptedAt?`. Unique `[enrollmentId, consentId]`.
- **MaternalLineage** — `relation` (RelationType), fullName, maidenName?, dateOfBirth?,
  placeOfBirth?, `livingStatus`, approximateBirthYear?, regionOfOrigin?, familyOccupation?,
  additionalNotes?.
- **CulturalConnection** — `key` (unique), description (Text), `active`.
- **EnrollmentCulturalConnection** — join. Unique `[enrollmentId, culturalConnectionId]`.
- **Service** — name, description?, icon?, `categoryId`, `isFeatured`, `status`, location?, phone?,
  email?, `actionType` (default EXTERNAL), actionLabel?/Url?/Route?, `highlights[]`.
- **ServiceCategory** — `key` (unique), name, icon?.
- **ServiceRegistration** — serviceId, userId, `date`, `status` (free string).
- **Event** — title, description?, `categoryId`, `startDateTime`, `endDateTime?`,
  `locationType` (default PHYSICAL), location?, meetingUrl?, maxCapacity?, isFeatured,
  externalUrl?.
- **EventCategory** — `key` (unique), name, description?, icon?.
- **EventRegistration** — eventId, userId.
- **Feedback** — in-app report / work order: `message` (Text), `pageUrl`, `locale`, `userAgent?`,
  optional `userId` (**nullable — signed-out visitors may submit**), optional attachment
  (`attachmentKey/Name/MimeType/Size`), `createdAt`. Indexed on `[userId]` and `[createdAt]`.

## Enums

| Enum               | Values                                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| `Role`             | USER, ADMIN, MODERATOR                                                                                    |
| `EnrollmentStatus` | DRAFT, SUBMITTED, APPROVED, REJECTED                                                                      |
| `Gender`           | MALE, FEMALE, NON_BINARY, TWO_SPIRIT, SELF_DESCRIBE, PREFER_NOT_TO_SAY, OTHER                             |
| `MaritalStatus`    | SINGLE, MARRIED, DIVORCED, WIDOWED                                                                        |
| `AddressType`      | CURRENT, MAILING                                                                                          |
| `PhoneType`        | MOBILE, HOME, WORK                                                                                        |
| `DocumentType`     | PROFILE_PICTURE, USER_PHOTO, BIRTH_CERTIFICATE, FAMILY_RECORD, FAMILY_PHOTO, ADDITIONAL_EVIDENCE, UNKNOWN |
| `DocumentStatus`   | PENDING, APPROVED, REJECTED                                                                               |
| `StorageProvider`  | S3, MINIO                                                                                                 |
| `RelationType`     | MOTHER, GRANDMOTHER, GREAT_GRANDMOTHER, GREAT_GREAT_GRANDMOTHER, GREAT_GREAT_GREAT_GRANDMOTHER            |
| `LivingStatus`     | LIVING, DECEASED                                                                                          |
| `ServiceStatus`    | ACTIVE, INACTIVE, CLOSED                                                                                  |
| `ActionType`       | INTERNAL, EXTERNAL, MODAL, NONE                                                                           |
| `LocationType`     | PHYSICAL, VIRTUAL                                                                                         |

Migrations in `apps/api/prisma/migrations/`; seed data in `prisma/seed/`.
