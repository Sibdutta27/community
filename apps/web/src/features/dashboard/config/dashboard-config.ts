export type DashboardExpectationCard = Readonly<{
  iconSrc: string;
  title: string;
}>;

/**
 * What is left of the dashboard's hardcoded config now that its copy lives in
 * the `dashboard` message catalog: the expectation glyphs, which are assets
 * rather than text and are paired with their translated labels by position.
 */
export const dashboardConfig = {
  expectations: {
    cards: [
      {
        iconSrc: "/icons/dashboard/secure.svg",
        title: "Secure & Private",
      },
      {
        iconSrc: "/icons/dashboard/progress.svg",
        title: "Save Your Progress",
      },
      {
        iconSrc: "/icons/dashboard/support.svg",
        title: "Expert Support",
      },
    ] as const satisfies readonly DashboardExpectationCard[],
  },
} as const;
