import Image from "next/image";

import { Button } from "@/components/ui/button";
import { montserrat, poppins } from "@/styles/fonts";
import { cn } from "@/lib/utils";

type SupportCardKind = "phone" | "email" | "chat";

type SupportCard = Readonly<{
  kind: SupportCardKind;
  iconSrc: string;
  iconBgClassName: string;
  title: string;
  description: string;
  contactLabel?: string;
  contactHref?: string;
  contactTextColor?: string;
}>;

const supportCards: readonly SupportCard[] = [
  {
    kind: "phone",
    iconSrc: "/icons/auth/phone-support.svg",
    iconBgClassName: "bg-brand-sky",
    title: "Phone Support",
    description: "Speak with a support representative",
    contactLabel: "(787) 555-0100",
    contactHref: "tel:+17875550100",
    contactTextColor: "#6FAFC4",
  },
  {
    kind: "email",
    iconSrc: "/icons/auth/email-support..svg",
    iconBgClassName: "bg-primary",
    title: "Email Support",
    description: "Send us a detailed message",
    contactLabel: "support@tainonation.org",
    contactHref: "mailto:support@tainonation.org",
    contactTextColor: "#C53133",
  },
  {
    kind: "chat",
    iconSrc: "/icons/auth/chat-support..svg",
    iconBgClassName: "bg-accent",
    title: "Chat in Forums",
    description: "Post your concern in forums",
  },
] as const;

function SupportCardItem({ card }: Readonly<{ card: SupportCard }>) {
  return (
    <article className="border-border bg-surface flex h-full flex-col rounded-[18px] border px-3.5 py-4.5 text-center shadow-[0_16px_30px_-26px_rgba(21,17,13,0.14)] sm:px-4 sm:py-5 lg:px-5">
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
        {card.title}
      </h3>
      <p
        className={cn(
          poppins.className,
          "text-muted-foreground mt-2 text-[0.8rem] leading-[1.45] sm:text-[0.86rem]",
        )}
      >
        {card.description}
      </p>

      {card.kind === "chat" ? (
        <Button
          className="mx-auto mt-4 min-w-28 text-[0.88rem]"
          size="lg"
          type="button"
        >
          Start Chat
        </Button>
      ) : (
        <div className="mt-auto pt-4">
          <a
            className={cn(
              montserrat.className,
              "block text-[0.9rem] font-semibold tracking-[-0.03em] sm:text-[0.96rem] lg:text-[1rem]",
            )}
            href={card.contactHref}
            style={{ color: card.contactTextColor }}
          >
            {card.contactLabel}
          </a>
          <p
            className={cn(
              poppins.className,
              "text-muted-foreground mt-1 text-[0.74rem] leading-[1.45] sm:text-[0.8rem]",
            )}
          >
            Mon-Fri: 9am - 6pm AST
          </p>
        </div>
      )}
    </article>
  );
}

export function SupportSection() {
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
                "text-primary text-[0.76rem] font-semibold tracking-[-0.02em] sm:text-[0.8rem]",
              )}
            >
              We&apos;re Here to Help
            </p>
          </div>

          <h2
            className={cn(
              montserrat.className,
              "text-foreground mt-4 text-[clamp(1.4rem,2.8vw,2.1rem)] font-semibold tracking-[-0.05em] sm:mt-5",
            )}
          >
            Need Assistance?
          </h2>
          <p className="text-muted-foreground mx-auto mt-2.5 max-w-3xl text-[0.82rem] leading-[1.45] tracking-[-0.01em] sm:mt-3 sm:text-[0.88rem]">
            Our support team is available to help you with account access,
            enrollment questions, or technical issues.
          </p>
        </div>

        <div className="mt-6 grid gap-2.5 sm:mt-7 sm:gap-3 md:grid-cols-2 xl:grid-cols-3">
          {supportCards.map((card) => (
            <SupportCardItem key={card.kind} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
