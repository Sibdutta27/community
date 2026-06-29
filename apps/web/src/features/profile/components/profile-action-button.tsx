import { SvgIcon } from "@/components/shared/svg-icon";
import { cn } from "@/lib/utils";

export function ProfileActionButton({
  className,
  iconSrc,
  label,
}: Readonly<{
  className: string;
  iconSrc: string;
  label: string;
}>) {
  return (
    <button
      aria-label={label}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-[#1f8ca5] focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none",
        className,
      )}
      type="button"
    >
      <SvgIcon sizeClassName="size-[0.95rem] sm:size-[1rem]" src={iconSrc} />
    </button>
  );
}
