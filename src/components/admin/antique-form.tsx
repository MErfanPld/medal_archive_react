"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/data/categories";
import type { Antique, AntiqueRequest } from "@/types/antiques";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { CalendarDateField } from "@/components/ui/calendar-date-field";
import { clampToTodayOrPast } from "@/lib/calendar";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  qualityOptions,
  authenticityOptions,
  currencyOptions,
  countryOptions,
  materialOptions,
  historicalPeriodOptions,
  preservationOptions,
  yearOptions,
} from "@/components/admin/medal-form-options";

const antiqueSchema = z.object({
  name: z.string().min(2, "نام الزامی است (حداقل ۲ کاراکتر)"),
  category_id: z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((v) => {
      if (v === "" || v === undefined || v === null) return null;
      const n = Number(v);
      return Number.isNaN(n) ? null : n;
    }),
  country: z.string().optional(),
  year: z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((v) => {
      if (v === "" || v === undefined || v === null) return null;
      const n = Number(v);
      return Number.isNaN(n) ? null : n;
    }),
  historical_period: z.string().optional(),
  origin: z.string().optional(),
  style: z.string().optional(),
  material: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.string().optional().nullable(),
  maker: z.string().optional(),
  catalog_number: z.string().optional(),
  quality: z.string().optional(),
  preservation_condition: z.string().optional(),
  authenticity: z.string().optional(),
  purchase_date: z.string().optional().nullable(),
  purchase_location: z.string().optional(),
  seller: z.string().optional(),
  purchase_price: z.string().optional().nullable(),
  purchase_currency: z.string().optional(),
  current_value: z.string().optional().nullable(),
  last_valuation_date: z.string().optional().nullable(),
  cabinet_number: z.string().optional(),
  drawer_number: z.string().optional(),
  box_number: z.string().optional(),
  notes: z.string().optional(),
  is_active: z.boolean().optional(),
});

export type AntiqueFormValues = z.infer<typeof antiqueSchema>;

function toFormDefaults(item?: Antique | null): AntiqueFormValues {
  if (!item) {
    return {
      name: "",
      category_id: null,
      country: "",
      year: null,
      historical_period: "",
      origin: "",
      style: "",
      material: "",
      dimensions: "",
      weight: "",
      maker: "",
      catalog_number: "",
      quality: "",
      preservation_condition: "",
      authenticity: "",
      purchase_date: null,
      purchase_location: "",
      seller: "",
      purchase_price: "",
      purchase_currency: "IRR",
      current_value: "",
      last_valuation_date: null,
      cabinet_number: "",
      drawer_number: "",
      box_number: "",
      notes: "",
      is_active: true,
    };
  }
  return {
    name: item.name ?? "",
    category_id: item.category_id ?? null,
    country: item.country ?? "",
    year: item.year ?? null,
    historical_period: item.historical_period ?? "",
    origin: item.origin ?? "",
    style: item.style ?? "",
    material: item.material ?? "",
    dimensions: item.dimensions ?? "",
    weight: item.weight ?? "",
    maker: item.maker ?? "",
    catalog_number: item.catalog_number ?? "",
    quality: item.quality ?? "",
    preservation_condition: item.preservation_condition ?? "",
    authenticity: item.authenticity ?? "",
    purchase_date: item.purchase_date ?? null,
    purchase_location: item.purchase_location ?? "",
    seller: item.seller ?? "",
    purchase_price: item.purchase_price ?? "",
    purchase_currency: item.purchase_currency ?? "IRR",
    current_value: item.current_value ?? "",
    last_valuation_date: item.last_valuation_date ?? null,
    cabinet_number: item.cabinet_number ?? "",
    drawer_number: item.drawer_number ?? "",
    box_number: item.box_number ?? "",
    notes: item.notes ?? "",
    is_active: item.is_active ?? true,
  };
}

function toRequest(values: AntiqueFormValues): AntiqueRequest {
  return {
    name: values.name.trim(),
    category_id: values.category_id ?? null,
    country: values.country || undefined,
    year: values.year ?? null,
    historical_period: values.historical_period || undefined,
    origin: values.origin || undefined,
    style: values.style || undefined,
    material: values.material || undefined,
    dimensions: values.dimensions || undefined,
    weight: values.weight || null,
    maker: values.maker || undefined,
    catalog_number: values.catalog_number || undefined,
    quality: (values.quality || undefined) as AntiqueRequest["quality"],
    preservation_condition: values.preservation_condition || undefined,
    authenticity: (values.authenticity || undefined) as AntiqueRequest["authenticity"],
    purchase_date: clampToTodayOrPast(values.purchase_date || null),
    purchase_location: values.purchase_location || undefined,
    seller: values.seller || undefined,
    purchase_price: values.purchase_price || null,
    purchase_currency:
      (values.purchase_currency as AntiqueRequest["purchase_currency"]) || undefined,
    current_value: values.current_value || null,
    last_valuation_date: clampToTodayOrPast(values.last_valuation_date || null),
    cabinet_number: values.cabinet_number || undefined,
    drawer_number: values.drawer_number || undefined,
    box_number: values.box_number || undefined,
    notes: values.notes || undefined,
    is_active: values.is_active ?? true,
  };
}

