import Image from "next/image";

import { useTranslations } from "next-intl";

export function AuthTrustNote() {
  const t = useTranslations("auth.trustNote");

  return (
    <div className="mt-6 text-center">
      <Image
        alt=""
        aria-hidden="true"
        className="mx-auto size-6 object-contain"
        height={28}
        src="/icons/auth/shield.svg"
        width={28}
      />
      <p className="text-foreground mt-2 text-[0.92rem] leading-[1.45] font-medium">
        {t("message")}
      </p>
    </div>
  );
}
