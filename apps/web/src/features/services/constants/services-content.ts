export const servicesHeroContent = {
  badge: "Member Resources",
  title: "Community Services Directory",
  description:
    "Comprehensive support services designed exclusively for Taíno Nation members. Access health care, legal assistance, educational programs, and community resources to support your wellbeing and growth.",
} as const;

export type ServiceCategoryTone =
  | "teal"
  | "olive"
  | "slate"
  | "forest"
  | "sea"
  | "stone"
  | "indigo";

export type ServiceCategory = Readonly<{
  description: string;
  iconSrc: string;
  title: string;
  tone: ServiceCategoryTone;
}>;

export const servicesCategoriesContent = {
  title: "Service Categories",
  description:
    "Browse our comprehensive directory of services organized by category. Select a service area to explore available support, contact details, and access options.",
} as const;

export const popularServicesContent = {
  title: "Popular Services",
  description:
    "Browse our comprehensive directory of services organized by category. Click on any service to view detailed information, contact details, and access options.",
} as const;

const serviceCategoryPresentationByKey: Record<string, ServiceCategory> = {
  health: {
    description: "Medical, mental health, and holistic care.",
    iconSrc: "/icons/services/health-wellness.svg",
    title: "Health & Wellness",
    tone: "teal",
  },
  legal: {
    description: "Rights advocacy and legal support.",
    iconSrc: "/icons/services/legal-assistance.svg",
    title: "Legal Assistance",
    tone: "olive",
  },
  education: {
    description: "Learning and skill development.",
    iconSrc: "/icons/services/education-training.svg",
    title: "Education & Training",
    tone: "slate",
  },
  support: {
    description: "Emergency and ongoing assistance.",
    iconSrc: "/icons/services/community-support.svg",
    title: "Community Support",
    tone: "forest",
  },
  cultural: {
    description: "Language, arts, and traditions.",
    iconSrc: "/icons/services/cultural-programme.svg",
    title: "Cultural Programs",
    tone: "olive",
  },
  youth: {
    description: "Programs for children and teens.",
    iconSrc: "/icons/services/youth-service.svg",
    title: "Youth Services",
    tone: "sea",
  },
  elder: {
    description: "Support for senior community members.",
    iconSrc: "/icons/services/elder-care.svg",
    title: "Elder Care",
    tone: "stone",
  },
  housing: {
    description: "Shelter and housing assistance.",
    iconSrc: "/icons/services/housing-support.svg",
    title: "Housing Support",
    tone: "indigo",
  },
};

export function getServiceCategoryPresentation(category: {
  icon: string;
  key: string;
  name: string;
}): ServiceCategory {
  const normalizedKey = category.key.trim().toLowerCase();
  const normalizedIcon = category.icon.trim().toLowerCase();

  const mapped =
    serviceCategoryPresentationByKey[normalizedKey] ??
    serviceCategoryPresentationByKey[normalizedIcon];

  if (mapped) {
    return mapped;
  }

  return {
    title: category.name,
    description: "Explore services, support options, and member resources.",
    iconSrc: "/icons/services/community-support.svg",
    tone: "forest",
  };
}

const serviceIconSrcByIconKey: Record<string, string> = {
  community_support: "/icons/services/community-support.svg",
  education: "/icons/services/education-training.svg",
  education_training: "/icons/services/education-training.svg",
  elder: "/icons/services/elder-care.svg",
  elder_care: "/icons/services/elder-care.svg",
  emergency: "/icons/services/community-support.svg",
  food: "/icons/services/community-support.svg",
  health: "/icons/services/health-wellness.svg",
  health_clinic: "/icons/services/health-wellness.svg",
  housing: "/icons/services/housing-support.svg",
  housing_support: "/icons/services/housing-support.svg",
  legal: "/icons/services/legal-assistance.svg",
  mental_health: "/icons/services/health-wellness.svg",
  primary_care: "/icons/services/health-wellness.svg",
  property_rights: "/icons/services/legal-assistance.svg",
  support: "/icons/services/community-support.svg",
  youth: "/icons/services/youth-service.svg",
} as const;

export function getServiceIconSrc(service: {
  category?: { icon: string; key: string } | null;
  icon: string;
}) {
  const serviceIcon = service.icon.trim().toLowerCase();
  const categoryIcon = service.category?.icon?.trim().toLowerCase() ?? "";
  const categoryKey = service.category?.key?.trim().toLowerCase() ?? "";

  return (
    serviceIconSrcByIconKey[serviceIcon] ??
    serviceIconSrcByIconKey[categoryIcon] ??
    serviceIconSrcByIconKey[categoryKey] ??
    "/icons/services/community-support.svg"
  );
}
