export type ProfileLineageTabValue =
  | "overview"
  | "kinship"
  | "yucayeke"
  | "documents"
  | "activity"
  | "settings";

export type ProfileCopy = Readonly<{
  memberSince?: string;
  memberStatus: string;
  name: string;
  portraitSrc: string;
}>;

export type ProfileDetail = Readonly<{
  iconSrc: string;
  value: string;
}>;

export type ProfileKinshipFact = Readonly<{
  label: string;
  value: string;
}>;

export type ProfileKinshipAncestor = Readonly<{
  facts: readonly ProfileKinshipFact[];
  name: string;
  relation: string;
}>;

export type ProfileKinshipGroup = Readonly<{
  ancestors: readonly ProfileKinshipAncestor[];
  emptyMessage: string;
  title: string;
}>;

export type ProfileKinshipData = Readonly<{
  description: string;
  groups: readonly ProfileKinshipGroup[];
  title: string;
}>;

export type ProfileLineageTab = Readonly<{
  iconSrc: string;
  label: string;
  value: ProfileLineageTabValue;
}>;

export type ProfileRegionalMember = Readonly<{
  memberId: string;
  name: string;
  portraitSrc: string;
  role: string;
}>;

export type ProfileOverviewMetric = Readonly<{
  helper: string;
  label: string;
  value: string;
}>;

export type ProfileOverviewFact = Readonly<{
  label: string;
  value: string;
}>;

export type ProfileOverviewChecklistItem = Readonly<{
  completed: boolean;
  label: string;
}>;

export type ProfileOverviewData = Readonly<{
  checklist: readonly ProfileOverviewChecklistItem[];
  contactFacts: readonly ProfileOverviewFact[];
  description: string;
  metrics: readonly ProfileOverviewMetric[];
  personalFacts: readonly ProfileOverviewFact[];
  title: string;
}>;

export type ProfileYucayekeFact = Readonly<{
  label: string;
  value: string;
}>;

export type ProfileYucayekeMetric = Readonly<{
  helper: string;
  label: string;
  value: string;
}>;

export type ProfileYucayekeCircleMember = Readonly<{
  detail: string;
  name: string;
  role: string;
}>;

export type ProfileYucayekeData = Readonly<{
  circles: readonly ProfileYucayekeCircleMember[];
  communityName: string;
  description: string;
  metrics: readonly ProfileYucayekeMetric[];
  rhythm: readonly ProfileYucayekeFact[];
  territoryFacts: readonly ProfileYucayekeFact[];
  title: string;
}>;

export type ProfileDocumentsMetric = Readonly<{
  helper: string;
  label: string;
  value: string;
}>;

export type ProfileDocumentsCategory = Readonly<{
  count: string;
  description: string;
  label: string;
  required: string;
}>;

export type ProfileDocumentsUpload = Readonly<{
  category: string;
  id: string;
  name: string;
  size: string;
  status: string;
  uploadedAt: string;
  url: string;
}>;

export type ProfileDocumentsData = Readonly<{
  categories: readonly ProfileDocumentsCategory[];
  description: string;
  metrics: readonly ProfileDocumentsMetric[];
  missingRequired: readonly string[];
  title: string;
  uploads: readonly ProfileDocumentsUpload[];
}>;

export type ProfileActivityMetric = Readonly<{
  helper: string;
  label: string;
  value: string;
}>;

export type ProfileActivityEventTone = "success" | "warning" | "info";

export type ProfileActivityEvent = Readonly<{
  dateLabel: string;
  description: string;
  id: string;
  title: string;
  tone: ProfileActivityEventTone;
}>;

export type ProfileActivityData = Readonly<{
  description: string;
  events: readonly ProfileActivityEvent[];
  metrics: readonly ProfileActivityMetric[];
  nextActions: readonly string[];
  title: string;
}>;

export type ProfileSettingsFact = Readonly<{
  label: string;
  value: string;
}>;

export type ProfileSettingsPreference = Readonly<{
  description: string;
  enabled: boolean;
  label: string;
}>;

export type ProfileSettingsSecurityTone = "good" | "warn" | "neutral";

export type ProfileSettingsSecurityItem = Readonly<{
  description: string;
  statusLabel: string;
  title: string;
  tone: ProfileSettingsSecurityTone;
}>;

