export type DashboardExpectationCard = Readonly<{
  iconSrc: string;
  title: string;
  tone: "sand" | "peach" | "lavender";
}>;

export const dashboardConfig = {
  hero: {
    title: {
      prefix: "Enrollment",
      highlight: "Application",
      suffix: "Portal",
    },
    description:
      "Start your enrollment application, track your progress, and reconnect with your Taíno heritage. Each step brings you closer to official tribal membership and community connection.",
  },
  enrollment: {
    eyebrow: "Enrollment Dashboard",
    description: "Complete your application and track your progress",
    applicationStatusLabel: "Application Status",
    sectionTitle: "Your Enrollment Journey",
  },
  expectations: {
    title: "What to Expect During Enrollment",
    description:
      "Our enrollment process is designed to be thorough yet respectful, ensuring your heritage is properly documented while honoring your family's story.",
    cards: [
      {
        iconSrc: "/icons/dashboard/secure.svg",
        title: "Secure & Private",
        tone: "sand",
      },
      {
        iconSrc: "/icons/dashboard/progress.svg",
        title: "Save Your Progress",
        tone: "peach",
      },
      {
        iconSrc: "/icons/dashboard/support.svg",
        title: "Expert Support",
        tone: "lavender",
      },
    ] as const satisfies readonly DashboardExpectationCard[],
  },
} as const;
