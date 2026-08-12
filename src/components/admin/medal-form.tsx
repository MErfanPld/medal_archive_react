"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/data/categories";
import type { Medal, MedalRequest } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const qualityOptions = [
  { value: "UNC", label: "UNC — بدون گردش" },
  { value: "AU", label: "AU — تقریباً بدون گردش" },
  { value: "XF", label: "XF — بسیار عالی" },
  { value: "VF", label: "VF — خیلی خوب" },
  { value: "F", label: "F — خوب" },
  { value: "VG", label: "VG — نسبتاً خوب" },
  { value: "G", label: "G — متوسط" },
  { value: "AG", label: "AG — تقریباً متوسط" },
  { value: "FAIR", label: "FAIR" },
  { value: "POOR", label: "POOR" },
  { value: "OTHER", label: "سایر" },
];

const authenticityOptions = [
  { value: "authentic", label: "اصیل" },
  { value: "suspect", label: "مشکوک" },
  { value: "counterfeit", label: "جعلی" },
  { value: "unverified", label: "تأییدنشده" },
  { value: "unknown", label: "نامشخص" },
];

const currencyOptions = [
  { value: "IRR", label: "ریال (IRR)" },
  { value: "USD", label: "دلار (USD)" },
  { value: "EUR", label: "یورو (EUR)" },
  { value: "GBP", label: "پوند (GBP)" },
  { value: "TRY", label: "لیر (TRY)" },
  { value: "AED", label: "درهم (AED)" },
  { value: "OTHER", label: "سایر" },
];

const medalSchema = z.object({
  name: z.string().min(2, "نام مدال الزامی است (حداقل ۲ کاراکتر)"),
  country: z.string().optional(),
  year: z.union([z.string(), z.number()]).optional().transform((v) => {
    if (v === "" || v === undefined || v === null) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }),
  occasion: z.string().optional(),
  historical_period: z.string().optional(),
  maker: z.string().optional(),
  mint_or_manufacturer: z.string().optional(),
  category: z.union([z.string(), z.number()]).optional().transform((v) => {
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
  const { data: categoriesData } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => getCategories({ pageSize: 100 }),
  });

  const categoryOptions = (categoriesData?.results ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<MedalFormValues>({
    resolver: zodResolver(medalSchema),
    defaultValues: toFormDefaults(medal),
  });

  const submit = handleSubmit(async (values) => {
    const payload: MedalRequest = {
      name: values.name,
      country: values.country || "",
      year: values.year as number | null,
      occasion: values.occasion || "",
      historical_period: values.historical_period || "",
      maker: values.maker || "",
      mint_or_manufacturer: values.mint_or_manufacturer || "",
      category: values.category as number | null,
      material: values.material || "",
      weight: values.weight || null,
      diameter: values.diameter || null,
      thickness: values.thickness || null,
      shape: values.shape || "",
      color: values.color || "",
      edge: values.edge || "",
      quality: (values.quality as MedalRequest["quality"]) || "",
      preservation_condition: values.preservation_condition || "",
      authenticity: (values.authenticity as MedalRequest["authenticity"]) || "unverified",
      catalog_number: values.catalog_number || "",
      purchase_date: values.purchase_date || null,
      purchase_location: values.purchase_location || "",
      seller: values.seller || "",
      purchase_price: values.purchase_price || null,
      purchase_currency: (values.purchase_currency as MedalRequest["purchase_currency"]) || "IRR",
      current_value: values.current_value || null,
      last_valuation_date: values.last_valuation_date || null,
      cabinet_number: values.cabinet_number || "",
      drawer_number: values.drawer_number || "",
      box_number: values.box_number || "",
      notes: values.notes || "",
    };
    await onSubmit(payload);
  });

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">اطلاعات اصلی</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">نام مدال *</Label>
            <Input id="name" {...register("name")} className="mt-1.5" />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="country">کشور</Label>
            <Input id="country" {...register("country")} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="year">سال</Label>
            <Input id="year" type="number" {...register("year")} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="category">دسته‌بندی</Label>
            <Select id="category" {...register("category")} className="mt-1.5">
              <option value="">— انتخاب —</option>
              {categoryOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="catalog_number">شماره کاتالوگ</Label>
            <Input id="catalog_number" {...register("catalog_number")} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="occasion">مناسبت</Label>
            <Input id="occasion" {...register("occasion")} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="historical_period">دوره تاریخی</Label>
            <Input id="historical_period" {...register("historical_period")} className="mt-1.5" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">مشخصات فیزیکی</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="material">جنس</Label>
            <Input id="material" {...register("material")} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="quality">کیفیت</Label>
            <Select id="quality" {...register("quality")} className="mt-1.5">
              <option value="">—</option>
              {qualityOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="weight">وزن (گرم)</Label>
            <Input id="weight" {...register("weight")} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="diameter">قطر (میلی‌متر)</Label>
            <Input id="diameter" {...register("diameter")} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="thickness">ضخامت</Label>
            <Input id="thickness" {...register("thickness")} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="shape">شکل</Label>
            <Input id="shape" {...register("shape")} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="color">رنگ</Label>
            <Input id="color" {...register("color")} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="edge">لبه</Label>
            <Input id="edge" {...register("edge")} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="preservation_condition">وضعیت نگهداری</Label>
            <Input id="preservation_condition" {...register("preservation_condition")} className="mt-1.5" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">اصالت و سازنده</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="authenticity">اصالت</Label>
            <Select id="authenticity" {...register("authenticity")} className="mt-1.5">
              {authenticityOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="maker">سازنده</Label>
            <Input id="maker" {...register("maker")} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="mint_or_manufacturer">ضرابخانه / کارخانه</Label>
            <Input id="mint_or_manufacturer" {...register("mint_or_manufacturer")} className="mt-1.5" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">خرید و ارزش‌گذاری</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="purchase_date">تاریخ خرید</Label>
            <Input id="purchase_date" type="date" {...register("purchase_date")} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="purchase_price">قیمت خرید</Label>
            <Input id="purchase_price" {...register("purchase_price")} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="purchase_currency">واحد پول</Label>
            <Select id="purchase_currency" {...register("purchase_currency")} className="mt-1.5">
              {currencyOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="seller">فروشنده</Label>
            <Input id="seller" {...register("seller")} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="purchase_location">محل خرید</Label>
            <Input id="purchase_location" {...register("purchase_location")} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="current_value">ارزش فعلی</Label>
            <Input id="current_value" {...register("current_value")} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="last_valuation_date">تاریخ ارزش‌گذاری</Label>
            <Input id="last_valuation_date" type="date" {...register("last_valuation_date")} className="mt-1.5" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">محل نگهداری و یادداشت</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="cabinet_number">کمد</Label>
            <Input id="cabinet_number" {...register("cabinet_number")} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="drawer_number">کشو</Label>
            <Input id="drawer_number" {...register("drawer_number")} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="box_number">باکس</Label>
            <Input id="box_number" {...register("box_number")} className="mt-1.5" />
          </div>
          <div className="sm:col-span-3">
            <Label htmlFor="notes">یادداشت</Label>
            <Textarea id="notes" rows={3} {...register("notes")} className="mt-1.5" />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "در حال ذخیره..." : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          انصراف
        </Button>
        {isDirty && (
          <span className="text-xs text-text-muted">تغییرات ذخیره نشده</span>
        )}
      </div>
    </form>
  );
}
