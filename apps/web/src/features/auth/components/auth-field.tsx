"use client";

import { useState, type HTMLInputTypeAttribute } from "react";

import { Eye, EyeOff } from "lucide-react";
import type { FieldValues, Path, UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";
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
  const isPasswordField = type === "password";
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const resolvedType =
    isPasswordField && isPasswordVisible ? "text" : type;

  return (
    <div>
      <label
        className="text-foreground mb-1.5 block text-sm font-medium"
        htmlFor={String(name)}
      >
        {label}{" "}
        <span aria-hidden="true" className="text-destructive">
          *
        </span>
      </label>

      <div className="relative">
        <Input
          autoComplete={autoComplete}
          className={cn(
            isPasswordField && "pr-12",
            errorMessage &&
              "border-destructive/50 focus-visible:border-destructive/60 focus-visible:ring-destructive/20",
          )}
          id={String(name)}
          placeholder={placeholder}
          type={resolvedType}
          aria-describedby={errorMessage ? fieldErrorId : undefined}
          aria-invalid={errorMessage ? "true" : "false"}
          required
          {...register(name)}
        />

        {isPasswordField ? (
          <button
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            aria-pressed={isPasswordVisible}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute inset-y-0 right-1 my-auto flex size-10 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            type="button"
          >
            {isPasswordVisible ? (
              <EyeOff aria-hidden="true" className="size-4.5" />
            ) : (
              <Eye aria-hidden="true" className="size-4.5" />
            )}
          </button>
        ) : null}
      </div>

      {errorMessage ? (
        <p
          className="text-destructive mt-1.5 text-sm font-medium"
          id={fieldErrorId}
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
