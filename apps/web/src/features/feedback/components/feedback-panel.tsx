"use client";

import { useId, useState, type ChangeEvent, type FormEvent } from "react";

import { CheckCircle2, Paperclip } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { resolveLocale, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

import {
  FEEDBACK_ATTACHMENT_ACCEPT,
  FEEDBACK_ATTACHMENT_MAX_SIZE,
  FEEDBACK_MESSAGE_MAX_LENGTH,
  isAllowedFeedbackAttachmentType,
} from "../lib/feedback-config";
import { useSubmitFeedbackMutation } from "../lib/feedback-mutations";

// Endonyms, matching the language switcher — the same in every locale.
const languageLabels: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

type FeedbackPanelProps = Readonly<{
  onClose: () => void;
}>;

/**
 * The body of the feedback widget: a short note, an optional picture, and the
 * page context we capture on the member's behalf. Three states — the form, a
 * warm confirmation, and a recoverable error rendered above the still-filled
 * form so nothing they typed is lost.
 */
export function FeedbackPanel({ onClose }: FeedbackPanelProps) {
  const t = useTranslations("feedback");
  const locale = resolveLocale(useLocale());
  const pathname = usePathname();

  const messageId = useId();
  const messageHintId = `${messageId}-hint`;
  const attachmentId = `${messageId}-attachment`;

  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  const submitFeedback = useSubmitFeedbackMutation();

  const submitError = submitFeedback.isError
    ? (submitFeedback.error?.message ?? null)
    : null;

  function resetForm() {
    setMessage("");
    setAttachment(null);
    setValidationError(null);
    setIsSent(false);
    submitFeedback.reset();
  }

  function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setAttachment(null);
      return;
    }

    if (!isAllowedFeedbackAttachmentType(file.type)) {
      setAttachment(null);
      setValidationError(t("errors.attachmentType"));
      event.target.value = "";
      return;
    }

    if (file.size > FEEDBACK_ATTACHMENT_MAX_SIZE) {
      setAttachment(null);
      setValidationError(t("errors.attachmentTooLarge"));
      event.target.value = "";
      return;
    }

    setValidationError(null);
    setAttachment(file);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setValidationError(t("errors.messageRequired"));
      return;
    }

    if (trimmedMessage.length > FEEDBACK_MESSAGE_MAX_LENGTH) {
      setValidationError(t("errors.messageTooLong"));
      return;
    }

    setValidationError(null);

    submitFeedback.mutate(
      {
        message: trimmedMessage,
        // Captured at submit time so the note carries the exact URL the
        // member was looking at, query string included.
        pageUrl:
          typeof window === "undefined" ? pathname : window.location.href,
        locale,
        attachment,
      },
      {
        onSuccess: () => setIsSent(true),
      },
    );
  }

  if (isSent) {
    return (
      <div className="px-5 pt-2 pb-5 text-center">
        <div className="bg-secondary text-secondary-foreground mx-auto flex size-11 items-center justify-center rounded-full">
          <CheckCircle2 aria-hidden="true" className="size-5" />
        </div>

        <p className="text-foreground mt-3 text-[0.95rem] font-semibold tracking-[-0.02em]">
          {t("success.title")}
        </p>
        <p className="text-muted-foreground mt-1.5 text-[0.82rem] leading-[1.5]">
          {t("success.body")}
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <Button fullWidth onClick={resetForm} size="sm" type="button">
            {t("success.another")}
          </Button>
          <Button
            fullWidth
            onClick={onClose}
            size="sm"
            type="button"
            variant="ghost"
          >
            {t("success.done")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="px-5 pt-1 pb-5" noValidate onSubmit={handleSubmit}>
      {submitError ? (
        <p
          className="border-destructive/40 bg-destructive/5 text-destructive mb-3 rounded-lg border px-3 py-2 text-[0.78rem] leading-[1.45]"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}

      <Label className="text-[0.82rem]" htmlFor={messageId}>
        {t("panel.messageLabel")}
      </Label>
      <Textarea
        aria-describedby={messageHintId}
        aria-invalid={validationError ? true : undefined}
        className="mt-1.5 min-h-[6rem] text-[0.85rem]"
        id={messageId}
        maxLength={FEEDBACK_MESSAGE_MAX_LENGTH}
        onChange={(event) => {
          setMessage(event.target.value);
          if (validationError) {
            setValidationError(null);
          }
        }}
        placeholder={t("panel.messagePlaceholder")}
        value={message}
      />
      <p
        className="text-muted-foreground mt-1.5 text-[0.72rem] leading-[1.45]"
        id={messageHintId}
      >
        {t("panel.messageHint")}
      </p>

      <div className="mt-3.5">
        <Label
          className="inline-flex items-center gap-1.5 text-[0.82rem]"
          htmlFor={attachmentId}
        >
          <Paperclip aria-hidden="true" className="size-3.5" />
          {t("panel.attachmentLabel")}
        </Label>
        <input
          accept={FEEDBACK_ATTACHMENT_ACCEPT}
          className={cn(
            "text-muted-foreground mt-1.5 block w-full text-[0.75rem]",
            "file:border-border file:bg-surface-muted file:text-foreground file:mr-3 file:cursor-pointer file:rounded-full file:border file:px-3 file:py-1.5 file:text-[0.75rem] file:font-medium",
            "focus-visible:ring-ring rounded-md focus-visible:ring-2 focus-visible:outline-none",
          )}
          id={attachmentId}
          onChange={handleAttachmentChange}
          type="file"
        />
        <p className="text-muted-foreground mt-1 text-[0.7rem] leading-[1.45]">
          {t("panel.attachmentHint")}
        </p>
      </div>

      <div className="border-border bg-surface-muted mt-3.5 rounded-lg border px-3 py-2">
        <p className="text-foreground text-[0.72rem] font-semibold tracking-[-0.01em]">
          {t("panel.contextTitle")}
        </p>
        <p className="text-muted-foreground mt-1 text-[0.72rem] leading-[1.5]">
          {t("panel.contextPage", { page: pathname })}
        </p>
        <p className="text-muted-foreground text-[0.72rem] leading-[1.5]">
          {t("panel.contextLanguage", { language: languageLabels[locale] })}
        </p>
      </div>

      {validationError ? (
        <p
          className="text-destructive mt-3 text-[0.78rem] leading-[1.45]"
          role="alert"
        >
          {validationError}
        </p>
      ) : null}

      <div className="mt-4 flex items-center gap-2">
        <Button
          fullWidth
          loading={submitFeedback.isPending}
          loadingText={t("panel.submitting")}
          size="sm"
          type="submit"
        >
          {t("panel.submit")}
        </Button>
        <Button onClick={onClose} size="sm" type="button" variant="ghost">
          {t("panel.dismiss")}
        </Button>
      </div>
    </form>
  );
}
