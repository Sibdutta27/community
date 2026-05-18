import { cn } from "@/lib/utils";

import sharedStyles from "../styles/profile-shared.module.scss";
import type { ProfileDocumentsData } from "../config/profile-config";

export function ProfileDocumentsPanel({
  documentsData,
}: Readonly<{
  documentsData: ProfileDocumentsData;
}>) {
  return (
    <div className="space-y-5">
      <header className="max-w-3xl">
        <h2 className="text-[1.45rem] leading-[1.05] font-semibold tracking-[-0.04em] text-[#245f6d] sm:text-[1.7rem] lg:text-[2rem]">
          {documentsData.title}
        </h2>
        <p className="mt-2 text-[0.88rem] leading-5 text-[#245f6d] sm:text-[0.93rem] lg:text-[0.98rem]">
          {documentsData.description}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {documentsData.metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-[16px] border border-[#d7d1c3] bg-white px-4 py-4 shadow-[0_14px_26px_-22px_rgba(36,95,109,0.45)]"
          >
            <p className="text-[11px] font-semibold tracking-[0.03em] text-[#6f7e81] uppercase">
              {metric.label}
            </p>
            <p className="mt-1.5 text-[1.42rem] leading-none font-semibold tracking-[-0.04em] text-[#1f5968] sm:text-[1.56rem]">
              {metric.value}
            </p>
            <p className="mt-2 text-[12px] leading-[1.15rem] text-[#5f7174]">
              {metric.helper}
            </p>
          </article>
        ))}
      </div>

      <article className="rounded-[16px] border border-[#d7d1c3] bg-white p-4 shadow-[0_14px_26px_-22px_rgba(36,95,109,0.4)] sm:p-5">
        <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#245f6d] sm:text-[16px]">
          Document Categories
        </h3>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {documentsData.categories.map((category) => (
            <div
              key={category.label}
              className="rounded-[12px] border border-[#e3e9eb] bg-[#f7fbfc] px-3 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[12px] font-semibold text-[#184551] sm:text-[13px]">
                  {category.label}
                </p>
                <span className="rounded-full bg-[#e7f2f4] px-2 py-0.5 text-[10px] font-semibold text-[#1f5968] sm:text-[11px]">
                  {category.count}
                </span>
              </div>
              <p className="mt-1.5 text-[12px] leading-[1.15rem] text-[#607579]">
                {category.description}
              </p>
              <p className="mt-1.5 text-[11px] font-semibold text-[#2f6c78]">
                {category.required}
              </p>
            </div>
          ))}
        </div>
      </article>

      {documentsData.missingRequired.length > 0 ? (
        <article className="rounded-[16px] border border-[#ecd1cc] bg-[#fff5f3] p-4 shadow-[0_14px_26px_-22px_rgba(140,54,41,0.25)] sm:p-5">
          <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#924639] sm:text-[16px]">
            Missing Required Files
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {documentsData.missingRequired.map((item) => (
              <span
                key={item}
                className="inline-flex rounded-full border border-[#e8c1ba] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#904434]"
              >
                {item}
              </span>
            ))}
          </div>
        </article>
      ) : (
        <article className="rounded-[16px] border border-[#cfe5d6] bg-[#f3fcf6] p-4 shadow-[0_14px_26px_-22px_rgba(41,117,76,0.22)] sm:p-5">
          <p className="text-[13px] font-semibold text-[#2b6c4c] sm:text-[14px]">
            Required document set is complete.
          </p>
        </article>
      )}

      <article className="rounded-[16px] border border-[#d7d1c3] bg-white p-4 shadow-[0_14px_26px_-22px_rgba(36,95,109,0.4)] sm:p-5">
        <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#245f6d] sm:text-[16px]">
          Recent Uploads
        </h3>

        {documentsData.uploads.length > 0 ? (
          <div className="mt-3 space-y-2.5">
            {documentsData.uploads.map((upload) => {
              const normalizedStatus = upload.status.toLowerCase();
              const statusClassName = normalizedStatus.includes("reject")
                ? "border-[#efc8c3] bg-[#fff3f1] text-[#a5463f]"
                : normalizedStatus.includes("approve")
                  ? "border-[#cde5d5] bg-[#f1fbf5] text-[#287347]"
                  : "border-[#d9e2de] bg-[#f5f8f6] text-[#5a6661]";

              return (
                <div
                  key={upload.id}
                  className="rounded-[12px] border border-[#d9e3df] bg-[#f7fbf9] px-3 py-3"
                >
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-[0.84rem] font-semibold tracking-[-0.01em] text-[#243238]">
                        {upload.name}
                      </p>
                      <p className="mt-0.5 text-[0.74rem] text-[#6f7773]">
                        {upload.category} · {upload.size} · {upload.uploadedAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.04em] uppercase",
                          statusClassName,
                        )}
                      >
                        {upload.status}
                      </span>
                      <a
                        className="border-primary/20 text-primary hover:bg-primary/10 rounded-full border bg-white px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.04em] uppercase transition-colors"
                        href={upload.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        View
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
              No uploads available yet.
            </p>
          </div>
        )}
      </article>
    </div>
  );
}
