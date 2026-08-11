/** What the member is sending, before the widget adds the page context. */
export type FeedbackSubmitPayload = Readonly<{
  message: string;
  /** Absolute URL of the page the widget was opened from. */
  pageUrl: string;
  /** UI language at submit time ("en" / "es"). */
  locale: string;
  attachment?: File | null;
}>;

export type FeedbackSubmitResponse = Readonly<{
  message: string;
  feedback: Readonly<{
    id: string;
    createdAt: string;
    hasAttachment: boolean;
  }>;
}>;
