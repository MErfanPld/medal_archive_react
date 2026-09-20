"use client";

import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { useCreatableOptions } from "@/hooks/use-creatable-options";

export type CreatableSelectProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  options: readonly ComboboxOption[];
  /** Shared localStorage key so options persist across forms */
  storageKey: string;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
};

/**
 * Combobox bound to RHF with persistent user-added options.
 */
export function CreatableSelect<T extends FieldValues>({
  name,
  control,
  options: baseOptions,
  storageKey,
  id,
  placeholder,
  disabled,
  error,
  className,
}: CreatableSelectProps<T>) {
  const { options, addOption } = useCreatableOptions(baseOptions, storageKey);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Combobox
          id={id}
          options={options}
          value={field.value == null ? "" : String(field.value)}
          onChange={(v) => field.onChange(v)}
          onCreateOption={addOption}
          onBlur={field.onBlur}
          name={field.name}
          allowCustom
          placeholder={placeholder}
          disabled={disabled}
          error={error}
          className={className}
        />
      )}
    />
  );
}
