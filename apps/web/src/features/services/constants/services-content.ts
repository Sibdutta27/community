export type ServiceCategoryTone =
  "teal" | "olive" | "slate" | "forest" | "sea" | "stone" | "indigo";

/**
 * Resolved card shape passed to the leaf card. Copy is authored in
 * `messages/{en,es}.json` under `services.*` and resolved in the section
 * components; only structural (locale-neutral) data lives here.
 */
export type ServiceCategory = Readonly<{
  description: string;
  iconSrc: string;
  title: string;
  tone: ServiceCategoryTone;
}>;

/** Keys into the `services.categoryPresets.*` message group. */
export type ServiceCategoryPresetKey =
  | "health"
  | "legal"
  | "education"
  | "support"
  | "cultural"
  | "youth"
  | "elder"
  | "housing";

/**
 * Presentation resolved for an API category: a `presetKey` into
 * `services.categoryPresets.*` (with authored title/description), or `null`
 * when unknown — in which case the API `name` is the title and
 * `services.categoryFallbackDescription` the description.
 */
export type ServiceCategoryPresentation = Readonly<{
  presetKey: ServiceCategoryPresetKey | null;
  name: string;
  iconSrc: string;
  tone: ServiceCategoryTone;
}>;

const serviceCategoryPresetByKey: Record<
  string,
  {
    presetKey: ServiceCategoryPresetKey;
    iconSrc: string;
    tone: ServiceCategoryTone;
  }
> = {
  health: {
    presetKey: "health",
    iconSrc: "/icons/services/health-wellness.svg",
    tone: "teal",
  },
  legal: {
    presetKey: "legal",
    iconSrc: "/icons/services/legal-assistance.svg",
    tone: "olive",
  },
  education: {
    presetKey: "education",
    iconSrc: "/icons/services/education-training.svg",
    tone: "slate",
  },
  support: {
    presetKey: "support",
    iconSrc: "/icons/services/community-support.svg",
    tone: "forest",
  },
  cultural: {
    presetKey: "cultural",
    iconSrc: "/icons/services/cultural-programme.svg",
    tone: "olive",
  },
  youth: {
    presetKey: "youth",
    iconSrc: "/icons/services/youth-service.svg",
    tone: "sea",
  },
  elder: {
    presetKey: "elder",
    iconSrc: "/icons/services/elder-care.svg",
    tone: "stone",
  },
  housing: {
    presetKey: "housing",
    iconSrc: "/icons/services/housing-support.svg",
    tone: "indigo",
  },
};

export function getServiceCategoryPresentation(category: {
  icon: string;
  key: string;
  name: string;
}): ServiceCategoryPresentation {
  const normalizedKey = category.key.trim().toLowerCase();
  const normalizedIcon = category.icon.trim().toLowerCase();

  const mapped =
    serviceCategoryPresetByKey[normalizedKey] ??
    serviceCategoryPresetByKey[normalizedIcon];

  if (mapped) {
    return {
      presetKey: mapped.presetKey,
      name: category.name,
      iconSrc: mapped.iconSrc,
      tone: mapped.tone,
    };
  }

  return {
    presetKey: null,
    name: category.name,
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
