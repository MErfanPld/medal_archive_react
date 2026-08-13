"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/data/categories";
import type { Medal, MedalRequest } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { CalendarDateField } from "@/components/ui/calendar-date-field";
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
  shapeOptions,
  edgeOptions,
  colorOptions,
  historicalPeriodOptions,
  preservationOptions,
  yearOptions,
} from "@/components/admin/medal-form-options";

const medalSchema = z.object({
  name: z.string().min(2, "نام مدال الزامی است (حداقل ۲ کاراکتر)"),
  country: z.string().optional(),
  year: z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((v) => {
      if (v === "" || v === undefined || v === null) return null;
      const n = Number(v);
      return Number.isNaN(n) ? null : n;
    }),
  occasion: z.string().optional(),
  historical_period: z.string().optional(),
  maker: z.string().optional(),
  mint_or_manufacturer: z.string().optional(),
  category: z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((v) => {
      if (v === "" || v === undefined || v === null) return null;
      const n = Number(v);
      return Number.isNaN(n) ? null : n;
    }),
  material: z.string().optional(),
  weight: z.string().optional(),
  diameter: z.string().optional(),
  thickness: z.string().optional(),
  shape: z.string().optional(),
  color: z.string().optional(),
  edge: z.string().optional(),
  quality: z.string().optional(),
  preservation_condition: z.string().optional(),
  authenticity: z.string().optional(),
  catalog_number: z.string().optional(),
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
});

export type MedalFormValues = z.infer<typeof medalSchema>;

function toFormDefaults(medal?: Medal | null): MedalFormValues {
  if (!medal) {
    return {
      name: "",
      country: "",
      year: null,
      occasion: "",
      historical_period: "",
      maker: "",
      mint_or_manufacturer: "",
      category: null,
      material: "",
      weight: "",
      diameter: "",
      thickness: "",
      shape: "",
      color: "",
      edge: "",
      quality: "",
      preservation_condition: "",
      authenticity: "unverified",
      catalog_number: "",
      purchase_date: "",
      purchase_location: "",
      seller: "",
      purchase_price: "",
      purchase_currency: "IRR",
      current_value: "",
      last_valuation_date: "",
      cabinet_number: "",
      drawer_number: "",
      box_number: "",
      notes: "",
    };
  }
  return {
    name: medal.name ?? "",
    country: medal.country ?? "",
    year: medal.year ?? null,
    occasion: medal.occasion ?? "",
    historical_period: medal.historical_period ?? "",
    maker: medal.maker ?? "",
    mint_or_manufacturer: medal.mint_or_manufacturer ?? "",
    category: medal.category ?? null,
    material: medal.material ?? "",
    weight: medal.weight ?? "",
    diameter: medal.diameter ?? "",
    thickness: medal.thickness ?? "",
    shape: medal.shape ?? "",
    color: medal.color ?? "",
    edge: medal.edge ?? "",
    quality: medal.quality ?? "",
    preservation_condition: medal.preservation_condition ?? "",
    authenticity: medal.authenticity ?? "unverified",
    catalog_number: medal.catalog_number ?? "",
    purchase_date: medal.purchase_date ?? "",
    purchase_location: medal.purchase_location ?? "",
    seller: medal.seller ?? "",
    purchase_price: medal.purchase_price ?? "",
    purchase_currency: medal.purchase_currency ?? "IRR",
    current_value: medal.current_value ?? "",
    last_valuation_date: medal.last_valuation_date ?? "",
    cabinet_number: medal.cabinet_number ?? "",
    drawer_number: medal.drawer_number ?? "",
    box_number: medal.box_number ?? "",
    notes: medal.notes ?? "",
  };
}

