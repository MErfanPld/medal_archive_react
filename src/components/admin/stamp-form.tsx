"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/data/categories";
import type { Stamp, StampRequest } from "@/types/stamps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  qualityOptions,
  authenticityOptions,
  currencyOptions,
  countryOptions,
  materialOptions,
  historicalPeriodOptions,
  yearOptions,
} from "@/components/admin/medal-form-options";
import { Combobox } from "@/components/ui/combobox";
import { CalendarDateField } from "@/components/ui/calendar-date-field";
import { clampToTodayOrPast } from "@/lib/calendar";

const schema = z.object({
  name: z.string().min(2, "نام الزامی است"),
  category_id: z.union([z.string(), z.number(), z.null()]).optional().transform((v) => {
    if (v === "" || v == null) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }),
  country: z.string().optional(),
  year: z.union([z.string(), z.number(), z.null()]).optional().transform((v) => {
    if (v === "" || v == null) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }),
  historical_period: z.string().optional(),
  material: z.string().optional(),
  denomination: z.string().optional().nullable(),
  series: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.string().optional().nullable(),
  maker: z.string().optional(),
  catalog_number: z.string().optional(),
  quality: z.string().optional(),
  authenticity: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean().optional(),
  purchase_currency: z.string().optional(),
  current_value: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

function toDefaults(item?: Stamp | null): FormValues {
  return {
    name: item?.name ?? "",
    category_id: item?.category_id ?? null,
    country: item?.country ?? "",
    year: item?.year ?? null,
    historical_period: item?.historical_period ?? "",
    material: item?.material ?? "",
    denomination: item?.denomination ?? "",
    series: item?.series ?? "",
    dimensions: item?.dimensions ?? "",
    weight: item?.weight ?? "",
    maker: item?.maker ?? "",
    catalog_number: item?.catalog_number ?? "",
    quality: item?.quality ?? "",
    authenticity: item?.authenticity ?? "",
    notes: item?.notes ?? "",
    is_active: item?.is_active ?? true,
    purchase_currency: item?.purchase_currency ?? "IRR",
    current_value: item?.current_value ?? "",
  };
}

function toRequest(v: FormValues): StampRequest {
  return {
    name: v.name.trim(),
    category_id: v.category_id ?? null,
    country: v.country || undefined,
    year: v.year ?? null,
    historical_period: v.historical_period || undefined,
    material: v.material || undefined,
    denomination: v.denomination || null,
    series: v.series || undefined,
    dimensions: v.dimensions || undefined,
    weight: v.weight || null,
    maker: v.maker || undefined,
    catalog_number: v.catalog_number || undefined,
    quality: (v.quality || undefined) as StampRequest["quality"],
    authenticity: (v.authenticity || undefined) as StampRequest["authenticity"],
    notes: v.notes || undefined,
    is_active: v.is_active ?? true,
    purchase_currency: (v.purchase_currency as StampRequest["purchase_currency"]) || undefined,
    current_value: v.current_value || null,
  };
}

interface Props {
  stamp?: Stamp | null;
  onSubmit: (data: StampRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  submitLabel?: string;
}

export function StampForm({ stamp, onSubmit, onCancel, loading, submitLabel = "ذخیره" }: Props) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toDefaults(stamp),
  });
  const { data: cats } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => getCategories({ pageSize: 200 }),
  });
  const catOpts = [
    { value: "", label: "انتخاب دسته‌بندی" },
    ...((cats?.results ?? []).map((c) => ({ value: String(c.id), label: c.name })) ?? []),
  ];

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(toRequest(values));
      })}
    >
      <Card>
        <CardHeader><CardTitle>اطلاعات پایه</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>نام *</Label>
            <Input className="mt-1.5" {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
          </div>
          <div>
            <Label>دسته‌بندی</Label>
            <Controller name="category_id" control={control} render={({ field }) => (
              <Select className="mt-1.5" value={field.value != null ? String(field.value) : ""} onChange={(e) => field.onChange(e.target.value || null)} options={catOpts} />
            )} />
          </div>
          <div>
            <Label>کشور</Label>
            <Controller name="country" control={control} render={({ field }) => (
              <Combobox className="mt-1.5" value={field.value ?? ""} onChange={field.onChange} options={countryOptions} placeholder="کشور" />
            )} />
          </div>
          <div>
            <Label>سال</Label>
            <Controller name="year" control={control} render={({ field }) => (
              <Select className="mt-1.5" value={field.value != null ? String(field.value) : ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} options={[{ value: "", label: "—" }, ...yearOptions]} />
            )} />
          </div>
          <div>
            <Label>دوره تاریخی</Label>
            <Controller name="historical_period" control={control} render={({ field }) => (
              <Select className="mt-1.5" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} options={[{ value: "", label: "—" }, ...historicalPeriodOptions]} />
            )} />
          </div>
          <div>
            <Label>جنس / ماده</Label>
            <Controller name="material" control={control} render={({ field }) => (
              <Combobox className="mt-1.5" value={field.value ?? ""} onChange={field.onChange} options={materialOptions} placeholder="جنس" />
            )} />
          </div>
          <div>
            <Label>ارزش اسمی</Label>
            <Input className="mt-1.5" {...register("denomination")} placeholder="مثلاً ۱۰ ریال" />
          </div>
          <div>
            <Label>سری / مجموعه</Label>
            <Input className="mt-1.5" {...register("series")} />
          </div>
          <div>
            <Label>ابعاد</Label>
            <Input className="mt-1.5" {...register("dimensions")} />
          </div>
          <div>
            <Label>وزن</Label>
            <Input className="mt-1.5" {...register("weight")} />
          </div>
          <div>
            <Label>سازنده</Label>
            <Input className="mt-1.5" {...register("maker")} />
          </div>
          <div>
            <Label>شماره کاتالوگ</Label>
            <Input className="mt-1.5" dir="ltr" {...register("catalog_number")} />
          </div>
          <div>
            <Label>اصالت</Label>
            <Controller name="authenticity" control={control} render={({ field }) => (
              <Select className="mt-1.5" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} options={[{ value: "", label: "—" }, ...authenticityOptions]} />
            )} />
          </div>
          <div>
            <Label>کیفیت</Label>
            <Controller name="quality" control={control} render={({ field }) => (
              <Select className="mt-1.5" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} options={[{ value: "", label: "—" }, ...qualityOptions]} />
            )} />
          </div>
          <div>
            <Label>ارزش فعلی</Label>
            <Input className="mt-1.5" dir="ltr" {...register("current_value")} />
          </div>
          <div>
            <Label>واحد پول</Label>
            <Controller name="purchase_currency" control={control} render={({ field }) => (
              <Select className="mt-1.5" value={field.value ?? "IRR"} onChange={(e) => field.onChange(e.target.value)} options={currencyOptions} />
            )} />
          </div>
          <div className="sm:col-span-2">
            <Label>یادداشت</Label>
            <Textarea className="mt-1.5" rows={3} {...register("notes")} />
          </div>
          <div className="flex items-center gap-2">
            <input id="is_active" type="checkbox" className="size-4" {...register("is_active")} />
            <Label htmlFor="is_active">فعال در آرشیو</Label>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>انصراف</Button>
        <Button type="submit" disabled={loading}>{loading ? "در حال ذخیره…" : submitLabel}</Button>
      </div>
    </form>
  );
}
