"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/data/categories";
import type { Coin, CoinRequest, CoinItemType } from "@/types/api";
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
import { coinItemTypeOptions } from "@/lib/coin-labels";

const coinSchema = z.object({
  name: z.string().min(2, "نام الزامی است (حداقل ۲ کاراکتر)"),
  item_type: z.enum(["coin", "banknote", "token", "bullion", "other"]),
  category_id: z.union([z.string(), z.number(), z.null()]).optional().transform((v) => {
    if (v === "" || v === undefined || v === null) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }),
  country: z.string().optional(),
  year: z.union([z.string(), z.number(), z.null()]).optional().transform((v) => {
    if (v === "" || v === undefined || v === null) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }),
  year_hijri: z.union([z.string(), z.number(), z.null()]).optional().transform((v) => {
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
  purity: z.string().optional().nullable(),
  weight: z.string().optional().nullable(),
  diameter: z.string().optional().nullable(),
  thickness: z.string().optional().nullable(),
  shape: z.string().optional(),
  edge: z.string().optional(),
  color: z.string().optional(),
  serial_number: z.string().optional(),
  series: z.string().optional(),
  signature: z.string().optional(),
  printer: z.string().optional(),
  mint: z.string().optional(),
  maker: z.string().optional(),
  mintage: z.union([z.string(), z.number(), z.null()]).optional().transform((v) => {
    if (v === "" || v === undefined || v === null) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }),
  catalog_number: z.string().optional(),
  quality: z.string().optional(),
  preservation_condition: z.string().optional(),
  authenticity: z.string().optional(),
  is_proof: z.boolean().optional(),
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

export type CoinFormValues = z.infer<typeof coinSchema>;

function toFormDefaults(coin?: Coin | null): CoinFormValues {
  if (!coin) {
    return {
      name: "",
      item_type: "coin",
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
      purity: "",
      weight: "",
      diameter: "",
      thickness: "",
      shape: "",
      edge: "",
      color: "",
      serial_number: "",
      series: "",
      signature: "",
      printer: "",
      mint: "",
      maker: "",
      mintage: null,
      catalog_number: "",
      quality: "",
      preservation_condition: "",
      authenticity: "",
      is_proof: false,
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
    name: coin.name ?? "",
    item_type: (coin.item_type as CoinItemType) || "coin",
    category_id: coin.category_id ?? coin.category_detail?.id ?? null,
    country: coin.country ?? "",
    year: coin.year ?? null,
    year_hijri: coin.year_hijri ?? null,
    historical_period: coin.historical_period ?? "",
    reign_or_ruler: coin.reign_or_ruler ?? "",
    face_value: coin.face_value ?? "",
    denomination: coin.denomination ?? "",
    currency_name: coin.currency_name ?? "",
    material: coin.material ?? "",
    purity: coin.purity ?? "",
    weight: coin.weight ?? "",
    diameter: coin.diameter ?? "",
    thickness: coin.thickness ?? "",
    shape: coin.shape ?? "",
    edge: coin.edge ?? "",
    color: coin.color ?? "",
    serial_number: coin.serial_number ?? "",
    series: coin.series ?? "",
    signature: coin.signature ?? "",
    printer: coin.printer ?? "",
    mint: coin.mint ?? "",
    maker: coin.maker ?? "",
    mintage: coin.mintage ?? null,
    catalog_number: coin.catalog_number ?? "",
    quality: coin.quality ?? "",
    preservation_condition: coin.preservation_condition ?? "",
    authenticity: coin.authenticity ?? "",
    is_proof: !!coin.is_proof,
    is_commemorative: !!coin.is_commemorative,
    purchase_date: coin.purchase_date ?? null,
    purchase_location: coin.purchase_location ?? "",
    seller: coin.seller ?? "",
    purchase_price: coin.purchase_price ?? "",
    purchase_currency: coin.purchase_currency ?? "IRR",
    current_value: coin.current_value ?? "",
    last_valuation_date: coin.last_valuation_date ?? null,
    cabinet_number: coin.cabinet_number ?? "",
    drawer_number: coin.drawer_number ?? "",
    box_number: coin.box_number ?? "",
    notes: coin.notes ?? "",
    is_active: coin.is_active !== false,
  };
}

function toRequest(values: CoinFormValues): CoinRequest {
  return {
    name: values.name,
    item_type: values.item_type,
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
    purity: values.purity || null,
    weight: values.weight || null,
    diameter: values.diameter || null,
    thickness: values.thickness || null,
    shape: values.shape || undefined,
    edge: values.edge || undefined,
    color: values.color || undefined,
    serial_number: values.serial_number || undefined,
    series: values.series || undefined,
    signature: values.signature || undefined,
    printer: values.printer || undefined,
    mint: values.mint || undefined,
    maker: values.maker || undefined,
    mintage: values.mintage ?? null,
    catalog_number: values.catalog_number || undefined,
    quality: (values.quality as CoinRequest["quality"]) || undefined,
    preservation_condition: values.preservation_condition || undefined,
    authenticity: (values.authenticity as CoinRequest["authenticity"]) || undefined,
    is_proof: !!values.is_proof,
    is_commemorative: !!values.is_commemorative,
    purchase_date: values.purchase_date || null,
    purchase_location: values.purchase_location || undefined,
    seller: values.seller || undefined,
    purchase_price: values.purchase_price || null,
    purchase_currency: (values.purchase_currency as CoinRequest["purchase_currency"]) || undefined,
    current_value: values.current_value || null,
    last_valuation_date: values.last_valuation_date || null,
    cabinet_number: values.cabinet_number || undefined,
    drawer_number: values.drawer_number || undefined,
    box_number: values.box_number || undefined,
    notes: values.notes || undefined,
    is_active: values.is_active !== false,
  };
}

interface CoinFormProps {
  coin?: Coin | null;
  onSubmit: (data: CoinRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  submitLabel?: string;
}

export function CoinForm({ coin, onSubmit, onCancel, loading, submitLabel = "ذخیره" }: CoinFormProps) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<CoinFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(coinSchema) as any,
    defaultValues: toFormDefaults(coin),
  });

  const categoriesQ = useQuery({
    queryKey: ["categories", "form"],
    queryFn: () => getCategories({ pageSize: 200 }),
  });

  const categoryOptions =
    categoriesQ.data?.results?.map((c) => ({ value: String(c.id), label: c.name })) ?? [];

  return (
    <form onSubmit={handleSubmit(async (values) => { await onSubmit(toRequest(values)); })} className="space-y-6">
      {categoriesQ.isError && (
        <Alert variant="warning">خطا در دریافت دسته‌بندی‌ها — می‌توانید بدون دسته ادامه دهید.</Alert>
      )}

      <Card>
        <CardHeader><CardTitle>اطلاعات اصلی</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="name">نام *</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>نوع قلم *</Label>
            <Controller name="item_type" control={control} render={({ field }) => (
              <Select value={field.value} onChange={(e) => field.onChange(e.target.value)} options={[...coinItemTypeOptions]} />
            )} />
          </div>
          <div className="space-y-1.5">
            <Label>دسته‌بندی</Label>
            {categoriesQ.isLoading ? <Skeleton className="h-10 w-full" /> : (
              <Controller name="category_id" control={control} render={({ field }) => (
                <Select
                  value={field.value != null ? String(field.value) : ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                  options={[{ value: "", label: "بدون دسته" }, ...categoryOptions]}
                />
              )} />
            )}
          </div>
          <div className="space-y-1.5">
            <Label>کشور</Label>
            <Controller name="country" control={control} render={({ field }) => (
              <Combobox value={field.value ?? ""} onChange={field.onChange} options={countryOptions} placeholder="جستجو و انتخاب کشور" />
            )} />
          </div>
          <div className="space-y-1.5">
            <Label>سال (میلادی)</Label>
            <Controller name="year" control={control} render={({ field }) => (
              <Select value={field.value != null ? String(field.value) : ""} onChange={(e) => field.onChange(e.target.value || null)} options={[{ value: "", label: "—" }, ...yearOptions]} />
            )} />
          </div>
          <div className="space-y-1.5">
            <Label>سال هجری</Label>
            <Input type="number" {...register("year_hijri")} />
          </div>
          <div className="space-y-1.5">
            <Label>دوره تاریخی</Label>
            <Controller name="historical_period" control={control} render={({ field }) => (
              <Select value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} options={[{ value: "", label: "—" }, ...historicalPeriodOptions]} />
            )} />
          </div>
          <div className="space-y-1.5">
            <Label>حاکم / سلطنت</Label>
            <Input {...register("reign_or_ruler")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>ارزش اسمی و مشخصات پولی</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>ارزش اسمی</Label><Input {...register("face_value")} /></div>
          <div className="space-y-1.5"><Label>واحد / فرقه</Label><Input {...register("denomination")} placeholder="مثلاً ریال" /></div>
          <div className="space-y-1.5"><Label>نام ارز</Label><Input {...register("currency_name")} /></div>
          <div className="space-y-1.5"><Label>شماره سریال</Label><Input {...register("serial_number")} /></div>
          <div className="space-y-1.5"><Label>سری</Label><Input {...register("series")} /></div>
          <div className="space-y-1.5"><Label>امضا</Label><Input {...register("signature")} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>مشخصات فیزیکی و ساخت</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>جنس</Label><Controller name="material" control={control} render={({ field }) => (<Select value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} options={[{ value: "", label: "—" }, ...materialOptions]} />)} /></div>
          <div className="space-y-1.5"><Label>عیار / خلوص</Label><Input {...register("purity")} /></div>
          <div className="space-y-1.5"><Label>وزن</Label><Input {...register("weight")} /></div>
          <div className="space-y-1.5"><Label>قطر</Label><Input {...register("diameter")} /></div>
          <div className="space-y-1.5"><Label>ضخامت</Label><Input {...register("thickness")} /></div>
          <div className="space-y-1.5"><Label>شکل</Label><Controller name="shape" control={control} render={({ field }) => (<Select value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} options={[{ value: "", label: "—" }, ...shapeOptions]} />)} /></div>
          <div className="space-y-1.5"><Label>لبه</Label><Controller name="edge" control={control} render={({ field }) => (<Select value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} options={[{ value: "", label: "—" }, ...edgeOptions]} />)} /></div>
          <div className="space-y-1.5"><Label>رنگ</Label><Controller name="color" control={control} render={({ field }) => (<Select value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} options={[{ value: "", label: "—" }, ...colorOptions]} />)} /></div>
          <div className="space-y-1.5"><Label>ضرابخانه / Mint</Label><Input {...register("mint")} /></div>
          <div className="space-y-1.5"><Label>سازنده</Label><Input {...register("maker")} /></div>
          <div className="space-y-1.5"><Label>چاپخانه</Label><Input {...register("printer")} /></div>
          <div className="space-y-1.5"><Label>تیراژ</Label><Input type="number" {...register("mintage")} /></div>
          <div className="space-y-1.5"><Label>شماره کاتالوگ</Label><Input {...register("catalog_number")} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>وضعیت و اصالت</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>کیفیت</Label><Controller name="quality" control={control} render={({ field }) => (<Select value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} options={[{ value: "", label: "—" }, ...qualityOptions]} />)} /></div>
          <div className="space-y-1.5"><Label>اصالت</Label><Controller name="authenticity" control={control} render={({ field }) => (<Select value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} options={[{ value: "", label: "—" }, ...authenticityOptions]} />)} /></div>
          <div className="space-y-1.5"><Label>شرایط نگهداری</Label><Controller name="preservation_condition" control={control} render={({ field }) => (<Select value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} options={[{ value: "", label: "—" }, ...preservationOptions]} />)} /></div>
          <div className="flex flex-col gap-3 pt-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("is_proof")} className="size-4" />Proof</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("is_commemorative")} className="size-4" />یادبود / Commemorative</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("is_active")} className="size-4" />فعال در آرشیو</label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>خرید و ارزش‌گذاری</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>تاریخ خرید</Label><Controller name="purchase_date" control={control} render={({ field }) => (<CalendarDateField value={field.value ?? ""} onChange={field.onChange} />)} /></div>
          <div className="space-y-1.5"><Label>محل خرید</Label><Input {...register("purchase_location")} /></div>
          <div className="space-y-1.5"><Label>فروشنده</Label><Input {...register("seller")} /></div>
          <div className="space-y-1.5"><Label>قیمت خرید</Label><Input {...register("purchase_price")} /></div>
          <div className="space-y-1.5"><Label>ارز خرید</Label><Controller name="purchase_currency" control={control} render={({ field }) => (<Select value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} options={currencyOptions} />)} /></div>
          <div className="space-y-1.5"><Label>ارزش فعلی</Label><Input {...register("current_value")} /></div>
          <div className="space-y-1.5"><Label>تاریخ آخرین ارزش‌گذاری</Label><Controller name="last_valuation_date" control={control} render={({ field }) => (<CalendarDateField value={field.value ?? ""} onChange={field.onChange} />)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>محل نگهداری و یادداشت</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5"><Label>کابینت</Label><Input {...register("cabinet_number")} /></div>
          <div className="space-y-1.5"><Label>کشو</Label><Input {...register("drawer_number")} /></div>
          <div className="space-y-1.5"><Label>جعبه</Label><Input {...register("box_number")} /></div>
          <div className="sm:col-span-3 space-y-1.5"><Label>یادداشت</Label><Textarea rows={3} {...register("notes")} /></div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>انصراف</Button>
        <Button type="submit" loading={loading}>{submitLabel}</Button>
      </div>
    </form>
  );
}
