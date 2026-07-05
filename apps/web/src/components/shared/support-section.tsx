import Image from "next/image";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { montserrat, poppins } from "@/styles/fonts";
import { cn } from "@/lib/utils";

type SupportCardKind = "email" | "chat";

type SupportCard = Readonly<{
  kind: SupportCardKind;
  iconSrc: string;
  iconBgClassName: string;
  contactLabel?: string;
  contactHref?: string;
}>;

const supportCards: readonly SupportCard[] = [
  {
    kind: "email",
    iconSrc: "/icons/auth/email-support..svg",
    iconBgClassName: "bg-foreground",
    contactLabel: "support@tainonation.org",
    contactHref: "mailto:support@tainonation.org",
  },
  {
    kind: "chat",
    iconSrc: "/icons/auth/chat-support..svg",
    iconBgClassName: "bg-foreground",
  },
] as const;

function SupportCardItem({ card }: Readonly<{ card: SupportCard }>) {
  const t = useTranslations("support");

  return (
    <article className="border-border bg-surface shadow-card-soft flex h-full flex-col rounded-[18px] border px-3.5 py-4.5 text-center sm:px-4 sm:py-5 lg:px-5">
      <div
        className={cn(
          "mx-auto flex size-10 items-center justify-center rounded-[0.95rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:size-11 lg:size-12",
          card.iconBgClassName,
        )}
      >
        <Image
          alt=""
          aria-hidden="true"
          className="h-4 w-4 object-contain sm:h-4.5 sm:w-4.5"
          height={46}
          src={card.iconSrc}
          width={46}
        />
      </div>

      <h3
        className={cn(
          montserrat.className,
          "text-foreground mt-3.5 text-[1rem] font-semibold tracking-[-0.04em] sm:text-[1.08rem] lg:text-[1.16rem]",
        )}
      >
        {t(`${card.kind}.title`)}
      </h3>
      <p
        className={cn(
          poppins.className,
          "text-muted-foreground mt-2 text-[0.8rem] leading-[1.45] sm:text-[0.86rem]",
        )}
      >
        {t(`${card.kind}.description`)}
      </p>

      {card.kind === "chat" ? (
        <Button
          className="mx-auto mt-4 min-w-28 text-[0.88rem]"
          size="lg"
          type="button"
        >
          {t("chat.cta")}
        </Button>
      ) : (
        <div className="mt-auto pt-4">
          <a
            className={cn(
              montserrat.className,
              "text-foreground focus-visible:ring-ring mx-auto block w-fit rounded-sm text-[0.9rem] font-semibold tracking-[-0.03em] underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:text-[0.96rem] lg:text-[1rem]",
            )}
            href={card.contactHref}
          >
            {card.contactLabel}
          </a>
          <p
            className={cn(
              poppins.className,
              "text-muted-foreground mt-1 text-[0.74rem] leading-[1.45] sm:text-[0.8rem]",
            )}
          >
            {t("email.hours")}
          </p>
        </div>
      )}
    </article>
  );
}

export function SupportSection() {
  const t = useTranslations("support");

  return (
    <section className="relative isolate overflow-x-clip py-6 sm:py-8 lg:py-10">
      <div
        aria-hidden="true"
        className="bg-background absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="border-border bg-surface-muted inline-flex rounded-full border px-4.5 py-1.75 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] sm:px-5 sm:py-2">
            <p
              className={cn(
                poppins.className,
                "text-foreground text-[0.76rem] font-semibold tracking-[-0.02em] sm:text-[0.8rem]",
              )}
            >
              {t("badge")}
            </p>
          </div>

          <h2
            className={cn(
              montserrat.className,
              "text-foreground mt-4 text-[clamp(1.4rem,2.8vw,2.1rem)] font-semibold tracking-[-0.05em] sm:mt-5",
            )}
          >
            {t("title")}
          </h2>
          <p className="text-muted-foreground mx-auto mt-2.5 max-w-3xl text-[0.82rem] leading-[1.45] tracking-[-0.01em] sm:mt-3 sm:text-[0.88rem]">
            {t("subtitle")}
          </p>
        </div>

        <div className="mx-auto mt-6 grid max-w-3xl gap-2.5 sm:mt-7 sm:gap-3 md:grid-cols-2">
          {supportCards.map((card) => (
            <SupportCardItem key={card.kind} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
