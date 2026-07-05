import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import sharedStyles from "../styles/profile-shared.module.scss";
import type { ProfileDocumentsData } from "../config/profile-config";

export function ProfileDocumentsPanel({
  documentsData,
}: Readonly<{
  documentsData: ProfileDocumentsData;
}>) {
  const t = useTranslations("profile");

  return (
    <div className="space-y-5">
      <header className="max-w-3xl">
        <h2 className="text-foreground text-[1.45rem] leading-[1.05] font-semibold tracking-tight sm:text-[1.7rem] lg:text-[2rem]">
          {documentsData.title}
        </h2>
        <p className="text-muted-foreground mt-2 text-[0.88rem] leading-5 sm:text-[0.93rem] lg:text-[0.98rem]">
          {documentsData.description}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {documentsData.metrics.map((metric) => (
          <article
            key={metric.label}
            className="border-border bg-surface shadow-card-soft rounded-xl border px-4 py-4"
          >
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.03em] uppercase">
              {metric.label}
            </p>
            <p className="text-foreground mt-1.5 text-[1.42rem] leading-none font-semibold tracking-tight sm:text-[1.56rem]">
              {metric.value}
            </p>
            <p className="text-muted-foreground mt-2 text-[12px] leading-[1.15rem]">
              {metric.helper}
            </p>
          </article>
        ))}
      </div>

      <article className="border-border bg-surface shadow-card-soft rounded-xl border p-4 sm:p-5">
        <h3 className="text-foreground text-[15px] font-semibold tracking-tight sm:text-[16px]">
          {t("documents.categoriesTitle")}
        </h3>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {documentsData.categories.map((category) => (
            <div
              key={category.label}
              className="border-border bg-surface-muted rounded-lg border px-3 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-foreground min-w-0 truncate text-[12px] font-semibold sm:text-[13px]">
                  {category.label}
                </p>
                <span className="bg-secondary text-secondary-foreground shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-[11px]">
                  {category.count}
                </span>
              </div>
              <p className="text-muted-foreground mt-1.5 text-[12px] leading-[1.15rem]">
                {category.description}
              </p>
              <p className="text-foreground mt-1.5 text-[11px] font-semibold">
                {category.required}
              </p>
            </div>
          ))}
        </div>
      </article>

      {documentsData.missingRequired.length > 0 ? (
        <article className="border-destructive/30 bg-destructive/5 shadow-card-soft rounded-xl border p-4 sm:p-5">
          <h3 className="text-destructive text-[15px] font-semibold tracking-tight sm:text-[16px]">
            {t("documents.missingRequiredTitle")}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {documentsData.missingRequired.map((item) => (
              <span
                key={item}
                className="border-destructive/30 bg-destructive/10 text-destructive inline-flex rounded-full border px-3 py-1.5 text-[12px] font-semibold"
              >
                {item}
              </span>
            ))}
          </div>
        </article>
      ) : (
        <article className="border-border bg-secondary shadow-card-soft rounded-xl border p-4 sm:p-5">
          <p className="text-secondary-foreground text-[13px] font-semibold sm:text-[14px]">
            {t("documents.requiredComplete")}
          </p>
        </article>
      )}

      <article className="border-border bg-surface shadow-card-soft rounded-xl border p-4 sm:p-5">
        <h3 className="text-foreground text-[15px] font-semibold tracking-tight sm:text-[16px]">
          {t("documents.recentUploads")}
        </h3>

        {documentsData.uploads.length > 0 ? (
          <div className="mt-3 space-y-2.5">
            {documentsData.uploads.map((upload) => {
              const normalizedStatus = upload.status.toLowerCase();
              const statusClassName = normalizedStatus.includes("reject")
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : normalizedStatus.includes("approve")
                  ? "border-border bg-secondary text-secondary-foreground"
                  : "border-border bg-surface-muted text-foreground";

              return (
                <div
                  key={upload.id}
                  className="border-border bg-surface rounded-lg border px-3 py-3"
                >
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-foreground truncate text-[0.84rem] font-semibold tracking-[-0.01em]">
                        {upload.name}
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-[0.74rem]">
                        {upload.category} · {upload.size} · {upload.uploadedAt}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.04em] uppercase",
                          statusClassName,
                        )}
                      >
                        {upload.status}
                      </span>
                      <a
                        className="border-primary/20 text-primary hover:bg-primary/10 bg-surface rounded-full border px-3 py-1.5 text-[0.68rem] font-semibold tracking-[0.04em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                        href={upload.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {t("documents.view")}
                        <span className="sr-only"> {upload.name}</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={cn(sharedStyles.emptyStatePlain, "mt-3 px-4 py-6")}>
            <p className={cn(sharedStyles.emptyDescription, "text-[13px]")}>
              {t("documents.noUploads")}
            </p>
          </div>
        )}
      </article>
    </div>
  );
}
