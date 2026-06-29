"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
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

const signUpSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .pipe(z.email("Enter a valid email address")),
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^[+()0-9\s-]{7,20}$/, "Enter a valid phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
    agreeToTerms: z.boolean().refine(Boolean, {
      message: "You must agree to the terms before continuing",
    }),
    receiveUpdates: z.boolean(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

function ConsentLine({
  name,
  children,
  register,
}: Readonly<{
  name: keyof Pick<SignUpFormValues, "agreeToTerms" | "receiveUpdates">;
  children: ReactNode;
  register: UseFormRegister<SignUpFormValues>;
}>) {
  return (
    <div className="flex items-start gap-3">
      <input
        className="text-primary accent-primary mt-1 size-4 rounded border-slate-300"
        id={name}
        aria-labelledby={`${name}-description`}
        type="checkbox"
        {...register(name)}
      />
      <div
        className="text-[15px] leading-6 text-slate-700"
        id={`${name}-description`}
      >
        {children}
      </div>
    </div>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signUpMutation = useSignUpMutation();
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
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
        message: "Please enter a valid first and last name.",
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
          error instanceof Error
            ? error.message
            : "Unable to reach the registration service. Please try again in a moment.",
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
        <h1 className="text-foreground text-[2.05rem] font-semibold tracking-[-0.04em] sm:text-[2.2rem]">
          New to <span className={sharedStyles.gradientText}>Taíno Nation</span>
          ?
        </h1>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {errors.root?.message ? (
          <div className={cn(sharedStyles.formError, "sm:col-span-2")}>
            {errors.root.message}
          </div>
        ) : null}

        <AuthField
          autoComplete="given-name"
          name="firstName"
          label="First Name"
          errorMessage={errors.firstName?.message}
          register={register}
          placeholder="First Name"
          type="text"
        />

        <AuthField
          autoComplete="family-name"
          name="lastName"
          label="Last Name"
          errorMessage={errors.lastName?.message}
          register={register}
          placeholder="Last Name"
          type="text"
        />
      </div>

      <div className="mt-4 space-y-4">
        <AuthField
          autoComplete="email"
          name="email"
          label="Email Id"
          errorMessage={errors.email?.message}
          register={register}
          placeholder="Email Id"
          type="email"
        />

        <AuthField
          autoComplete="tel"
          name="phoneNumber"
          label="Phone No."
          errorMessage={errors.phoneNumber?.message}
          register={register}
          placeholder="Phone No."
          type="tel"
        />

        <AuthField
          autoComplete="new-password"
          name="password"
          label="Create Password"
          errorMessage={errors.password?.message}
          register={register}
          placeholder="Minimum 8 Character"
          type="password"
        />

        <AuthField
          autoComplete="new-password"
          name="confirmPassword"
          label="Confirm Password"
          errorMessage={errors.confirmPassword?.message}
          register={register}
          placeholder="Match the Password"
          type="password"
        />
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <ConsentLine name="agreeToTerms" register={register}>
            I agree to the{" "}
            <Link
              className={cn(
                sharedStyles.linkAccent,
                "underline-offset-2 hover:underline",
              )}
              href="/terms-of-service"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              className={cn(
                sharedStyles.linkAccent,
                "underline-offset-2 hover:underline",
              )}
              href="/privacy-policy"
            >
              Privacy Policy
            </Link>
            , and acknowledge that my data will be stored on sovereign Taíno
            Nation servers.
          </ConsentLine>

          {errors.agreeToTerms?.message ? (
            <p className="mt-2 text-sm font-medium text-red-600">
              {errors.agreeToTerms.message}
            </p>
          ) : null}
        </div>

        <div>
          <ConsentLine name="receiveUpdates" register={register}>
            Send me updates about enrollment status, community events, and
            important announcements
          </ConsentLine>
        </div>
      </div>

      <Button
        className={cn(
          sharedStyles.submitButtonShadow,
          "mt-6 h-11 rounded-xl text-[0.98rem]",
        )}
        fullWidth
        size="lg"
        disabled={isSubmitting}
        loading={isSubmitting}
        loadingText="Creating account..."
        type="submit"
      >
        Join Now
      </Button>

      <p className="mt-3.5 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          className={cn(sharedStyles.linkAccent, "font-semibold")}
          href={appendNextQuery("/sign-in", searchParams.get("next"))}
        >
          Sign In
        </Link>
      </p>

      <AuthTrustNote />
    </form>
  );
}
