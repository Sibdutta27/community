"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { SurfaceCard } from "@/components/shared/surface-card";
import { Button } from "@/components/ui/button";
import { getServiceIconSrc } from "@/features/services/constants/services-content";
import type { ServiceApiItem } from "@/features/services/types/service";

type ServiceListCardProps = Readonly<{
  isRegistering: boolean;
  isRegistered: boolean;
  onRegister: () => void;
  service: ServiceApiItem;
}>;

/** Returns an authored availability string, or `null` for the i18n fallback. */
function getAvailabilityLabel(service: ServiceApiItem) {
  const highlightedHours = service.highlights.find((item) =>
    /am|pm|mon|tue|wed|thu|fri|sat|sun/i.test(item),
  );

  return highlightedHours ?? service.highlights[0] ?? null;
}

export function ServiceListCard({
  isRegistered,
  isRegistering,
  onRegister,
  service,
}: ServiceListCardProps) {
  const t = useTranslations("services.card");
  const canRegister =
    service.status === "ACTIVE" && !isRegistered && !isRegistering;
  const buttonLabel = isRegistered
    ? t("registered")
    : service.status === "ACTIVE"
      ? t("register")
      : t("unavailable");

  return (
    <SurfaceCard as="article" className="flex h-full max-w-[31rem] flex-col">
      <div className="flex items-start gap-3">
        <div className="bg-foreground flex size-12 shrink-0 items-center justify-center rounded-xl">
          <Image
            alt=""
            aria-hidden="true"
            className="h-5 w-5 object-contain"
            height={20}
            src={getServiceIconSrc(service)}
            width={20}
          />
        </div>

        <div className="min-w-0">
          <h3 className="text-foreground text-[0.94rem] leading-tight font-semibold tracking-tight sm:text-[1rem]">
            {service.name}
          </h3>
          <div className="text-muted-foreground mt-1 flex items-start gap-1.5 text-[0.76rem] leading-4 font-medium sm:text-[0.8rem]">
            <Image
              alt=""
              aria-hidden="true"
              className="mt-0.5 h-3.5 w-3.5 shrink-0 object-contain"
              height={14}
              src="/icons/services/location.svg"
              width={14}
            />
            <p>{service.location ?? t("locationFallback")}</p>
          </div>
        </div>
      </div>

      <p className="text-muted-foreground mt-3 text-[0.78rem] leading-5 sm:text-[0.82rem] sm:leading-6">
        {service.description}
      </p>

      <div className="text-foreground mt-3 space-y-1 text-[0.75rem] font-medium sm:text-[0.8rem]">
        <div className="flex items-start gap-1.5">
          <Image
            alt=""
            aria-hidden="true"
            className="mt-0.5 h-3.5 w-3.5 shrink-0 object-contain"
            height={14}
            src="/icons/services/time.svg"
            width={14}
          />
          <p>{getAvailabilityLabel(service) ?? t("availabilityFallback")}</p>
        </div>
        <div className="flex items-start gap-1.5">
          <Image
            alt=""
            aria-hidden="true"
            className="mt-0.5 h-3.5 w-3.5 shrink-0 object-contain"
            height={14}
            src="/icons/services/phone.svg"
            width={14}
          />
          <p>{service.phone ?? service.email ?? t("contactFallback")}</p>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <Button
          disabled={!canRegister}
          fullWidth
          loading={isRegistering}
          loadingText={t("registering")}
          size="sm"
          type="button"
          onClick={onRegister}
        >
          {buttonLabel}
        </Button>
      </div>
    </SurfaceCard>
  );
}
