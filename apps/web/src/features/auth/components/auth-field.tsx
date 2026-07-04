"use client";

import type { HTMLInputTypeAttribute } from "react";

import type { FieldValues, Path, UseFormRegister } from "react-hook-form";

import { cn } from "@/lib/utils";

type AuthFieldProps<TFieldValues extends FieldValues> = Readonly<{
  name: Path<TFieldValues>;
  label: string;
  type: HTMLInputTypeAttribute;
  placeholder: string;
  autoComplete?: string;
  errorMessage?: string;
  register: UseFormRegister<TFieldValues>;
}>;

export function AuthField<TFieldValues extends FieldValues>({
  name,
  label,
  type,
  placeholder,
  autoComplete,
  errorMessage,
  register,
}: AuthFieldProps<TFieldValues>) {
  const fieldErrorId = `${String(name)}-error`;

  return (
    <label className="block" htmlFor={String(name)}>
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label} <span className="text-destructive">*</span>
      </span>

      <input
        autoComplete={autoComplete}
        className={cn(
          "text-foreground border-border bg-surface placeholder:text-muted-foreground focus:border-primary/45 focus:ring-primary/15 flex h-11 w-full rounded-xl border px-4 text-[15px] shadow-[0_8px_18px_-18px_rgba(20,26,34,0.2)] transition-colors outline-none focus:ring-2 sm:h-12",
          errorMessage &&
            "border-destructive/50 focus:border-destructive/60 focus:ring-destructive/20",
        )}
        id={String(name)}
        placeholder={placeholder}
        type={type}
        aria-describedby={errorMessage ? fieldErrorId : undefined}
        aria-invalid={errorMessage ? "true" : "false"}
        {...register(name)}
      />

      {errorMessage ? (
        <p
          className="mt-1.5 text-sm font-medium text-destructive"
          id={fieldErrorId}
        >
          {errorMessage}
        </p>
      ) : null}
    </label>
  );
}
