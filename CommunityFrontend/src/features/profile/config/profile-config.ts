export type ProfileLineageTabValue =
  | "overview"
  | "lineage"
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

export type ProfileLineageEntry = Readonly<{
  additionalNotes?: string;
  born: string;
  familyOccupation?: string;
  generation: string;
  generationLabel: string;
  maidenName?: string;
  name: string;
  place: string;
  status: string;
  statusLabel: string;
}>;

export type ProfileLineageTreeNode = Readonly<{
  born: string;
  id: string;
  name: string;
  relation: string;
  status: string;
  children?: readonly ProfileLineageTreeNode[];
}>;

export type ProfileLineageTreeData = Readonly<{
  description: string;
  roots: readonly ProfileLineageTreeNode[];
  title: string;
}>;

export type ProfileLineageStat = Readonly<{
  description: string;
  label: string;
  value: string;
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
  culturalConnections: readonly string[];
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
  lineageEntries: [
    {
      born: "March 12, 1985",
      generation: "1",
      generationLabel: "You (Current Generation)",
      name: "Carmen María Rodríguez Torres",
      place: "Arecibo, PR",
      status: "Verified",
      statusLabel: "Status",
    },
    {
      born: "March 12, 1985",
      generation: "2",
      generationLabel: "Mother",
      name: "María Elena Torres Rivera",
      place: "Arecibo, PR",
      status: "Verified",
      statusLabel: "Status",
    },
    {
      born: "March 12, 1985",
      generation: "3",
      generationLabel: "Maternal Grandmother",
      name: "Ana Isabel Rivera Colón",
      place: "Arecibo, PR",
      status: "Verified",
      statusLabel: "Status",
    },
  ],
  lineageTree: {
    description:
      "This tree is structured to support future growth as more linked family members are connected from admin records.",
    roots: [
      {
        born: "1904",
        children: [
          {
            born: "1932",
            children: [
              {
                born: "1958",
                children: [
                  {
                    born: "1985",
                    id: "tree-you",
                    name: "Carmen María Rodríguez Torres",
                    relation: "You",
                    status: "Current Member",
                  },
                  {
                    born: "1988",
                    id: "tree-sibling",
                    name: "Elena Rodríguez Torres",
                    relation: "Maternal Sibling Branch",
                    status: "Linked Relative",
                  },
                ],
                id: "tree-mother",
                name: "María Elena Torres Rivera",
                relation: "Mother",
                status: "Verified Ancestor",
              },
            ],
            id: "tree-grandmother",
            name: "Ana Isabel Rivera Colón",
            relation: "Maternal Grandmother",
            status: "Verified Ancestor",
          },
          {
            born: "1938",
            children: [
              {
                born: "1964",
                id: "tree-great-aunt-branch",
                name: "Luz Rivera Colón",
                relation: "Great Aunt Branch",
                status: "Linked Relative",
              },
            ],
            id: "tree-grand-aunt",
            name: "Rosa Isabel Rivera Colón",
            relation: "Grandmother Sibling Branch",
            status: "Linked Relative",
          },
        ],
        id: "tree-great-grandmother",
        name: "Micaela Colón de Rivera",
        relation: "Maternal Great Grandmother",
        status: "Documented Ancestor",
      },
    ],
    title: "Family Tree View",
  },
  lineageStats: [
    {
      description: "Documented maternal line",
      label: "Generations",
      value: "6",
    },
    {
      description: "Supporting records verified",
      label: "Documents",
      value: "17",
    },
    {
      description: "Lineage traced back to 1847",
      label: "Years",
      value: "117",
    },
  ],
  lineageTabs: [
    {
      iconSrc: "/icons/profile/overview.svg",
      label: "Overview",
      value: "overview",
    },
    {
      iconSrc: "/icons/profile/lineage.svg",
      label: "Lineage",
      value: "lineage",
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
        label: "Step 1: Personal Information",
      },
      {
        completed: true,
        label: "Step 2: Lineage Information",
      },
      {
        completed: false,
        label: "Step 3: Cultural Connections",
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
      {
        label: "Current Address",
        value: "Arecibo, Puerto Rico",
      },
      {
        label: "Emergency Contact",
        value: "María Elena Torres",
      },
    ],
    culturalConnections: [
      "Traditional medicinal plant knowledge",
      "Traditional songs and oral history",
      "Ceremonial dances and crafts",
    ],
    description:
      "A quick snapshot of your enrollment, profile details, and submitted lineage progress.",
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
        helper: "Maternal entries listed",
        label: "Lineage Records",
        value: "3",
      },
    ],
    personalFacts: [
      {
        label: "Preferred Name",
        value: "Carmen María",
      },
      {
        label: "Occupation",
        value: "Community Educator",
      },
      {
        label: "Education",
        value: "Bachelor Degree",
      },
      {
        label: "Languages",
        value: "English, Spanish",
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
      "Your Yucayeke profile connects your territory, family line, and cultural participation in one place.",
    metrics: [
      {
        helper: "Enrollment tasks completed",
        label: "Completed Steps",
        value: "2 / 4",
      },
      {
        helper: "Recorded maternal relatives",
        label: "Lineage Relatives",
        value: "2",
      },
      {
        helper: "Submitted supporting files",
        label: "Documents",
        value: "4",
      },
      {
        helper: "Declared cultural practices",
        label: "Cultural Links",
        value: "3",
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
        label: "Focus Practice",
        value: "Traditional medicinal plant knowledge",
      },
      {
        label: "Next Gathering",
        value: "Community circle planning in progress",
      },
    ],
    territoryFacts: [
      {
        label: "Current Territory",
        value: "Arecibo, Puerto Rico",
      },
      {
        label: "Birth Municipality",
        value: "Arecibo",
      },
      {
        label: "Lineage Region",
        value: "West Bengal",
      },
      {
        label: "Languages",
        value: "English, Spanish",
      },
    ],
    title: "Yucayeke",
  },
  documents: {
    categories: [
      {
        count: "1",
        description: "Personal profile image file.",
        label: "User Photo",
        required: "Required: 1",
      },
      {
        count: "1",
        description: "Primary birth certificate record.",
        label: "Birth Certificate",
        required: "Required: 1",
      },
      {
        count: "2",
        description: "Mother and grandmother birth records.",
        label: "Lineage Birth Certificates",
        required: "Required: 2",
      },
      {
        count: "2",
        description: "Mother and grandmother photos.",
        label: "Lineage Photos",
        required: "Required: 2",
      },
      {
        count: "1",
        description: "Extra files that support your lineage story.",
        label: "Additional Evidence",
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
      "Complete Cultural Connections in Step 3.",
      "Upload all required lineage files in Step 4.",
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
  lineageEntries: readonly ProfileLineageEntry[];
  lineageTree: ProfileLineageTreeData;
  lineageStats: readonly ProfileLineageStat[];
  lineageTabs: readonly ProfileLineageTab[];
  overview: ProfileOverviewData;
  yucayeke: ProfileYucayekeData;
  documents: ProfileDocumentsData;
  activity: ProfileActivityData;
  settings: ProfileSettingsData;
  regionalMembers: readonly ProfileRegionalMember[];
}>;
