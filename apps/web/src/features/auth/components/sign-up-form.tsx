"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, type ReactNode } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm, type UseFormRegister } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { AuthTrustNote } from "@/features/auth/components/auth-trust-note";
import { AuthField } from "@/features/auth/components/auth-field";
import {
  type AuthRegisterPayload,
  useSignUpMutation,
} from "@/features/auth/lib/auth-mutations";
import {
  appendNextQuery,
  getSafeRedirectPath,
  normalizeNamePart,
} from "@/lib/auth";
import { cn } from "@/lib/utils";
import sharedStyles from "@/features/auth/styles/auth-shared.module.scss";

type SignUpValidationTranslator = (
  key:
    | "firstNameRequired"
    | "lastNameRequired"
    | "emailRequired"
    | "emailInvalid"
    | "phoneRequired"
    | "phoneInvalid"
    | "passwordMin"
    | "confirmPasswordMin"
    | "passwordsMismatch"
    | "agreeToTermsRequired",
) => string;

function createSignUpSchema(t: SignUpValidationTranslator) {
  return z
    .object({
      firstName: z.string().min(1, t("firstNameRequired")),
      lastName: z.string().min(1, t("lastNameRequired")),
      email: z
        .string()
        .min(1, t("emailRequired"))
        .pipe(z.email(t("emailInvalid"))),
      phoneNumber: z
        .string()
        .min(1, t("phoneRequired"))
        .regex(/^[+()0-9\s-]{7,20}$/, t("phoneInvalid")),
      password: z.string().min(8, t("passwordMin")),
      confirmPassword: z.string().min(8, t("confirmPasswordMin")),
      agreeToTerms: z.boolean().refine(Boolean, {
        message: t("agreeToTermsRequired"),
      }),
      receiveUpdates: z.boolean(),
    })
    .refine((values) => values.password === values.confirmPassword, {
      message: t("passwordsMismatch"),
      path: ["confirmPassword"],
    });
}

type SignUpFormValues = z.infer<ReturnType<typeof createSignUpSchema>>;

function ConsentLine({
  name,
  children,
  errorMessage,
  register,
}: Readonly<{
  name: keyof Pick<SignUpFormValues, "agreeToTerms" | "receiveUpdates">;
  children: ReactNode;
  errorMessage?: string;
  register: UseFormRegister<SignUpFormValues>;
}>) {
  const errorId = `${name}-error`;

  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          className="accent-primary border-border focus-visible:ring-ring mt-1 size-4 rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          id={name}
          aria-describedby={errorMessage ? errorId : undefined}
          aria-invalid={errorMessage ? "true" : undefined}
          aria-labelledby={`${name}-description`}
          type="checkbox"
          {...register(name)}
        />
        <div
          className="text-foreground text-[15px] leading-6"
          id={`${name}-description`}
        >
          {children}
        </div>
      </div>

      {errorMessage ? (
        <p className="text-destructive mt-2 text-sm font-medium" id={errorId}>
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

export function SignUpForm() {
  const t = useTranslations("auth.signUp");
  const tValidation = useTranslations("auth.signUp.validation");
  const router = useRouter();
  const searchParams = useSearchParams();
  const signUpMutation = useSignUpMutation();
  const schema = useMemo(
    () => createSignUpSchema((key) => tValidation(key)),
    [tValidation],
  );
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
      receiveUpdates: false,
    },
    mode: "onTouched",
  });

  const onSubmit = async (values: SignUpFormValues) => {
    clearErrors("root");

    const firstName = normalizeNamePart(values.firstName);
    const lastName = normalizeNamePart(values.lastName);
    const name = [firstName, lastName].filter(Boolean).join(" ");

    if (!name) {
      setError("root", {
        type: "server",
        message: t("errors.invalidName"),
      });
      return;
    }

    const payload: AuthRegisterPayload = {
      name,
      email: values.email.trim().toLowerCase(),
      password: values.password,
    };

    try {
      await signUpMutation.mutateAsync(payload);
      router.replace(getSafeRedirectPath(searchParams.get("next")));
      router.refresh();
    } catch (error) {
      setError("root", {
        type: "server",
        message:
          error instanceof Error ? error.message : t("errors.fallback"),
      });
    }
  };

  const isSubmitting = signUpMutation.isPending;

  return (
    <form
      className="mx-auto flex w-full max-w-[40rem] flex-col justify-center"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="text-center">
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.3em] uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="text-foreground mt-2 text-[2.05rem] font-semibold tracking-tight sm:text-[2.2rem]">
          {t.rich("title", {
            brand: (chunks) => (
              <span className={sharedStyles.gradientText}>{chunks}</span>
            ),
          })}
        </h1>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {errors.root?.message ? (
          <div className={cn(sharedStyles.formError, "sm:col-span-2")} role="alert">
            {errors.root.message}
          </div>
        ) : null}

        <AuthField
          autoComplete="given-name"
          name="firstName"
          label={t("firstName.label")}
          errorMessage={errors.firstName?.message}
          register={register}
          placeholder={t("firstName.placeholder")}
          type="text"
        />

        <AuthField
          autoComplete="family-name"
          name="lastName"
          label={t("lastName.label")}
          errorMessage={errors.lastName?.message}
          register={register}
          placeholder={t("lastName.placeholder")}
          type="text"
        />
      </div>

      <div className="mt-4 space-y-4">
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
          autoComplete="tel"
          name="phoneNumber"
          label={t("phoneNumber.label")}
          errorMessage={errors.phoneNumber?.message}
          register={register}
          placeholder={t("phoneNumber.placeholder")}
          type="tel"
        />

        <AuthField
          autoComplete="new-password"
          name="password"
          label={t("password.label")}
          errorMessage={errors.password?.message}
          register={register}
          placeholder={t("password.placeholder")}
          type="password"
        />

        <AuthField
          autoComplete="new-password"
          name="confirmPassword"
          label={t("confirmPassword.label")}
          errorMessage={errors.confirmPassword?.message}
          register={register}
          placeholder={t("confirmPassword.placeholder")}
          type="password"
        />
      </div>

      <div className="mt-5 space-y-4">
        <ConsentLine
          name="agreeToTerms"
          errorMessage={errors.agreeToTerms?.message}
          register={register}
        >
          {t.rich("agreeToTerms", {
            terms: (chunks) => (
              <Link
                className={cn(
                  sharedStyles.linkAccent,
                  "focus-visible:ring-ring rounded-sm underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                )}
                href="/terms-of-service"
              >
                {chunks}
              </Link>
            ),
            privacy: (chunks) => (
              <Link
                className={cn(
                  sharedStyles.linkAccent,
                  "focus-visible:ring-ring rounded-sm underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                )}
                href="/privacy-policy"
              >
                {chunks}
              </Link>
            ),
          })}
        </ConsentLine>

        <ConsentLine name="receiveUpdates" register={register}>
          {t("receiveUpdates")}
        </ConsentLine>
      </div>

      <Button
        className="mt-6 text-[0.98rem]"
        fullWidth
        size="lg"
        disabled={isSubmitting}
        loading={isSubmitting}
        loadingText={t("submitting")}
        type="submit"
      >
        {t("submit")}
      </Button>

      <p className="text-muted-foreground mt-3.5 text-center text-sm">
        {t("haveAccount")}{" "}
        <Link
          className={cn(
            sharedStyles.linkAccent,
            "focus-visible:ring-ring rounded-sm font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          )}
          href={appendNextQuery("/sign-in", searchParams.get("next"))}
        >
          {t("signInLink")}
        </Link>
      </p>

      <AuthTrustNote />
    </form>
  );
}
