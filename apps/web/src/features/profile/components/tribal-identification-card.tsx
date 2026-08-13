"use client";

import { useRef, useState } from "react";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { downloadBlob, exportNodeToPdf, exportNodeToPng } from "@/lib/download";
import type { IdCardData } from "@/features/profile/lib/id-card-data";

import { TribalIdCardFace } from "./tribal-id-card-face";

/** Waits two frames so a state-driven re-render is painted before re-export. */
function nextPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function safeFilePart(value: string) {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "member";
}

/**
 * A member's tribal ID: the card face plus the actions that turn it into a
 * file. The face lives in `tribal-id-card-face` so surfaces that only need to
 * *show* a card — the marketing hero — do not pull jsPDF and html-to-image
 * into their bundle along with it.
 */
export function TribalIdentificationCard({
  data,
}: Readonly<{ data: IdCardData }>) {
  const t = useTranslations("profile.idCard");
  const cardRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState<null | "pdf" | "png">(null);
  const [hasError, setHasError] = useState(false);
  const [hidePhotoForExport, setHidePhotoForExport] = useState(false);

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

  return (
    // Width/height come from the deck that owns both faces, so the two
    // stay dimensionally identical through the flip.
    <div className="flex h-full w-full flex-col">
      <TribalIdCardFace
        cardRef={cardRef}
        data={data}
        hidePhoto={hidePhotoForExport}
      />

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
