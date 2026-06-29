"use client";

import type {
  HTMLInputTypeAttribute,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import type {
  Control,
  ControllerFieldState,
  FieldPath,
  FieldValues,
} from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type SharedFieldProps<TFieldValues extends FieldValues> = Readonly<{
  className?: string;
  control: Control<TFieldValues>;
  label: string;
  name: FieldPath<TFieldValues>;
  required?: boolean;
}>;

type EnrollmentInputFieldProps<TFieldValues extends FieldValues> =
  SharedFieldProps<TFieldValues> &
    Readonly<{
      autoComplete?: string;
      inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
      placeholder?: string;
      readOnly?: boolean;
      type?: HTMLInputTypeAttribute;
    }>;

type EnrollmentDateFieldProps<TFieldValues extends FieldValues> =
  SharedFieldProps<TFieldValues> &
    Readonly<{
      max?: string;
      min?: string;
      placeholder: string;
    }>;

type EnrollmentSelectFieldProps<TFieldValues extends FieldValues> =
  SharedFieldProps<TFieldValues> &
    Readonly<{
      options: readonly { label: string; value: string }[];
      placeholder: string;
    }>;

type EnrollmentRadioGroupFieldProps<TFieldValues extends FieldValues> =
  SharedFieldProps<TFieldValues> &
    Readonly<{
      optionClassName?: string;
      options: readonly { label: string; value: string }[];
    }>;

type EnrollmentTextareaFieldProps<TFieldValues extends FieldValues> =
  SharedFieldProps<TFieldValues> &
    Readonly<{
      placeholder?: string;
      rows?: TextareaHTMLAttributes<HTMLTextAreaElement>["rows"];
    }>;

type EnrollmentCheckboxFieldProps<TFieldValues extends FieldValues> = Readonly<{
  className?: string;
  control: Control<TFieldValues>;
  description?: string;
  label: string;
  name: FieldPath<TFieldValues>;
  variant?: "card" | "inline" | "plain";
}>;

const fieldContainerClassName = "w-full max-w-[34rem] justify-self-start";
const fieldLabelClassName =
  "text-[0.82rem] font-medium tracking-[-0.02em] text-[#5f666a]";

type RadioOption = {
  label: string;
  value: string;
};

function FieldLabel({
  label,
  required = false,
}: Readonly<{
  label: string;
  required?: boolean;
}>) {
  return (
    <FormLabel className={fieldLabelClassName}>
      {label}
      {required ? <span className="text-[#d65a52]"> *</span> : null}
    </FormLabel>
  );
}

function FieldLegend({
  label,
  required = false,
}: Readonly<{
  label: string;
  required?: boolean;
}>) {
  const { error, formItemId } = useFormField();

  return (
    <legend
      className={cn(fieldLabelClassName, error && "text-red-600")}
      id={`${formItemId}-legend`}
    >
      {label}
      {required ? <span className="text-[#d65a52]"> *</span> : null}
    </legend>
  );
}

function resolveFieldValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function EnrollmentRadioGroupControl<TFieldValues extends FieldValues>({
  fieldName,
  fieldRef,
  fieldValue,
  fieldState,
  label,
  name,
  onFieldBlur,
  onFieldChange,
  optionClassName,
  options,
  required,
}: Readonly<{
  fieldName: string;
  fieldRef: (instance: HTMLDivElement | null) => void;
  fieldValue: string;
  fieldState: ControllerFieldState;
  label: string;
  name: FieldPath<TFieldValues>;
  onFieldBlur: () => void;
  onFieldChange: (value: string) => void;
  optionClassName?: string;
  options: readonly RadioOption[];
  required?: boolean;
}>) {
  const { formItemId } = useFormField();
  const legendId = `${formItemId}-legend`;

  return (
    <>
      <fieldset className="space-y-2">
        <FieldLegend label={label} required={required} />
        <FormControl>
          <RadioGroup
            aria-labelledby={legendId}
            className="gap-3"
            name={fieldName}
            onBlur={onFieldBlur}
            onValueChange={onFieldChange}
            ref={fieldRef}
            value={fieldValue}
          >
            {options.map((option) => {
              const optionId = `${String(name)}-${option.value}`;
              const isSelected = fieldValue === option.value;

              return (
                <label
                  className={cn(
                    "flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-[#dedede] bg-[#f8f8f8] px-4 py-3.5 transition-colors",
                    isSelected && "border-primary/35 bg-primary/8",
                    fieldState.error && "border-red-300",
                    optionClassName,
                  )}
                  htmlFor={optionId}
                  key={option.value}
                >
                  <RadioGroupItem id={optionId} value={option.value} />
                  <span className="text-[0.98rem] font-medium tracking-[-0.02em] text-[#243238]">
                    {option.label}
                  </span>
                </label>
              );
            })}
          </RadioGroup>
        </FormControl>
      </fieldset>
      <FormMessage />
    </>
  );
}

export function EnrollmentInputField<TFieldValues extends FieldValues>({
  autoComplete,
  className,
  control,
  inputMode,
  label,
  name,
  placeholder,
  readOnly = false,
  required = false,
  type = "text",
}: EnrollmentInputFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn(fieldContainerClassName, className)}>
          <FieldLabel label={label} required={required} />
          <FormControl>
            <Input
              autoComplete={autoComplete}
              className={cn(
                readOnly && "cursor-default bg-[#ebefee] text-[#687174]",
                fieldState.error &&
                  "border-red-300 focus-visible:border-red-400/50 focus-visible:ring-red-200/50",
              )}
              inputMode={inputMode}
              placeholder={placeholder}
              readOnly={readOnly}
              type={type}
              {...field}
              value={resolveFieldValue(field.value)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function EnrollmentDateField<TFieldValues extends FieldValues>({
  className,
  control,
  label,
  max,
  min,
  name,
  placeholder,
  required = false,
}: EnrollmentDateFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        return (
          <FormItem className={cn(fieldContainerClassName, className)}>
            <FieldLabel label={label} required={required} />
            <FormControl>
              <Input
                className={cn(
                  "cursor-pointer",
                  fieldState.error &&
                    "border-red-300 focus-visible:border-red-400/50 focus-visible:ring-red-200/50",
                )}
                max={max}
                min={min}
                placeholder={placeholder}
                type="date"
                {...field}
                value={resolveFieldValue(field.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

export function EnrollmentSelectField<TFieldValues extends FieldValues>({
  className,
  control,
  label,
  name,
  options,
  placeholder,
  required = false,
}: EnrollmentSelectFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn(fieldContainerClassName, className)}>
          <FieldLabel label={label} required={required} />
          <Select
            onOpenChange={(nextOpen) => {
              if (!nextOpen) {
                field.onBlur();
              }
            }}
            name={field.name}
            onValueChange={field.onChange}
            value={resolveFieldValue(field.value)}
          >
            <FormControl>
              <SelectTrigger
                className={cn(
                  fieldState.error &&
                    "border-red-300 focus-visible:border-red-400/50 focus-visible:ring-red-200/50",
                )}
                onBlur={field.onBlur}
                ref={field.ref}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function EnrollmentRadioGroupField<TFieldValues extends FieldValues>({
  className,
  control,
  label,
  name,
  optionClassName,
  options,
  required = false,
}: EnrollmentRadioGroupFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn(fieldContainerClassName, className)}>
          <EnrollmentRadioGroupControl
            fieldName={field.name}
            fieldRef={field.ref}
            fieldValue={resolveFieldValue(field.value)}
            fieldState={fieldState}
            label={label}
            name={name}
            onFieldBlur={field.onBlur}
            onFieldChange={field.onChange}
            optionClassName={optionClassName}
            options={options}
            required={required}
          />
        </FormItem>
      )}
    />
  );
}

export function EnrollmentTextareaField<TFieldValues extends FieldValues>({
  className,
  control,
  label,
  name,
  placeholder,
  required = false,
  rows = 4,
}: EnrollmentTextareaFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn(fieldContainerClassName, className)}>
          <FieldLabel label={label} required={required} />
          <FormControl>
            <Textarea
              className={cn(
                fieldState.error &&
                  "border-red-300 focus-visible:border-red-400/50 focus-visible:ring-red-200/50",
              )}
              placeholder={placeholder}
              rows={rows}
              {...field}
              value={resolveFieldValue(field.value)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function EnrollmentCheckboxField<TFieldValues extends FieldValues>({
  className,
  control,
  description,
  label,
  name,
  variant = "card",
}: EnrollmentCheckboxFieldProps<TFieldValues>) {
  const isInline = variant === "inline";
  const isPlain = variant === "plain";

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <label
            className={cn(
              isPlain
                ? "inline-flex min-h-0 cursor-pointer items-center gap-2.5"
                : isInline
                  ? "inline-flex min-h-0 cursor-pointer items-center gap-2.5 rounded-full border border-[#d7e2dd] bg-[#f7fbf9] px-3.5 py-2"
                  : "flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-[#e3e7e4] bg-[#f8faf9] px-4 py-3",
            )}
          >
            <FormControl>
              <Checkbox
                checked={Boolean(field.value)}
                className={cn(!isInline && !isPlain && "mt-0.5")}
                name={field.name}
                onBlur={field.onBlur}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                ref={field.ref}
              />
            </FormControl>
            <span
              className={cn("min-w-0", (isInline || isPlain) && "leading-none")}
            >
              <span
                className={cn(
                  "block font-medium tracking-[-0.02em] text-[#2d383d]",
                  isInline || isPlain ? "text-[0.86rem]" : "text-[0.9rem]",
                )}
              >
                {label}
              </span>
              {description && !isInline && !isPlain ? (
                <span className="mt-0.5 block text-[0.78rem] leading-5 text-[#7a817d]">
                  {description}
                </span>
              ) : null}
            </span>
          </label>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
