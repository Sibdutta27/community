import Image from "next/image";
import Link from "next/link";

type CommunityQuickLinkCardProps = Readonly<{
  description: string;
  href: string;
  iconBackgroundClassName: string;
  iconSrc: string;
  title: string;
}>;

export function CommunityQuickLinkCard({
  description,
  href,
  iconBackgroundClassName,
  iconSrc,
  title,
}: CommunityQuickLinkCardProps) {
  return (
    <Link
      className="group border-border bg-surface shadow-card-soft hover:shadow-card focus-visible:ring-ring flex h-full min-h-[11.5rem] flex-col rounded-2xl border p-5 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transform-none sm:min-h-[12rem] sm:p-6"
      href={href}
    >
      <div
        className={`flex size-12 items-center justify-center rounded-xl text-white ${iconBackgroundClassName}`}
      >
        <Image alt="" aria-hidden="true" height={22} src={iconSrc} width={22} />
      </div>

      <h3 className="text-foreground mt-4 text-[1.28rem] leading-[1.15] font-semibold tracking-tight sm:text-[1.38rem]">
        {title}
      </h3>

      <p className="text-muted-foreground mt-3 max-w-[22rem] text-[0.9rem] leading-6 sm:text-[0.94rem]">
        {description}
      </p>
    </Link>
  );
}
