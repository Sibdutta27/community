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

// Near-white light-blue card so it reads like a real, printed ID; dark ink /
// azul text sits comfortably above AA over the whole gradient (ink ~15:1,
// azul ~6:1). The celeste glow is a faint decorative corner wash only.
const CARD_GRADIENT =
  "linear-gradient(150deg, #ffffff 0%, #eef5fc 55%, #e3eefb 100%)";
const CELESTE_GLOW =
  "radial-gradient(circle at 88% 12%, rgba(78,166,220,0.18), transparent 55%)";

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
  valueClassName,
}: Readonly<{
  label: string;
  value: string;
  valueClassName?: string;
}>) {
  return (
    <div className="min-w-0">
      <p className="text-muted-foreground text-[0.5rem] font-semibold tracking-[0.13em] uppercase">
        {label}
      </p>
      <p
        className={cn(
          "text-foreground mt-0.5 truncate text-[0.8rem] leading-tight font-semibold",
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

  const showPhoto = data.photoUrl && !hidePhotoForExport;

  return (
    <div className="w-full max-w-[22rem] shrink-0 lg:w-[19rem] lg:max-w-none xl:w-[20rem]">
      {/* Exported node — the ID card itself. */}
      <div
        ref={cardRef}
        aria-label={t("cardAria")}
        className="border-primary/15 shadow-card-soft relative isolate overflow-hidden rounded-2xl border p-4"
        role="group"
        style={{ background: CARD_GRADIENT }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: CELESTE_GLOW }}
        />

        {/* Header: logo + wordmark, status chip */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="border-border relative size-9 shrink-0 overflow-hidden rounded-full border bg-white p-0.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_3px_8px_-5px_rgba(20,26,34,0.35)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                aria-hidden="true"
                className="size-full rounded-full object-cover"
                src="/images/logo.png"
              />
            </div>
            <div className="min-w-0">
              <p className="text-secondary-foreground text-[0.52rem] font-semibold tracking-[0.12em] uppercase">
                {t("nation")}
              </p>
              <h2 className="font-display text-primary text-[0.95rem] leading-tight font-bold tracking-[-0.02em] uppercase">
                {t("title")}
              </h2>
            </div>
          </div>

          <span className="bg-secondary text-secondary-foreground inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[0.55rem] font-semibold tracking-[0.06em] uppercase">
            {data.isApproved ? (
              <>
                <ShieldCheck aria-hidden="true" className="size-2.5" />
                {t("verified")}
              </>
            ) : data.status === "submitted" ? (
              t("badges.pending")
            ) : (
              t("badges.preview")
            )}
          </span>
        </div>

        {/* Body: photo + stacked fields */}
        <div className="mt-4 flex items-start gap-3">
          <div className="border-border bg-secondary relative size-16 shrink-0 overflow-hidden rounded-lg border sm:size-20">
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
              <div className="text-secondary-foreground flex size-full items-center justify-center text-[1.4rem] font-semibold tracking-[-0.03em]">
                {data.initials}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <Field
              label={t("labels.fullName")}
              value={show(data.fullName)}
              valueClassName="text-[0.88rem] whitespace-normal"
            />
            <Field label={t("labels.memberId")} value={show(data.memberId)} />
            <Field
              label={t("labels.dateOfBirth")}
              value={show(data.dateOfBirth)}
            />
          </div>
        </div>

        <div className="mt-2 space-y-2">
          <Field label={t("labels.yucayeke")} value={show(data.yucayeke)} />
          <Field
            label={t("labels.enrollmentDate")}
            value={show(data.enrollmentDate)}
            valueClassName="uppercase"
          />
        </div>

        {/* Footer: authorization + document number / CTA */}
        <div className="border-border mt-3.5 flex items-end justify-between gap-2 border-t pt-3">
          <div className="min-w-0">
            <p className="text-muted-foreground text-[0.5rem] font-semibold tracking-[0.13em] uppercase">
              {t("authorizedBy")}
            </p>
            <p className="text-foreground mt-0.5 flex items-center gap-1 text-[0.78rem] font-semibold">
              {t("tribalCouncil")}
              {data.isApproved ? (
                <ShieldCheck
                  aria-hidden="true"
                  className="text-primary size-3"
                />
              ) : null}
            </p>
          </div>

          {data.isApproved ? (
            <div className="min-w-0 text-right">
              <p className="text-muted-foreground text-[0.5rem] font-semibold tracking-[0.13em] uppercase">
                {t("labels.documentNumber")}
              </p>
              <p className="text-foreground mt-0.5 truncate text-[0.78rem] font-semibold">
                {data.documentNumber}
              </p>
            </div>
          ) : data.status === "submitted" ? (
            <span className="bg-secondary text-secondary-foreground shrink-0 rounded-full px-2.5 py-1 text-[0.64rem] font-semibold">
              {t("badges.pending")}
            </span>
          ) : (
            <Link
              className="bg-emphasis text-emphasis-foreground focus-visible:ring-primary shrink-0 rounded-full px-3.5 py-1.5 text-[0.72rem] font-bold whitespace-nowrap shadow-[0_10px_18px_-12px_rgba(196,32,50,0.7)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transform-none"
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
        <div className="mt-3 flex flex-wrap items-center gap-2">
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
            <p className="text-destructive text-[0.8rem]" role="status">
              {t("actions.error")}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-muted-foreground mt-2.5 text-[0.8rem] leading-5">
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
