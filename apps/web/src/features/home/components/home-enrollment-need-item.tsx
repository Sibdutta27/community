import Image from "next/image";

export type HomeEnrollmentNeedItemProps = Readonly<{
  iconSrc: string;
  title: string;
  description: string;
}>;

export function HomeEnrollmentNeedItem({
  iconSrc,
  title,
  description,
}: HomeEnrollmentNeedItemProps) {
  return (
    <li className="flex items-start gap-3.5 sm:gap-4">
      <div className="bg-surface flex size-12 shrink-0 items-center justify-center rounded-full sm:size-13">
        <Image
          alt=""
          aria-hidden="true"
          className="size-6 sm:size-7"
          src={iconSrc}
          width={32}
          height={32}
        />
      </div>

      <div className="min-w-0">
        <h4 className="text-background text-[1rem] font-medium tracking-tight sm:text-[1.18rem]">
          {title}
        </h4>
        <p className="text-background/70 mt-1 text-[0.84rem] leading-[1.45] sm:text-[0.92rem]">
          {description}
        </p>
      </div>
    </li>
  );
}
