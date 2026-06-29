"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
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

const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .pipe(z.email("Enter a valid email address")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean(),
});

type SignInFormValues = z.infer<typeof signInSchema>;

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const signInMutation = useSignInMutation();
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
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
            fallbackMessage:
              "Unable to load account enrollment information right now.",
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
          error instanceof Error
            ? error.message
            : "Unable to reach the sign-in service. Please try again in a moment.",
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
        <h1 className="text-foreground text-[2.1rem] font-semibold tracking-[-0.04em] sm:text-[2.3rem]">
          Login to{" "}
          <span className={sharedStyles.gradientText}>Taíno Nation</span>?
        </h1>
      </div>

      <div className="mt-6 space-y-4">
        {errors.root?.message ? (
          <div className={sharedStyles.formError}>{errors.root.message}</div>
        ) : null}

        <AuthField
          autoComplete="email"
          name="email"
          label="Email id"
          errorMessage={errors.email?.message}
          register={register}
          placeholder="Email id"
          type="email"
        />

        <AuthField
          autoComplete="current-password"
          name="password"
          label="Password"
          errorMessage={errors.password?.message}
          register={register}
          placeholder="Minimum 8 Character"
          type="password"
        />
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            {...register("rememberMe")}
            className="text-primary accent-primary size-4 rounded border-slate-300"
            type="checkbox"
          />
          <span>Remember me</span>
        </label>

        <button
          className={cn(
            sharedStyles.linkAccent,
            "cursor-pointer text-sm font-medium",
          )}
          type="button"
        >
          Forgot Password?
        </button>
      </div>

      <Button
        className={cn(
          sharedStyles.submitButtonShadow,
          "mt-5 h-11 rounded-xl text-[0.98rem]",
        )}
        fullWidth
        size="lg"
        loading={isSubmitting}
        loadingText="Logging in..."
        type="submit"
      >
        Log in
      </Button>

      <p className="mt-3.5 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link
          className={cn(sharedStyles.linkAccent, "font-semibold")}
          href={appendNextQuery("/sign-up", searchParams.get("next"))}
        >
          Sign up
        </Link>
      </p>

      <AuthTrustNote />
    </form>
  );
}
