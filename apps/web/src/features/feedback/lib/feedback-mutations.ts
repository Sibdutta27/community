"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { requestMultipart } from "@/services/http/fetcher";

import type {
  FeedbackSubmitPayload,
  FeedbackSubmitResponse,
} from "./feedback-types";

/**
 * Send an in-app report / suggestion through the BFF.
 *
 * The widget is reachable from the public pages, so `redirectOnUnauthorized`
 * is off: a signed-out visitor must never be bounced to /sign-in for trying
 * to tell us something.
 */
export function useSubmitFeedbackMutation() {
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: ({
      message,
      pageUrl,
      locale,
      attachment,
    }: FeedbackSubmitPayload) => {
      const body = new FormData();
      body.set("message", message);
      body.set("pageUrl", pageUrl);
      body.set("locale", locale);

      if (attachment) {
        body.set("attachment", attachment, attachment.name || "attachment");
      }

      return requestMultipart<FeedbackSubmitResponse>("/api/feedback", {
        method: "POST",
        body,
        fallbackMessage: t("feedbackSubmit"),
        redirectOnUnauthorized: false,
      });
    },
  });
}
