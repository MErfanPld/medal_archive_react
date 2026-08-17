"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, ShoppingBag, TrendingUp, Loader2 } from "lucide-react";
import {
  getMedalPurchases,
  getMedalValuations,
  createMedalPurchase,
  deleteMedalPurchase,
  createMedalValuation,
  deleteMedalValuation,
} from "@/lib/data/medals";
import { formatNumber, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";

const CURRENCY_OPTIONS = [
  { value: "IRR", label: "ریال (IRR)" },
  { value: "USD", label: "دلار (USD)" },
  { value: "EUR", label: "یورو (EUR)" },
  { value: "GBP", label: "پوند (GBP)" },
  { value: "AED", label: "درهم (AED)" },
  { value: "TRY", label: "لیر (TRY)" },
];

interface MedalFinanceProps {
  medalId: number;
  canEdit?: boolean;
}

export function MedalFinance({ medalId, canEdit = false }: MedalFinanceProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [deletePurchaseId, setDeletePurchaseId] = useState<number | null>(null);
  const [deleteValuationId, setDeleteValuationId] = useState<number | null>(null);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showValuationForm, setShowValuationForm] = useState(false);
  const [pDate, setPDate] = useState("");
  const [pSeller, setPSeller] = useState("");
  const [pLocation, setPLocation] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pCurrency, setPCurrency] = useState("IRR");
  const [pNotes, setPNotes] = useState("");
  const [vDate, setVDate] = useState("");
  const [vValue, setVValue] = useState("");
  const [vCurrency, setVCurrency] = useState("IRR");
  const [vSource, setVSource] = useState("");
  const [vNotes, setVNotes] = useState("");

  const { data: purchases = [], isLoading: pLoading } = useQuery({
    queryKey: ["medal-purchases", medalId],
    queryFn: () => getMedalPurchases(medalId),
  });

  const { data: valuations = [], isLoading: vLoading } = useQuery({
    queryKey: ["medal-valuations", medalId],
    queryFn: () => getMedalValuations(medalId),
  });

  const createPurchaseMutation = useMutation({
    mutationFn: () =>
      createMedalPurchase(medalId, {
        purchase_date: pDate || null,
        seller: pSeller.trim() || undefined,
        location: pLocation.trim() || undefined,
        price: pPrice.trim() || null,
        currency: pCurrency as never,
        notes: pNotes.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medal-purchases", medalId] });
      toast.success("سابقه خرید ثبت شد");
      setShowPurchaseForm(false);
      setPDate(""); setPSeller(""); setPLocation(""); setPPrice(""); setPNotes("");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در ثبت سابقه خرید");
    },
  });

  const deletePurchaseMutation = useMutation({
    mutationFn: (id: number) => deleteMedalPurchase(medalId, id),
    onSuccess: (ok) => {
      if (ok) {
        queryClient.invalidateQueries({ queryKey: ["medal-purchases", medalId] });
        setDeletePurchaseId(null);
        toast.success("سابقه خرید حذف شد");
      } else toast.error("حذف ناموفق بود");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در حذف");
    },
  });

  const createValuationMutation = useMutation({
    mutationFn: () =>
      createMedalValuation(medalId, {
        valuation_date: vDate || new Date().toISOString().slice(0, 10),
        value: vValue.trim(),
        currency: vCurrency as never,
        source: vSource.trim() || undefined,
        notes: vNotes.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medal-valuations", medalId] });
      queryClient.invalidateQueries({ queryKey: ["medal", medalId] });
      toast.success("ارزش‌گذاری ثبت شد");
      setShowValuationForm(false);
      setVDate(""); setVValue(""); setVSource(""); setVNotes("");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در ثبت ارزش‌گذاری");
    },
  });

  const deleteValuationMutation = useMutation({
    mutationFn: (id: number) => deleteMedalValuation(medalId, id),
    onSuccess: (ok) => {
      if (ok) {
        queryClient.invalidateQueries({ queryKey: ["medal-valuations", medalId] });
        setDeleteValuationId(null);
        toast.success("سابقه ارزش‌گذاری حذف شد");
      } else toast.error("حذف ناموفق بود");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در حذف");
    },
  });

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="size-4 text-primary" />
            سوابق خرید
          </CardTitle>
          {canEdit && (
            <Button size="sm" variant="outline" onClick={() => setShowPurchaseForm((v) => !v)}>
              <Plus className="size-4" />
              ثبت خرید
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {showPurchaseForm && canEdit && (
            <form
              className="space-y-2 rounded-xl border border-border bg-surface-muted/40 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                createPurchaseMutation.mutate();
              }}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-text-muted">تاریخ خرید</label>
                  <Input type="date" value={pDate} onChange={(e) => setPDate(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">فروشنده</label>
                  <Input value={pSeller} onChange={(e) => setPSeller(e.target.value)} placeholder="نام فروشنده" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">محل خرید</label>
                  <Input value={pLocation} onChange={(e) => setPLocation(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">قیمت</label>
                  <Input value={pPrice} onChange={(e) => setPPrice(e.target.value)} inputMode="decimal" placeholder="0" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">واحد پول</label>
                  <select className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm" value={pCurrency} onChange={(e) => setPCurrency(e.target.value)}>
                    {CURRENCY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">یادداشت</label>
                  <Input value={pNotes} onChange={(e) => setPNotes(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowPurchaseForm(false)}>انصراف</Button>
                <Button type="submit" size="sm" disabled={createPurchaseMutation.isPending}>
                  {createPurchaseMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                  ذخیره
                </Button>
              </div>
            </form>
          )}
          {pLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : purchases.length === 0 ? (
            <p className="text-sm text-text-muted">سابقه‌ای ثبت نشده است.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {purchases.map((p) => (
                <li key={p.id} className="flex items-start justify-between gap-2 py-2.5">
                  <div className="min-w-0">
                    <p className="font-medium text-text">{p.seller || "خرید"}{p.location ? ` · ${p.location}` : ""}</p>
                    <p className="text-xs text-text-muted">{p.purchase_date ? formatDate(p.purchase_date) : "—"}{p.notes ? ` · ${p.notes}` : ""}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="tabular-nums text-text">{p.price != null && p.price !== "" ? formatNumber(p.price) : "—"} {p.currency || ""}</span>
                    {canEdit && (
                      <button type="button" className="rounded-md p-1.5 text-text-muted hover:bg-danger-bg hover:text-danger" onClick={() => setDeletePurchaseId(p.id)} aria-label="حذف">
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-4 text-primary" />
            سوابق ارزش‌گذاری
          </CardTitle>
          {canEdit && (
            <Button size="sm" variant="outline" onClick={() => setShowValuationForm((v) => !v)}>
              <Plus className="size-4" />
              ثبت ارزش
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {showValuationForm && canEdit && (
            <form
              className="space-y-2 rounded-xl border border-border bg-surface-muted/40 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!vValue.trim()) { toast.error("مقدار ارزش الزامی است"); return; }
                createValuationMutation.mutate();
              }}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-text-muted">تاریخ ارزش‌گذاری</label>
                  <Input type="date" value={vDate} onChange={(e) => setVDate(e.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">ارزش *</label>
                  <Input value={vValue} onChange={(e) => setVValue(e.target.value)} inputMode="decimal" required placeholder="0" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">واحد پول</label>
                  <select className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm" value={vCurrency} onChange={(e) => setVCurrency(e.target.value)}>
                    {CURRENCY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">منبع</label>
                  <Input value={vSource} onChange={(e) => setVSource(e.target.value)} placeholder="کارشناس / کاتالوگ" />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs text-text-muted">یادداشت</label>
                  <Input value={vNotes} onChange={(e) => setVNotes(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowValuationForm(false)}>انصراف</Button>
                <Button type="submit" size="sm" disabled={createValuationMutation.isPending}>
                  {createValuationMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                  ذخیره
                </Button>
              </div>
            </form>
          )}
          {vLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : valuations.length === 0 ? (
            <p className="text-sm text-text-muted">سابقه‌ای ثبت نشده است.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {valuations.map((v) => (
                <li key={v.id} className="flex items-start justify-between gap-2 py-2.5">
                  <div className="min-w-0">
                    <p className="font-medium text-text">{v.source || "ارزش‌گذاری"}</p>
                    <p className="text-xs text-text-muted">{formatDate(v.valuation_date)}{v.notes ? ` · ${v.notes}` : ""}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="tabular-nums font-medium text-text">{formatNumber(v.value)} {v.currency || ""}</span>
                    {canEdit && (
                      <button type="button" className="rounded-md p-1.5 text-text-muted hover:bg-danger-bg hover:text-danger" onClick={() => setDeleteValuationId(v.id)} aria-label="حذف">
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog open={deletePurchaseId != null} onClose={() => setDeletePurchaseId(null)} onConfirm={() => deletePurchaseId && deletePurchaseMutation.mutate(deletePurchaseId)} title="حذف سابقه خرید" description="آیا از حذف این سابقه خرید مطمئن هستید؟" confirmLabel="حذف" loading={deletePurchaseMutation.isPending} variant="danger" />
      <ConfirmDialog open={deleteValuationId != null} onClose={() => setDeleteValuationId(null)} onConfirm={() => deleteValuationId && deleteValuationMutation.mutate(deleteValuationId)} title="حذف ارزش‌گذاری" description="آیا از حذف این سابقه ارزش‌گذاری مطمئن هستید؟" confirmLabel="حذف" loading={deleteValuationMutation.isPending} variant="danger" />
    </div>
  );
}