interface MedalFormProps {
  medal?: Medal | null;
  onSubmit: (data: MedalRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  submitLabel?: string;
}

export function MedalForm({
  medal,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = "ذخیره",
}: MedalFormProps) {
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => getCategories({ pageSize: 100 }),
  });

  const categoryOptions = (categoriesData?.results ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<MedalFormValues>({
    resolver: zodResolver(medalSchema),
    defaultValues: toFormDefaults(medal),
  });

  const submit = handleSubmit(async (values) => {
    const payload: MedalRequest = {
      name: values.name,
      country: values.country || undefined,
      year: values.year ?? null,
      occasion: values.occasion || undefined,
      historical_period: values.historical_period || undefined,
      maker: values.maker || undefined,
      mint_or_manufacturer: values.mint_or_manufacturer || undefined,
      category: values.category ?? null,
      material: values.material || undefined,
      weight: values.weight || undefined,
      diameter: values.diameter || undefined,
      thickness: values.thickness || undefined,
      shape: values.shape || undefined,
      color: values.color || undefined,
      edge: values.edge || undefined,
      quality: (values.quality as MedalRequest["quality"]) || undefined,
      preservation_condition: values.preservation_condition || undefined,
      authenticity:
        (values.authenticity as MedalRequest["authenticity"]) || undefined,
      catalog_number: values.catalog_number || undefined,
      purchase_date: values.purchase_date || null,
      purchase_location: values.purchase_location || undefined,
      seller: values.seller || undefined,
      purchase_price: values.purchase_price || null,
      purchase_currency:
        (values.purchase_currency as MedalRequest["purchase_currency"]) ||
        undefined,
      current_value: values.current_value || null,
      last_valuation_date: values.last_valuation_date || null,
      cabinet_number: values.cabinet_number || undefined,
      drawer_number: values.drawer_number || undefined,
      box_number: values.box_number || undefined,
      notes: values.notes || undefined,
    };
    await onSubmit(payload);
  });

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>اطلاعات پایه</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name" required>
              نام مدال
            </Label>
            <Input
              id="name"
              error={errors.name?.message}
              {...register("name")}
              placeholder="مثال: مدال تاج‌گذاری محمدرضا شاه"
            />
          </div>

          <div>
            <Label htmlFor="category">دسته‌بندی</Label>
            {categoriesLoading ? (
              <Skeleton className="h-10 w-full rounded-lg" />
            ) : categoriesError ? (
              <Alert variant="danger" className="text-xs">
                خطا در دریافت دسته‌بندی‌ها{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => refetchCategories()}
                >
                  تلاش مجدد
                </button>
              </Alert>
            ) : categoryOptions.length === 0 ? (
              <p className="text-xs text-text-muted">
                هیچ دسته‌بندی‌ای وجود ندارد. ابتدا یک دسته بسازید.
              </p>
            ) : (
              <Select
                id="category"
                options={categoryOptions}
                placeholder="انتخاب دسته‌بندی"
                {...register("category")}
              />
            )}
          </div>

          <div>
            <Label htmlFor="country">کشور</Label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Combobox
                  id="country"
                  options={countryOptions}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="جستجو و انتخاب کشور…"
                  searchPlaceholder="جستجوی کشور…"
                  allowCustom
                />
              )}
            />
          </div>

          <div>
            <Label htmlFor="year">سال</Label>
            <Controller
              name="year"
              control={control}
              render={({ field }) => (
                <Select
                  id="year"
                  options={yearOptions}
                  placeholder="انتخاب سال"
                  value={
                    field.value === null || field.value === undefined
                      ? ""
                      : String(field.value)
                  }
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>

          <div>
            <Label htmlFor="catalog_number">شماره کاتالوگ</Label>
            <Input
              id="catalog_number"
              {...register("catalog_number")}
              placeholder="IR-PHL-1967-001"
            />
          </div>

          <div>
            <Label htmlFor="occasion">مناسبت</Label>
            <Input
              id="occasion"
              {...register("occasion")}
              placeholder="تاج‌گذاری"
            />
          </div>

          <div>
            <Label htmlFor="historical_period">دوره تاریخی</Label>
            <Controller
              name="historical_period"
              control={control}
              render={({ field }) => (
                <Combobox
                  id="historical_period"
                  options={historicalPeriodOptions}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="انتخاب دوره…"
                  allowCustom
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>جزئیات فیزیکی</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label htmlFor="material">جنس / ماده</Label>
            <Controller
              name="material"
              control={control}
              render={({ field }) => (
                <Combobox
                  id="material"
                  options={materialOptions}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="انتخاب جنس…"
                  allowCustom
                />
              )}
            />
          </div>
          <div>
            <Label htmlFor="weight">وزن (گرم)</Label>
            <Input id="weight" {...register("weight")} placeholder="42.50" />
          </div>
          <div>
            <Label htmlFor="diameter">قطر (میلی‌متر)</Label>
            <Input id="diameter" {...register("diameter")} placeholder="50.00" />
          </div>
          <div>
            <Label htmlFor="thickness">ضخامت (میلی‌متر)</Label>
            <Input id="thickness" {...register("thickness")} placeholder="3.20" />
          </div>
          <div>
            <Label htmlFor="shape">شکل</Label>
            <Controller
              name="shape"
              control={control}
              render={({ field }) => (
                <Select
                  id="shape"
                  options={shapeOptions}
                  placeholder="انتخاب شکل"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <div>
            <Label htmlFor="color">رنگ</Label>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <Select
                  id="color"
                  options={colorOptions}
                  placeholder="انتخاب رنگ"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <div>
            <Label htmlFor="edge">لبه</Label>
            <Controller
              name="edge"
              control={control}
              render={({ field }) => (
                <Select
                  id="edge"
                  options={edgeOptions}
                  placeholder="انتخاب لبه"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <div>
            <Label htmlFor="quality">کیفیت (درجه)</Label>
            <Controller
              name="quality"
              control={control}
              render={({ field }) => (
                <Select
                  id="quality"
                  options={qualityOptions}
                  placeholder="انتخاب کیفیت"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <div>
            <Label htmlFor="preservation_condition">وضعیت نگهداری</Label>
            <Controller
              name="preservation_condition"
              control={control}
              render={({ field }) => (
                <Select
                  id="preservation_condition"
                  options={preservationOptions}
                  placeholder="انتخاب وضعیت"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>اطلاعات تاریخی و ساخت</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="maker">سازنده</Label>
            <Input id="maker" {...register("maker")} placeholder="ضرابخانه تهران" />
          </div>
          <div>
            <Label htmlFor="mint_or_manufacturer">ضرابخانه / کارخانه</Label>
            <Input
              id="mint_or_manufacturer"
              {...register("mint_or_manufacturer")}
              placeholder="ضرابخانه سلطنتی"
            />
          </div>
          <div>
            <Label htmlFor="authenticity">اصالت</Label>
            <Controller
              name="authenticity"
              control={control}
              render={({ field }) => (
                <Select
                  id="authenticity"
                  options={authenticityOptions}
                  value={field.value ?? "unverified"}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>خرید و ارزش‌گذاری</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>تاریخ خرید</Label>
            <Controller
              name="purchase_date"
              control={control}
              render={({ field }) => (
                <CalendarDateField
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  defaultCalendar="jalali"
                />
              )}
            />
          </div>
          <div>
            <Label htmlFor="purchase_location">محل خرید</Label>
            <Input
              id="purchase_location"
              {...register("purchase_location")}
              placeholder="حراج تهران"
            />
          </div>
          <div>
            <Label htmlFor="seller">فروشنده</Label>
            <Input id="seller" {...register("seller")} placeholder="گالری هنر پارس" />
          </div>
          <div>
            <Label htmlFor="purchase_price">قیمت خرید</Label>
            <Input id="purchase_price" {...register("purchase_price")} placeholder="18500000" />
          </div>
          <div>
            <Label htmlFor="purchase_currency">واحد پول خرید</Label>
            <Controller
              name="purchase_currency"
              control={control}
              render={({ field }) => (
                <Select
                  id="purchase_currency"
                  options={currencyOptions}
                  value={field.value ?? "IRR"}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <div>
            <Label htmlFor="current_value">ارزش فعلی</Label>
            <Input id="current_value" {...register("current_value")} placeholder="42000000" />
          </div>
          <div className="sm:col-span-2">
            <Label>تاریخ آخرین ارزیابی</Label>
            <Controller
              name="last_valuation_date"
              control={control}
              render={({ field }) => (
                <CalendarDateField
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  defaultCalendar="jalali"
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>محل نگهداری در مجموعه</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="cabinet_number">کابینت</Label>
            <Input id="cabinet_number" {...register("cabinet_number")} placeholder="A-12" />
          </div>
          <div>
            <Label htmlFor="drawer_number">کشو</Label>
            <Input id="drawer_number" {...register("drawer_number")} placeholder="3" />
          </div>
          <div>
            <Label htmlFor="box_number">جعبه</Label>
            <Input id="box_number" {...register("box_number")} placeholder="B-07" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>یادداشت‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="notes"
            {...register("notes")}
            placeholder="توضیحات تکمیلی، تاریخچه مالکیت و ..."
            rows={4}
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          انصراف
        </Button>
        <Button type="submit" loading={loading} disabled={loading}>
          {submitLabel}
        </Button>
        {isDirty && (
          <span className="text-xs text-text-muted">تغییرات ذخیره نشده</span>
        )}
      </div>
    </form>
  );
}
