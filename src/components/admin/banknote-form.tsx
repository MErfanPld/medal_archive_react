"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/data/categories";
import type { Banknote, BanknoteRequest } from "@/types/api";
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
import { Alert } from "@/components/ui/alert";
import {
  qualityOptions,
  authenticityOptions,
  currencyOptions,
  countryOptions,
  materialOptions,
  colorOptions,
  historicalPeriodOptions,
  preservationOptions,
  yearOptions,
} from "@/components/admin/medal-form-options";

const banknoteSchema = z.object({
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
  year_hijri: z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((v) => {
      if (v === "" || v === undefined || v === null) return null;
      const n = Number(v);
      return Number.isNaN(n) ? null : n;
    }),
  historical_period: z.string().optional(),
  reign_or_ruler: z.string().optional(),
  face_value: z.string().optional().nullable(),
  denomination: z.string().optional(),
  currency_name: z.string().optional(),
  material: z.string().optional(),
  length: z.string().optional().nullable(),
  width: z.string().optional().nullable(),
  thickness: z.string().optional().nullable(),
  color: z.string().optional(),
  serial_number: z.string().optional(),
  series: z.string().optional(),
  signature: z.string().optional(),
  printer: z.string().optional(),
  catalog_number: z.string().optional(),
  quality: z.string().optional(),
  preservation_condition: z.string().optional(),
  authenticity: z.string().optional(),
  is_commemorative: z.boolean().optional(),
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

export type BanknoteFormValues = z.infer<typeof banknoteSchema>;

function toFormDefaults(banknote?: Banknote | null): BanknoteFormValues {
  if (!banknote) {
    return {
      name: "",
      category_id: null,
      country: "",
      year: null,
      year_hijri: null,
      historical_period: "",
      reign_or_ruler: "",
      face_value: "",
      denomination: "",
      currency_name: "",
      material: "",
      length: "",
      width: "",
      thickness: "",
      color: "",
      serial_number: "",
      series: "",
      signature: "",
      printer: "",
      catalog_number: "",
      quality: "",
      preservation_condition: "",
      authenticity: "",
      is_commemorative: false,
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
    name: banknote.name ?? "",
    category_id: banknote.category_id ?? banknote.category_detail?.id ?? null,
    country: banknote.country ?? "",
    year: banknote.year ?? null,
    year_hijri: banknote.year_hijri ?? null,
    historical_period: banknote.historical_period ?? "",
    reign_or_ruler: banknote.reign_or_ruler ?? "",
    face_value: banknote.face_value ?? "",
    denomination: banknote.denomination ?? "",
    currency_name: banknote.currency_name ?? "",
    material: banknote.material ?? "",
    length: banknote.length ?? "",
    width: banknote.width ?? "",
    thickness: banknote.thickness ?? "",
    color: banknote.color ?? "",
    serial_number: banknote.serial_number ?? "",
    series: banknote.series ?? "",
    signature: banknote.signature ?? "",
    printer: banknote.printer ?? "",
    catalog_number: banknote.catalog_number ?? "",
    quality: banknote.quality ?? "",
    preservation_condition: banknote.preservation_condition ?? "",
    authenticity: banknote.authenticity ?? "",
    is_commemorative: !!banknote.is_commemorative,
    purchase_date: banknote.purchase_date ?? null,
    purchase_location: banknote.purchase_location ?? "",
    seller: banknote.seller ?? "",
    purchase_price: banknote.purchase_price ?? "",
    purchase_currency: banknote.purchase_currency ?? "IRR",
    current_value: banknote.current_value ?? "",
    last_valuation_date: banknote.last_valuation_date ?? null,
    cabinet_number: banknote.cabinet_number ?? "",
    drawer_number: banknote.drawer_number ?? "",
    box_number: banknote.box_number ?? "",
    notes: banknote.notes ?? "",
    is_active: banknote.is_active !== false,
  };
}

function toRequest(values: BanknoteFormValues): BanknoteRequest {
  return {
    name: values.name,
    category_id: values.category_id ?? null,
    country: values.country || undefined,
    year: values.year ?? null,
    year_hijri: values.year_hijri ?? null,
    historical_period: values.historical_period || undefined,
    reign_or_ruler: values.reign_or_ruler || undefined,
    face_value: values.face_value || null,
    denomination: values.denomination || undefined,
    currency_name: values.currency_name || undefined,
    material: values.material || undefined,
    length: values.length || null,
    width: values.width || null,
    thickness: values.thickness || null,
    color: values.color || undefined,
    serial_number: values.serial_number || undefined,
    series: values.series || undefined,
    signature: values.signature || undefined,
    printer: values.printer || undefined,
    catalog_number: values.catalog_number || undefined,
    quality: (values.quality as BanknoteRequest["quality"]) || undefined,
    preservation_condition: values.preservation_condition || undefined,
    authenticity:
      (values.authenticity as BanknoteRequest["authenticity"]) || undefined,
    is_commemorative: !!values.is_commemorative,
    purchase_date: clampToTodayOrPast(values.purchase_date || null),
    purchase_location: values.purchase_location || undefined,
    seller: values.seller || undefined,
    purchase_price: values.purchase_price || null,
    purchase_currency:
      (values.purchase_currency as BanknoteRequest["purchase_currency"]) ||
      undefined,
    current_value: values.current_value || null,
    last_valuation_date: clampToTodayOrPast(
      values.last_valuation_date || null
    ),
    cabinet_number: values.cabinet_number || undefined,
    drawer_number: values.drawer_number || undefined,
    box_number: values.box_number || undefined,
    notes: values.notes || undefined,
    is_active: values.is_active !== false,
  };
}

interface BanknoteFormProps {
  banknote?: Banknote | null;
  onSubmit: (data: BanknoteRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  submitLabel?: string;
}

export function BanknoteForm({
  banknote,
  onSubmit,
  onCancel,
  loading,
  submitLabel = "ذخیره",
}: BanknoteFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BanknoteFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(banknoteSchema) as any,
    defaultValues: toFormDefaults(banknote),
  });

  const categoriesQ = useQuery({
    queryKey: ["categories", "form"],
    queryFn: () => getCategories({ pageSize: 200 }),
  });

  const categoryOptions =
    categoriesQ.data?.results?.map((c) => ({
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
      {categoriesQ.isError && (
        <Alert variant="warning">
          خطا در دریافت دسته‌بندی‌ها — می‌توانید بدون دسته ادامه دهید.
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>اطلاعات اصلی</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="name">نام *</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-danger">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>دسته‌بندی</Label>
            {categoriesQ.isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value != null ? String(field.value) : ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                    options={[
                      { value: "", label: "بدون دسته" },
                      ...categoryOptions,
                    ]}
                  />
                )}
              />
            )}
          </div>

          <div className="space-y-1.5">
            <Label>کشور</Label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Combobox
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  options={countryOptions}
                  placeholder="جستجو و انتخاب کشور"
                />
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>سال (میلادی)</Label>
            <Controller
              name="year"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value != null ? String(field.value) : ""}
                  onChange={(e) =>
                    field.onChange(e.target.value ? Number(e.target.value) : null)
                  }
                  options={[{ value: "", label: "—" }, ...yearOptions]}
                />
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>سال (هجری)</Label>
            <Input type="number" {...register("year_hijri")} />
          </div>

          <div className="space-y-1.5">
            <Label>دوره تاریخی</Label>
            <Controller
              name="historical_period"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  options={[
                    { value: "", label: "—" },
                    ...historicalPeriodOptions,
                  ]}
                />
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>حاکم / پادشاه</Label>
            <Input {...register("reign_or_ruler")} />
          </div>

          <div className="space-y-1.5">
            <Label>ارزش اسمی</Label>
            <Input {...register("face_value")} />
          </div>

          <div className="space-y-1.5">
            <Label>واحد</Label>
            <Input {...register("denomination")} />
          </div>

          <div className="space-y-1.5">
            <Label>نام ارز</Label>
            <Input {...register("currency_name")} />
          </div>

          <div className="space-y-1.5">
            <Label>شماره سریال</Label>
            <Input {...register("serial_number")} />
          </div>

          <div className="space-y-1.5">
            <Label>سری</Label>
            <Input {...register("series")} />
          </div>

          <div className="space-y-1.5">
            <Label>امضا</Label>
            <Input {...register("signature")} />
          </div>

          <div className="space-y-1.5">
            <Label>چاپخانه</Label>
            <Input {...register("printer")} />
          </div>

          <div className="space-y-1.5">
            <Label>شماره کاتالوگ</Label>
            <Input {...register("catalog_number")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>مشخصات و وضعیت</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>جنس</Label>
            <Controller
              name="material"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  options={[{ value: "", label: "—" }, ...materialOptions]}
                />
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>رنگ</Label>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  options={[{ value: "", label: "—" }, ...colorOptions]}
                />
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>طول</Label>
            <Input {...register("length")} />
          </div>
          <div className="space-y-1.5">
            <Label>عرض</Label>
            <Input {...register("width")} />
          </div>
          <div className="space-y-1.5">
            <Label>ضخامت</Label>
            <Input {...register("thickness")} />
          </div>
          <div className="space-y-1.5">
            <Label>کیفیت</Label>
            <Controller
              name="quality"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  options={[{ value: "", label: "—" }, ...qualityOptions]}
                />
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>شرایط نگهداری</Label>
            <Controller
              name="preservation_condition"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  options={[{ value: "", label: "—" }, ...preservationOptions]}
                />
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>اصالت</Label>
            <Controller
              name="authenticity"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  options={[{ value: "", label: "—" }, ...authenticityOptions]}
                />
              )}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-text">
            <input type="checkbox" {...register("is_commemorative")} className="size-4" />
            یادبود
          </label>
          <label className="flex items-center gap-2 text-sm text-text">
            <input type="checkbox" {...register("is_active")} className="size-4" />
            فعال
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>خرید و ارزش</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>تاریخ خرید</Label>
            <Controller
              name="purchase_date"
              control={control}
              render={({ field }) => (
                <CalendarDateField value={field.value} onChange={field.onChange} />
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>محل خرید</Label>
            <Input {...register("purchase_location")} />
          </div>
          <div className="space-y-1.5">
            <Label>فروشنده</Label>
            <Input {...register("seller")} />
          </div>
          <div className="space-y-1.5">
            <Label>قیمت خرید</Label>
            <Input {...register("purchase_price")} />
          </div>
          <div className="space-y-1.5">
            <Label>واحد پول خرید</Label>
            <Controller
              name="purchase_currency"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? "IRR"}
                  onChange={(e) => field.onChange(e.target.value)}
                  options={[...currencyOptions]}
                />
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>ارزش فعلی</Label>
            <Input {...register("current_value")} />
          </div>
          <div className="space-y-1.5">
            <Label>تاریخ آخرین ارزش‌گذاری</Label>
            <Controller
              name="last_valuation_date"
              control={control}
              render={({ field }) => (
                <CalendarDateField value={field.value} onChange={field.onChange} />
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>محل نگهداری و یادداشت</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>کابینت</Label>
            <Input {...register("cabinet_number")} />
          </div>
          <div className="space-y-1.5">
            <Label>کشوی</Label>
            <Input {...register("drawer_number")} />
          </div>
          <div className="space-y-1.5">
            <Label>جعبه</Label>
            <Input {...register("box_number")} />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label>یادداشت</Label>
            <Textarea rows={3} {...register("notes")} />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          انصراف
        </Button>
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