interface AntiqueFormProps {
  antique?: Antique | null;
  onSubmit: (data: AntiqueRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  submitLabel?: string;
}

export function AntiqueForm({
  antique,
  onSubmit,
  onCancel,
  loading,
  submitLabel = "ذخیره",
}: AntiqueFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AntiqueFormValues>({
    resolver: zodResolver(antiqueSchema),
    defaultValues: toFormDefaults(antique),
  });

  const { data: categoriesData, isLoading: catsLoading } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => getCategories({ pageSize: 100 }),
  });

  const categoryOptions =
    categoriesData?.results?.map((c) => ({
      value: String(c.id),
      label: c.name,
    })) ?? [];

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(toRequest(values));
      })}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>اطلاعات اصلی</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">نام *</Label>
            <Input id="name" className="mt-1.5" {...register("name")} />
            {errors.name && (
              <p className="mt-1 text-xs text-danger">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label>دسته‌بندی</Label>
            {catsLoading ? (
              <Skeleton className="mt-1.5 h-10 w-full" />
            ) : (
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <Select
                    className="mt-1.5"
                    value={field.value != null ? String(field.value) : ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? Number(e.target.value) : null)
                    }
                    options={[
                      { value: "", label: "انتخاب دسته‌بندی" },
                      ...categoryOptions,
                    ]}
                  />
                )}
              />
            )}
          </div>
          <div>
            <Label>کشور</Label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Combobox
                  className="mt-1.5"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  options={countryOptions}
                  placeholder="جستجو و انتخاب کشور"
                />
              )}
            />
          </div>
          <div>
            <Label>سال</Label>
            <Controller
              name="year"
              control={control}
              render={({ field }) => (
                <Select
                  className="mt-1.5"
                  value={field.value != null ? String(field.value) : ""}
                  onChange={(e) =>
                    field.onChange(e.target.value ? Number(e.target.value) : null)
                  }
                  options={[{ value: "", label: "—" }, ...yearOptions]}
                />
              )}
            />
          </div>
          <div>
            <Label>دوره تاریخی</Label>
            <Controller
              name="historical_period"
              control={control}
              render={({ field }) => (
                <Select
                  className="mt-1.5"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  options={[{ value: "", label: "—" }, ...historicalPeriodOptions]}
                />
              )}
            />
          </div>
          <div>
            <Label>منشأ / خاستگاه</Label>
            <Input className="mt-1.5" {...register("origin")} />
          </div>
          <div>
            <Label>سبک</Label>
            <Input className="mt-1.5" {...register("style")} />
          </div>
          <div>
            <Label>جنس / ماده</Label>
            <Controller
              name="material"
              control={control}
              render={({ field }) => (
                <Select
                  className="mt-1.5"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  options={[{ value: "", label: "—" }, ...materialOptions]}
                />
              )}
            />
          </div>
          <div>
            <Label>ابعاد</Label>
            <Input className="mt-1.5" placeholder="مثلاً ۱۰×۲۰×۵ سانتی‌متر" {...register("dimensions")} />
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>وضعیت و اصالت</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>اصالت</Label>
            <Controller
              name="authenticity"
              control={control}
              render={({ field }) => (
                <Select
                  className="mt-1.5"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  options={[{ value: "", label: "—" }, ...authenticityOptions]}
                />
              )}
            />
          </div>
          <div>
            <Label>کیفیت</Label>
            <Controller
              name="quality"
              control={control}
              render={({ field }) => (
                <Select
                  className="mt-1.5"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  options={[{ value: "", label: "—" }, ...qualityOptions]}
                />
              )}
            />
          </div>
          <div>
            <Label>شرایط نگهداری</Label>
            <Controller
              name="preservation_condition"
              control={control}
              render={({ field }) => (
                <Select
                  className="mt-1.5"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  options={[{ value: "", label: "—" }, ...preservationOptions]}
                />
              )}
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              id="is_active"
              type="checkbox"
              className="size-4 rounded border-border"
              {...register("is_active")}
            />
            <Label htmlFor="is_active">فعال در آرشیو</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>خرید و ارزش</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>تاریخ خرید</Label>
            <Controller
              name="purchase_date"
              control={control}
              render={({ field }) => (
                <CalendarDateField
                  className="mt-1.5"
                  value={field.value ?? ""}
                  onChange={(v) => field.onChange(v || null)}
                />
              )}
            />
          </div>
          <div>
            <Label>محل خرید</Label>
            <Input className="mt-1.5" {...register("purchase_location")} />
          </div>
          <div>
            <Label>فروشنده</Label>
            <Input className="mt-1.5" {...register("seller")} />
          </div>
          <div>
            <Label>قیمت خرید</Label>
            <Input className="mt-1.5" dir="ltr" {...register("purchase_price")} />
          </div>
          <div>
            <Label>واحد پول خرید</Label>
            <Controller
              name="purchase_currency"
              control={control}
              render={({ field }) => (
                <Select
                  className="mt-1.5"
                  value={field.value ?? "IRR"}
                  onChange={(e) => field.onChange(e.target.value)}
                  options={currencyOptions}
                />
              )}
            />
          </div>
          <div>
            <Label>ارزش فعلی</Label>
            <Input className="mt-1.5" dir="ltr" {...register("current_value")} />
          </div>
          <div>
            <Label>تاریخ آخرین ارزش‌گذاری</Label>
            <Controller
              name="last_valuation_date"
              control={control}
              render={({ field }) => (
                <CalendarDateField
                  className="mt-1.5"
                  value={field.value ?? ""}
                  onChange={(v) => field.onChange(v || null)}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>محل نگهداری و یادداشت</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>شماره کابینت</Label>
            <Input className="mt-1.5" {...register("cabinet_number")} />
          </div>
          <div>
            <Label>شماره کشو</Label>
            <Input className="mt-1.5" {...register("drawer_number")} />
          </div>
          <div>
            <Label>شماره جعبه</Label>
            <Input className="mt-1.5" {...register("box_number")} />
          </div>
          <div className="sm:col-span-3">
            <Label>یادداشت</Label>
            <Textarea className="mt-1.5" rows={3} {...register("notes")} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          انصراف
        </Button>
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
