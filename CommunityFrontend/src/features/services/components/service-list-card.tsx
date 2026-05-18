"use client";

import Image from "next/image";

import type { ServiceApiItem } from "@/features/services/types/service";
import { getServiceIconSrc } from "@/features/services/constants/services-content";

type ServiceListCardProps = Readonly<{
  isRegistering: boolean;
  isRegistered: boolean;
  onRegister: () => void;
  service: ServiceApiItem;
}>;

function getAvailabilityLabel(service: ServiceApiItem) {
  const highlightedHours = service.highlights.find((item) =>
    /am|pm|mon|tue|wed|thu|fri|sat|sun/i.test(item),
  );

  return highlightedHours ?? service.highlights[0] ?? "Availability on request";
}

export function ServiceListCard({
  isRegistered,
  isRegistering,
  onRegister,
  service,
}: ServiceListCardProps) {
  const canRegister =
    service.status === "ACTIVE" && !isRegistered && !isRegistering;
  const buttonLabel = isRegistered
    ? "Registered"
    : isRegistering
      ? "Registering..."
      : service.status === "ACTIVE"
        ? "Register Service"
        : "Currently Unavailable";

  return (
    <article className="flex h-full max-w-[31rem] flex-col rounded-[1.05rem] border border-[#eadfce] bg-[linear-gradient(180deg,#F5E7DB_0%,#FFFFFF_100%)] px-3 py-3 shadow-[0_14px_24px_-30px_rgba(16,47,52,0.15)] sm:px-3.5 sm:py-3.5">
      <div className="flex items-start gap-2">
        <div className="flex size-[2.9rem] shrink-0 items-center justify-center rounded-[0.7rem] bg-[#0c6557]">
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
          <h3 className="text-[0.94rem] leading-tight font-semibold tracking-tight text-[#0b3b35] sm:text-[1rem]">
            {service.name}
          </h3>
          <div className="mt-1 flex items-start gap-1.5 text-[0.76rem] leading-4 font-medium text-[#174e47]/82 sm:text-[0.8rem]">
            <Image
              alt=""
              aria-hidden="true"
              className="mt-0.5 h-3.5 w-3.5 shrink-0 object-contain"
              height={14}
              src="/icons/services/location.svg"
              width={14}
            />
            <p>
              {service.location ??
                "Location details available after registration"}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-2.5 text-[0.78rem] leading-5 text-[#2d3136]/86 sm:text-[0.82rem] sm:leading-6">
        {service.description}
      </p>

      <div className="mt-2.5 space-y-1 text-[0.75rem] font-medium text-[#0c6557] sm:text-[0.8rem]">
        <div className="flex items-start gap-1.5">
          <Image
            alt=""
            aria-hidden="true"
            className="mt-0.5 h-3.5 w-3.5 shrink-0 object-contain"
            height={14}
            src="/icons/services/time.svg"
            width={14}
          />
          <p>{getAvailabilityLabel(service)}</p>
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
          <p>
            {service.phone ??
              service.email ??
              "Contact details available inside the directory"}
          </p>
        </div>
      </div>

      <button
        className="mt-3 cursor-pointer rounded-[0.68rem] bg-[linear-gradient(90deg,#c9825d_0%,#a57d46_100%)] px-4 py-2 text-[0.8rem] font-semibold tracking-tight text-white transition-opacity duration-200 hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-55"
        disabled={!canRegister}
        type="button"
        onClick={onRegister}
      >
        {buttonLabel}
      </button>
    </article>
  );
}
