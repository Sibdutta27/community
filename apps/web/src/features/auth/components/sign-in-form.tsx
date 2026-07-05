"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { AuthTrustNote } from "@/features/auth/components/auth-trust-note";
import { AuthField } from "@/features/auth/components/auth-field";
import { useSignInMutation } from "@/features/auth/lib/auth-mutations";
import { accountQueryKeys } from "@/features/dashboard/lib/enrollment-queries";
import { requestJson } from "@/services/http/fetcher";
import type { AccountInfoResponse } from "@/types/enrollment";
import { cn } from "@/lib/utils";
import { appendNextQuery } from "@/lib/auth";
import sharedStyles from "@/features/auth/styles/auth-shared.module.scss";

type SignInValidationTranslator = (
  key: "emailRequired" | "emailInvalid" | "passwordMin",
) => string;

function createSignInSchema(t: SignInValidationTranslator) {
  return z.object({
    email: z
      .string()
      .min(1, t("emailRequired"))
      .pipe(z.email(t("emailInvalid"))),
    password: z.string().min(8, t("passwordMin")),
    rememberMe: z.boolean(),
  });
}

type SignInFormValues = z.infer<ReturnType<typeof createSignInSchema>>;

function resolvePostLoginPath(accountInfo: AccountInfoResponse) {
  if (!accountInfo.hasEnrollment) {
    return "/dashboard";
  }

  const enrollmentStatus =
    accountInfo.enrollmentStatus ?? accountInfo.enrollment?.status ?? "";

  if (enrollmentStatus.toUpperCase() === "SUBMITTED") {
    return "/";
  }

  return "/dashboard";
}

export function SignInForm() {
  const t = useTranslations("auth.signIn");
  const tValidation = useTranslations("auth.signIn.validation");
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const signInMutation = useSignInMutation();
  const schema = useMemo(
    () => createSignInSchema((key) => tValidation(key)),
    [tValidation],
  );
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
    mode: "onTouched",
  });

  const onSubmit = async (values: SignInFormValues) => {
    clearErrors("root");

    try {
      await signInMutation.mutateAsync(values);
      let postLoginPath = "/dashboard";

      try {
        const accountInfo = await requestJson<AccountInfoResponse>(
          "/api/account/info",
          {
            fallbackMessage: t("errors.accountInfo"),
          },
        );
        queryClient.setQueryData(accountQueryKeys.info, accountInfo);
        postLoginPath = resolvePostLoginPath(accountInfo);
      } catch {
        postLoginPath = "/dashboard";
      }

      router.replace(postLoginPath);
      router.refresh();
    } catch (error) {
      setError("root", {
        type: "server",
        message:
          error instanceof Error ? error.message : t("errors.fallback"),
      });
    }
  };

  const isSubmitting = signInMutation.isPending;

  return (
    <form
      className="mx-auto flex w-full max-w-[31rem] flex-col justify-center"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="text-center">
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.3em] uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="text-foreground mt-2 text-[2.1rem] font-semibold tracking-tight sm:text-[2.3rem]">
          {t.rich("title", {
            brand: (chunks) => (
              <span className={sharedStyles.gradientText}>{chunks}</span>
            ),
          })}
        </h1>
      </div>

      <div className="mt-6 space-y-4">
        {errors.root?.message ? (
          <div className={sharedStyles.formError} role="alert">
            {errors.root.message}
          </div>
        ) : null}

        <AuthField
          autoComplete="email"
          name="email"
          label={t("email.label")}
          errorMessage={errors.email?.message}
          register={register}
          placeholder={t("email.placeholder")}
          type="email"
        />

        <AuthField
          autoComplete="current-password"
          name="password"
          label={t("password.label")}
          errorMessage={errors.password?.message}
          register={register}
          placeholder={t("password.placeholder")}
          type="password"
        />
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-4">
        <label className="text-foreground flex cursor-pointer items-center gap-2 text-sm">
          <input
            {...register("rememberMe")}
            className="accent-primary border-border focus-visible:ring-ring size-4 rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            type="checkbox"
          />
          <span>{t("rememberMe")}</span>
        </label>

        <button
          className={cn(
            sharedStyles.linkAccent,
            "focus-visible:ring-ring cursor-pointer rounded-sm text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          )}
          type="button"
        >
          {t("forgotPassword")}
        </button>
      </div>

      <Button
        className="mt-5 text-[0.98rem]"
        fullWidth
        size="lg"
        loading={isSubmitting}
        loadingText={t("submitting")}
        type="submit"
      >
        {t("submit")}
      </Button>

      <p className="text-muted-foreground mt-3.5 text-center text-sm">
        {t("noAccount")}{" "}
        <Link
          className={cn(
            sharedStyles.linkAccent,
            "focus-visible:ring-ring rounded-sm font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          )}
          href={appendNextQuery("/sign-up", searchParams.get("next"))}
        >
          {t("signUpLink")}
        </Link>
      </p>

      <AuthTrustNote />
    </form>
  );
}
