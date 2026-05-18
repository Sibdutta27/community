import Image from "next/image";

import { cn } from "@/lib/utils";

type SignInBenefitCardProps = Readonly<{
  iconSrc: string;
  title: string;
  description: string;
  className?: string;
}>;

export function SignInBenefitCard({
  iconSrc,
  title,
  description,
  className,
}: SignInBenefitCardProps) {
  return (
    <article
      className={cn(
        "rounded-[1.65rem] border border-white/10 bg-white/16 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-[2px] sm:px-5 sm:py-[1.125rem]",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white/95">
          <Image
            alt=""
            aria-hidden="true"
            className="h-5 w-5 object-contain"
            height={24}
            src={iconSrc}
            width={24}
          />
        </div>

        <div className="min-w-0">
          <h3 className="text-[1rem] font-semibold tracking-[-0.02em] text-white sm:text-[1.08rem]">
            {title}
          </h3>
          <p className="mt-1.5 max-w-sm text-[0.94rem] leading-6 text-white/85">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}
