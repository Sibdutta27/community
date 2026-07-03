const normalizePath = (path: string) =>
  path.startsWith("/") ? path : `/${path}`;

export const endpoints = {
  ACCOUNT: {
    COMMUNITY_META: normalizePath("/account/community-meta"),
    INFO: normalizePath("/account/info"),
  },
  EVENTS: {
    CATEGORIES: normalizePath("/events/categories"),
    LIST: normalizePath("/events"),
    REGISTER: normalizePath("/events/register"),
    REGISTER_LIST: normalizePath("/events/register-list"),
  },
  SERVICES: {
    CATEGORIES: normalizePath("/services/categories"),
    LIST: normalizePath("/services"),
    REGISTER: normalizePath("/services/register"),
    REGISTER_LIST: normalizePath("/services/register-list"),
  },
  PROFILE: {
    INFO: normalizePath("/profile"),
  },
  AUTH: {
    REGISTER: normalizePath("/auth/register"),
    LOGIN: normalizePath("/auth/login"),
  },
  CONSENT: {
    ACTIVE: normalizePath("/consent/active"),
    ACCEPT: normalizePath("/consent/accept"),
  },
  ENROLLMENT: {
    START: normalizePath("/enrollment/start"),
    COMPLETE: normalizePath("/enrollment/complete"),
    STEP_1_DEMOGRAPHICS: normalizePath("/enrollment/step1"),
    STEP_1_DEMOGRAPHICS_UPSERT: normalizePath("/enrollment/step1/upsert"),
    STEP_2_MATERNAL_KINSHIP: normalizePath("/enrollment/step2"),
    STEP_2_MATERNAL_KINSHIP_UPSERT: normalizePath("/enrollment/step2/upsert"),
    STEP_3_PATERNAL_KINSHIP: normalizePath("/enrollment/step3"),
    STEP_3_PATERNAL_KINSHIP_UPSERT: normalizePath("/enrollment/step3/upsert"),
    STEP_4_DOCUMENTS_NEXT: normalizePath("/enrollment/step4/next"),
  },
  DOCUMENT: {
    LIST: normalizePath("/document/list"),
    UPLOAD: normalizePath("/document/upload"),
    PRESIGN_UPLOAD: normalizePath("/document/presign-upload"),
    CONFIRM: normalizePath("/document/confirm"),
  },
} as const;
