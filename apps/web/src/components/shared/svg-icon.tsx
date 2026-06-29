import type { CSSProperties } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type SvgIconProps = Readonly<{
  className?: string;
  sizeClassName: string;
  src: string;
  toneColor?: string;
}>;

export function SvgIcon({
  className,
  sizeClassName,
  src,
  toneColor,
}: SvgIconProps) {
  if (toneColor) {
    const maskedStyle: CSSProperties = {
      backgroundColor: toneColor,
      WebkitMaskImage: `url(${src})`,
      WebkitMaskPosition: "center",
      WebkitMaskRepeat: "no-repeat",
      WebkitMaskSize: "contain",
      maskImage: `url(${src})`,
      maskPosition: "center",
      maskRepeat: "no-repeat",
      maskSize: "contain",
    };

    return (
      <span
        aria-hidden="true"
        className={cn("inline-block shrink-0", sizeClassName, className)}
        style={maskedStyle}
      />
    );
  }

  return (
    <span className={cn("relative shrink-0", sizeClassName, className)}>
      <Image alt="" fill className="object-contain" sizes="100px" src={src} />
    </span>
  );
}