export type ProfileSettingsData = Readonly<{
  accountFacts: readonly ProfileSettingsFact[];
  description: string;
  preferences: readonly ProfileSettingsPreference[];
  securityItems: readonly ProfileSettingsSecurityItem[];
  title: string;
}>;

export const profileConfig = {
  copy: {
    memberSince: "Member since January 15, 2023",
    memberStatus: "Enrolled Member",
    name: "Carmen María",
    portraitSrc: "/images/member1.png",
  },
  details: [
    {
      iconSrc: "/icons/profile/member.svg",
      value: "TN-2847-GUA",
    },
    {
      iconSrc: "/icons/profile/location.svg",
      value: "Yucayeke Guainía",
    },
    {
      iconSrc: "/icons/profile/calendar.svg",
      value: "Born: March 12, 1985",
    },
  ],
  kinship: {
    description:
      "Your recorded maternal and paternal kinship from the enrollment form.",
    groups: [
      {
        ancestors: [],
        emptyMessage: "No maternal kinship recorded yet.",
        title: "Maternal Line",
      },
      {
        ancestors: [],
        emptyMessage: "No paternal kinship recorded yet.",
        title: "Paternal Line",
      },
    ],
    title: "Kinship & Ancestry",
  },
  lineageTabs: [
    {
      iconSrc: "/icons/profile/overview.svg",
      label: "Overview",
      value: "overview",
    },
    {
      iconSrc: "/icons/profile/lineage.svg",
      label: "Kinship",
      value: "kinship",
    },
    {
      iconSrc: "/icons/profile/yucayeke.svg",
      label: "Yucayeke",
      value: "yucayeke",
    },
    {
      iconSrc: "/icons/profile/documents.svg",
      label: "Documents",
      value: "documents",
    },
    {
      iconSrc: "/icons/profile/calendar.svg",
      label: "Activity",
      value: "activity",
    },
    {
      iconSrc: "/icons/profile/settings.svg",
      label: "Settings",
      value: "settings",
    },
  ],
  overview: {
    checklist: [
      {
        completed: true,
        label: "Step 1: Demographics",
      },
      {
        completed: true,
        label: "Step 2: Maternal Kinship",
      },
      {
        completed: false,
        label: "Step 3: Paternal Kinship",
      },
      {
        completed: false,
        label: "Step 4: Document Upload",
      },
    ],
    contactFacts: [
      {
        label: "Email",
        value: "carmen.maria@example.com",
      },
      {
        label: "Phone",
        value: "+1 (787) 555-0187",
      },
    ],
    description:
      "A quick snapshot of your enrollment, profile details, and recorded kinship progress.",
    metrics: [
      {
        helper: "Current profile stage",
        label: "Enrollment Status",
        value: "Draft",
      },
      {
        helper: "Steps completed",
        label: "Completed Steps",
        value: "2 / 4",
      },
      {
        helper: "Uploaded records",
        label: "Documents Uploaded",
        value: "4",
      },
      {
        helper: "Kinship entries recorded",
        label: "Ancestors Recorded",
        value: "3",
      },
    ],
    personalFacts: [
      {
        label: "Full Name",
        value: "Carmen María Rodríguez",
      },
      {
        label: "Occupation",
        value: "Community Educator",
      },
      {
        label: "Marital Status",
        value: "Single",
      },
      {
        label: "Identity",
        value: "Taíno",
      },
    ],
    title: "Overview",
  },
  yucayeke: {
    circles: [
      {
        detail: "Arecibo, Puerto Rico",
        name: "Carmen María Rodríguez Torres",
        role: "You",
      },
      {
        detail: "Arecibo, Puerto Rico",
        name: "María Elena Torres Rivera",
        role: "Mother",
      },
      {
        detail: "Arecibo, Puerto Rico",
        name: "Ana Isabel Rivera Colón",
        role: "Maternal Grandmother",
      },
    ],
    communityName: "Yucayeke Guainía",
    description:
      "Your Yucayeke profile connects your territory, family line, and enrollment progress in one place.",
    metrics: [
      {
        helper: "Enrollment tasks completed",
        label: "Completed Steps",
        value: "2 / 4",
      },
      {
        helper: "Recorded kinship entries",
        label: "Ancestors Recorded",
        value: "2",
      },
      {
        helper: "Submitted supporting files",
        label: "Documents",
        value: "4",
      },
      {
        helper: "Required consents accepted",
        label: "Consents",
        value: "2 / 2",
      },
    ],
    rhythm: [
      {
        label: "Profile Status",
        value: "Draft",
      },
      {
        label: "Primary Contact",
        value: "carmen.maria@example.com",
      },
      {
        label: "Identity",
        value: "Taíno",
      },
      {
        label: "Last Update",
        value: "Community circle planning in progress",
      },
    ],
    territoryFacts: [
      {
        label: "Birth City",
        value: "Arecibo",
      },
      {
        label: "Birth Municipality",
        value: "Arecibo",
      },
      {
        label: "Birth Country",
        value: "Puerto Rico",
      },
      {
        label: "Declared Yucayeke",
        value: "Yucayeke Guainía",
      },
    ],
    title: "Yucayeke",
  },
  documents: {
    categories: [
      {
        count: "1",
        description: "A clear, recent photo of yourself.",
        label: "Your Photo",
        required: "Required: 1",
      },
      {
        count: "0",
        description: "Birth, baptism, census, or civil records.",
        label: "Genealogical Records",
        required: "Optional",
      },
      {
        count: "0",
        description: "Letters attesting to your kinship.",
        label: "Kinship Letters",
        required: "Optional",
      },
      {
        count: "0",
        description: "Recorded or transcribed oral history.",
        label: "Oral History",
        required: "Optional",
      },
      {
        count: "0",
        description: "DNA test results supporting your ancestry.",
        label: "DNA Testing",
        required: "Optional",
      },
    ],
    description:
      "Track your uploaded files, required document coverage, and latest review status.",
    metrics: [
      {
        helper: "All uploaded files",
        label: "Total Uploaded",
        value: "7",
      },
      {
        helper: "Required files uploaded",
        label: "Required Coverage",
        value: "6 / 6",
      },
      {
        helper: "Admin-approved files",
        label: "Approved",
        value: "3",
      },
      {
        helper: "Files waiting review",
        label: "Pending",
        value: "4",
      },
    ],
    missingRequired: [],
    title: "Documents",
    uploads: [
      {
        category: "User Photo",
        id: "fallback-user-photo",
        name: "user-photo.jpg",
        size: "245 KB",
        status: "Approved",
        uploadedAt: "April 7, 2026",
        url: "#",
      },
      {
        category: "Birth Certificate",
        id: "fallback-birth-certificate",
        name: "birth-certificate.pdf",
        size: "1.3 MB",
        status: "Pending",
        uploadedAt: "April 7, 2026",
        url: "#",
      },
      {
        category: "Lineage Birth Certificates",
        id: "fallback-lineage-birth",
        name: "mother-birth-certificate.pdf",
        size: "990 KB",
        status: "Pending",
        uploadedAt: "April 8, 2026",
        url: "#",
      },
      {
        category: "Lineage Photos",
        id: "fallback-lineage-photo",
        name: "grandmother-photo.jpg",
        size: "430 KB",
        status: "Approved",
        uploadedAt: "April 8, 2026",
        url: "#",
      },
    ],
  },
  activity: {
    description:
      "Recent enrollment and document timeline updates from your profile journey.",
    events: [
      {
        dateLabel: "April 9, 2026",
        description: "Your profile account was created.",
        id: "fallback-activity-created",
        title: "Account Created",
        tone: "success",
      },
      {
        dateLabel: "April 9, 2026",
        description: "Personal and lineage information submitted for review.",
        id: "fallback-activity-step",
        title: "Enrollment Progress Updated",
        tone: "info",
      },
      {
        dateLabel: "April 10, 2026",
        description:
          "Birth certificate uploaded and waiting for admin verification.",
        id: "fallback-activity-document",
        title: "Document Uploaded",
        tone: "warning",
      },
    ],
    metrics: [
      {
        helper: "Tracked timeline entries",
        label: "Recent Events",
        value: "6",
      },
      {
        helper: "Enrollment steps completed",
        label: "Completed Steps",
        value: "2 / 4",
      },
      {
        helper: "Files awaiting review",
        label: "Pending Reviews",
        value: "2",
      },
      {
        helper: "Most recent profile update",
        label: "Last Update",
        value: "April 10, 2026",
      },
    ],
    nextActions: [
      "Complete Paternal Kinship in Step 3.",
      "Upload all required files in Step 4.",
      "Check pending file statuses after admin review.",
    ],
    title: "Activity",
  },
  settings: {
    accountFacts: [
      {
        label: "Member ID",
        value: "TN-2847-GUA",
      },
      {
        label: "Email",
        value: "carmen.maria@example.com",
      },
      {
        label: "Phone",
        value: "+1 (787) 555-0187",
      },
      {
        label: "Enrollment Status",
        value: "Draft",
      },
      {
        label: "Completed Steps",
        value: "2 / 4",
      },
    ],
    description:
      "Manage account preferences, communication choices, and security status for your enrollment profile.",
    preferences: [
      {
        description:
          "Receive updates in your inbox when profile activity changes.",
        enabled: true,
        label: "Email Notifications",
      },
      {
        description: "Receive SMS alerts for major enrollment changes.",
        enabled: true,
        label: "SMS Notifications",
      },
      {
        description: "Get alerts when document review status changes.",
        enabled: true,
        label: "Document Review Alerts",
      },
      {
        description: "Get updates when enrollment steps are completed.",
        enabled: true,
        label: "Enrollment Progress Alerts",
      },
    ],
    securityItems: [
      {
        description: "All required consents accepted for this profile.",
        statusLabel: "Healthy",
        title: "Consent Status",
        tone: "good",
      },
      {
        description: "Pending document reviews may require follow-up.",
        statusLabel: "Attention",
        title: "Document Review",
        tone: "warn",
      },
      {
        description: "Account is active and connected to enrollment data.",
        statusLabel: "Active",
        title: "Account Access",
        tone: "neutral",
      },
    ],
    title: "Settings",
  },
  regionalMembers: [
    {
      memberId: "TN-1523-GUA",
      name: "Roberto Santos Rivera",
      portraitSrc: "/images/member1.png",
      role: "Regional Coordinator",
    },
    {
      memberId: "TN-1844-GUA",
      name: "Elena Mendez Cruz",
      portraitSrc: "/images/member2.png",
      role: "Regional Coordinator",
    },
    {
      memberId: "TN-1912-GUA",
      name: "Luis Antonio Torres",
      portraitSrc: "/images/member3.png",
      role: "Regional Coordinator",
    },
    {
      memberId: "TN-2031-GUA",
      name: "María Isabel Rivera",
      portraitSrc: "/images/member2.png",
      role: "Regional Coordinator",
    },
    {
      memberId: "TN-2178-GUA",
      name: "Carlos Javier Ortiz",
      portraitSrc: "/images/member1.png",
      role: "Regional Coordinator",
    },
    {
      memberId: "TN-2295-GUA",
      name: "Ana Sofía Maldonado",
      portraitSrc: "/images/member3.png",
      role: "Regional Coordinator",
    },
    {
      memberId: "TN-2410-GUA",
      name: "Daniela Cruz Vázquez",
      portraitSrc: "/images/member2.png",
      role: "Regional Coordinator",
    },
    {
      memberId: "TN-2541-GUA",
      name: "Javier Morales Peña",
      portraitSrc: "/images/member1.png",
      role: "Regional Coordinator",
    },
    {
      memberId: "TN-2667-GUA",
      name: "Lucía Pérez Santiago",
      portraitSrc: "/images/member3.png",
      role: "Regional Coordinator",
    },
    {
      memberId: "TN-2798-GUA",
      name: "Miguel Ángel Torres",
      portraitSrc: "/images/member2.png",
      role: "Regional Coordinator",
    },
  ],
} as const satisfies Readonly<{
  copy: ProfileCopy;
  details: readonly ProfileDetail[];
  kinship: ProfileKinshipData;
  lineageTabs: readonly ProfileLineageTab[];
  overview: ProfileOverviewData;
  yucayeke: ProfileYucayekeData;
  documents: ProfileDocumentsData;
  activity: ProfileActivityData;
  settings: ProfileSettingsData;
  regionalMembers: readonly ProfileRegionalMember[];
}>;
