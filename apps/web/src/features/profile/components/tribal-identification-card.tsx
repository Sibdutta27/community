"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { downloadBlob, exportNodeToPdf, exportNodeToPng } from "@/lib/download";
import { cn } from "@/lib/utils";
import type { IdCardData } from "@/features/profile/lib/id-card-data";

const ENROLL_HREF = "/dashboard#enrollment-dashboard";

// AA-safe with white text end to end (white on #1d6fb8 ≈ 5.0:1); the celeste
// glow is decorative only and never sits under small text.
const CARD_GRADIENT =
  "linear-gradient(135deg, #1d6fb8 0%, #0f5eae 55%, #0a56a8 100%)";
const CELESTE_GLOW =
  "radial-gradient(circle at 86% 14%, rgba(78,166,220,0.55), transparent 55%)";

/** Waits two frames so a state-driven re-render is painted before re-export. */
function nextPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function safeFilePart(value: string) {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "member";
}

function Field({
  label,
  value,
  className,
  valueClassName,
}: Readonly<{
  label: string;
  value: string;
  className?: string;
  valueClassName?: string;
}>) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-[0.58rem] font-semibold tracking-[0.14em] text-white/90 uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 truncate text-[0.95rem] leading-tight font-semibold text-white",
          valueClassName,
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function TribalIdentificationCard({
  data,
}: Readonly<{ data: IdCardData }>) {
  const t = useTranslations("profile.idCard");
  const cardRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState<null | "pdf" | "png">(null);
  const [hasError, setHasError] = useState(false);
  const [hidePhotoForExport, setHidePhotoForExport] = useState(false);

  const pendingValue = t("pendingValue");
  const show = (value: string) => value || pendingValue;

  async function doExport(node: HTMLElement, kind: "pdf" | "png") {
    const stem = `taino-nation-id-${safeFilePart(data.memberId)}`;

    if (kind === "pdf") {
      downloadBlob(await exportNodeToPdf(node), `${stem}.pdf`);
    } else {
      downloadBlob(await exportNodeToPng(node), `${stem}.png`);
    }
  }

  async function handleExport(kind: "pdf" | "png") {
    const node = cardRef.current;

    if (!node || pending) {
      return;
    }

    setHasError(false);
    setPending(kind);

    try {
      await doExport(node, kind);
    } catch {
      // A cross-origin member photo without CORS taints the canvas — retry
      // once with the photo hidden (initials avatar) so the export succeeds.
      if (data.photoUrl && !hidePhotoForExport) {
        try {
          setHidePhotoForExport(true);
          await nextPaint();
          await doExport(node, kind);
        } catch {
          setHasError(true);
        } finally {
          setHidePhotoForExport(false);
        }
      } else {
        setHasError(true);
      }
    } finally {
      setPending(null);
    }
  }

  const isPreview = !data.isApproved;
  const showPhoto = data.photoUrl && !hidePhotoForExport;

  return (
    <div className="mr-auto mb-8 w-full max-w-[34rem]">
      {/* Exported node — the card itself. */}
      <div
        ref={cardRef}
        aria-label={t("cardAria")}
        className="text-primary-foreground shadow-card relative isolate overflow-hidden rounded-2xl p-5 sm:p-6"
        role="group"
        style={{ background: CARD_GRADIENT }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: CELESTE_GLOW }}
        />

        {/* Header: logo + wordmark, status chip */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative size-11 shrink-0 overflow-hidden rounded-full border border-white/40 bg-white/95 p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_4px_10px_-6px_rgba(20,26,34,0.4)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                aria-hidden="true"
                className="size-full rounded-full object-cover"
                src="/images/logo.png"
              />
            </div>
            <div>
              <p className="text-[0.6rem] font-semibold tracking-[0.16em] text-white/90 uppercase">
                {t("nation")}
              </p>
              <h2 className="font-display text-[1.15rem] leading-tight font-bold tracking-[-0.02em] text-white uppercase sm:text-[1.3rem]">
                {t("title")}
              </h2>
            </div>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[0.6rem] font-semibold tracking-[0.08em] text-white uppercase backdrop-blur-sm">
            {data.isApproved ? (
              <>
                <ShieldCheck aria-hidden="true" className="size-3" />
                {t("verified")}
              </>
            ) : data.status === "submitted" ? (
              t("badges.pending")
            ) : (
              t("badges.preview")
            )}
          </span>
        </div>

        {/* Body: photo + fields */}
        <div className="mt-5 flex items-start gap-4">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-white/30 bg-white/15 sm:size-28">
            {showPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                aria-hidden="true"
                className="size-full object-cover"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                src={data.photoUrl}
              />
            ) : (
              <div className="flex size-full items-center justify-center text-[1.9rem] font-semibold tracking-[-0.03em] text-white">
                {data.initials}
              </div>
            )}
          </div>

          <div
            className={cn(
              "min-w-0 flex-1 space-y-2.5",
              isPreview && "opacity-95",
            )}
          >
            <Field
              label={t("labels.fullName")}
              value={show(data.fullName)}
              valueClassName="text-[1.02rem] tracking-[0.01em] whitespace-normal"
            />
            <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-5">
              <Field
                className="sm:flex-1"
                label={t("labels.memberId")}
                value={show(data.memberId)}
              />
              <Field
                className="sm:flex-1"
                label={t("labels.dateOfBirth")}
                value={show(data.dateOfBirth)}
              />
            </div>
            <Field label={t("labels.yucayeke")} value={show(data.yucayeke)} />
            <Field
              label={t("labels.enrollmentDate")}
              value={show(data.enrollmentDate)}
              valueClassName="uppercase"
            />
          </div>
        </div>

        {/* Footer: authorization + document number / CTA */}
        <div className="mt-5 flex items-end justify-between gap-3 border-t border-white/20 pt-3.5">
          <div className="min-w-0">
            <p className="text-[0.58rem] font-semibold tracking-[0.14em] text-white/90 uppercase">
              {t("authorizedBy")}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[0.9rem] font-semibold text-white">
              {t("tribalCouncil")}
              {data.isApproved ? (
                <ShieldCheck aria-hidden="true" className="size-3.5" />
              ) : null}
            </p>
          </div>

          {data.isApproved ? (
            <div className="min-w-0 text-right">
              <p className="text-[0.58rem] font-semibold tracking-[0.14em] text-white/90 uppercase">
                {t("labels.documentNumber")}
              </p>
              <p className="mt-0.5 truncate text-[0.9rem] font-semibold text-white">
                {data.documentNumber}
              </p>
            </div>
          ) : data.status === "submitted" ? (
            <span className="shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-[0.72rem] font-semibold text-white">
              {t("badges.pending")}
            </span>
          ) : (
            <Link
              className="text-primary focus-visible:ring-primary-foreground shrink-0 rounded-full bg-white px-4 py-2 text-[0.78rem] font-bold whitespace-nowrap shadow-[0_10px_20px_-12px_rgba(0,0,0,0.5)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:outline-none motion-reduce:transform-none"
              href={ENROLL_HREF}
            >
              {data.status === "rejected"
                ? t("cta.updateEnrollment")
                : t("cta.enrollNow")}
            </Link>
          )}
        </div>
      </div>

      {/* Below the card: downloads (approved) or a status note (preview). */}
      {data.isApproved ? (
        <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
          <Button
            disabled={Boolean(pending)}
            loading={pending === "pdf"}
            loadingText={t("actions.generating")}
            onClick={() => void handleExport("pdf")}
            size="sm"
            type="button"
          >
            {t("actions.downloadPdf")}
          </Button>
          <Button
            disabled={Boolean(pending)}
            loading={pending === "png"}
            loadingText={t("actions.generating")}
            onClick={() => void handleExport("png")}
            size="sm"
            type="button"
            variant="outline"
          >
            {t("actions.saveImage")}
          </Button>
          {hasError ? (
            <p className="text-destructive text-[0.82rem]" role="status">
              {t("actions.error")}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-muted-foreground mt-3 max-w-[34rem] text-[0.86rem] leading-6">
          {data.status === "submitted"
            ? t("notes.submitted")
            : data.status === "rejected"
              ? t("notes.rejected")
              : t("notes.preview")}
        </p>
      )}
    </div>
  );
}
