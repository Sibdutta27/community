import Image from "next/image";
import { Children, type ReactNode } from "react";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const DEFAULT_FIELDS_PER_ROW = [2] as const;

type EnrollmentFormSectionProps = Readonly<{
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  description: string;
  fieldsPerRow?: readonly number[];
  footer?: ReactNode;
  footerClassName?: string;
  headerAction?: ReactNode;
  icon?: LucideIcon;
  iconSrc?: string;
  iconClassName?: string;
  iconWrapperClassName?: string;
  title: string;
}>;

function getRowColumnClassName(fieldCount: number) {
  switch (Math.max(1, Math.min(fieldCount, 4))) {
    case 4:
      return "md:grid-cols-4";
    case 3:
      return "md:grid-cols-3";
    case 2:
      return "md:grid-cols-2";
    default:
      return "md:grid-cols-1";
  }
}

function buildFieldRows(fields: ReactNode[], fieldsPerRow: readonly number[]) {
  const resolvedFieldsPerRow =
    fieldsPerRow.length > 0 ? fieldsPerRow : DEFAULT_FIELDS_PER_ROW;
  const fallbackRowSize = Math.max(
    1,
    Math.min(resolvedFieldsPerRow[resolvedFieldsPerRow.length - 1] ?? 2, 4),
  );
  const rows: ReactNode[][] = [];
  let cursor = 0;

  for (const configuredCount of resolvedFieldsPerRow) {
    const rowSize = Math.max(1, Math.min(configuredCount, 4));
    const rowFields = fields.slice(cursor, cursor + rowSize);

    if (rowFields.length === 0) {
      break;
    }

    rows.push(rowFields);
    cursor += rowSize;
  }

  while (cursor < fields.length) {
    rows.push(fields.slice(cursor, cursor + fallbackRowSize));
    cursor += fallbackRowSize;
  }

  return rows;
}

export function EnrollmentFormSection({
  children,
  className,
  contentClassName,
  description,
  fieldsPerRow = DEFAULT_FIELDS_PER_ROW,
  footer,
  footerClassName,
  headerAction,
  icon: Icon,
  iconSrc,
  iconClassName,
  iconWrapperClassName,
  title,
}: EnrollmentFormSectionProps) {
  const fieldRows = buildFieldRows(Children.toArray(children), fieldsPerRow);

  return (
    <section
      className={cn(
        "rounded-[26px] border border-[#e2e8e4] bg-white p-5 shadow-[0_18px_40px_-34px_rgba(16,47,52,0.18)] sm:rounded-[30px] sm:p-6 lg:p-8",
        className,
      )}
    >
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-start gap-3.5 sm:gap-4">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-[10px] bg-[#00594e] text-white shadow-[0_14px_28px_-22px_rgba(0,89,78,0.56)]",
              iconWrapperClassName,
            )}
          >
            {iconSrc ? (
              <Image
                alt=""
                aria-hidden="true"
                className={cn("h-6 w-6 object-contain", iconClassName)}
                height={24}
                src={iconSrc}
                width={24}
              />
            ) : Icon ? (
              <Icon
                aria-hidden="true"
                className={cn("size-6", iconClassName)}
              />
            ) : null}
          </div>

          <div className="min-w-0 pt-0.5">
            <h2 className="text-[1.05rem] leading-tight font-semibold tracking-[-0.03em] text-[#243238] sm:text-[1.15rem]">
              {title}
            </h2>
            <p className="mt-1 max-w-3xl text-[0.8rem] leading-5 text-[#747976] sm:text-[0.86rem]">
              {description}
            </p>
          </div>
        </div>

        {headerAction ? (
          <div className="shrink-0 self-start sm:pt-0.5">{headerAction}</div>
        ) : null}
      </div>

      <div
        className={cn("mt-6 space-y-4 sm:mt-7 sm:space-y-5", contentClassName)}
      >
        {fieldRows.map((rowFields, rowIndex) => (
          <div
            key={rowIndex}
            className={cn(
              "grid grid-cols-1 gap-4 sm:gap-5",
              getRowColumnClassName(rowFields.length),
            )}
          >
            {rowFields}
          </div>
        ))}
      </div>

      {footer ? (
        <div
          className={cn(
            "mt-5 text-[0.72rem] leading-5 text-[#7d8380] sm:text-[0.78rem]",
            footerClassName,
          )}
        >
          {footer}
        </div>
      ) : null}
    </section>
  );
}
