"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, ShoppingBag, TrendingUp } from "lucide-react";
import {
  getKnifePurchases,
  getKnifeValuations,
  createKnifePurchase,
  deleteKnifePurchase,
  createKnifeValuation,
  deleteKnifeValuation,
} from "@/lib/data/knives";
import { formatNumber, formatDate } from "@/lib/utils";
import { todayIsoDate, clampToTodayOrPast } from "@/lib/calendar";
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

interface KnifeFinanceProps {
  knifeId: number;
  canEdit?: boolean;
}

export function KnifeFinance({
  knifeId,
  canEdit = false,
}: KnifeFinanceProps) {
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

  const [vDate, setVDate] = useState(todayIsoDate());
  const [vValue, setVValue] = useState("");
  const [vCurrency, setVCurrency] = useState("IRR");
  const [vSource, setVSource] = useState("");
  const [vNotes, setVNotes] = useState("");

  const { data: purchases = [], isLoading: pLoading } = useQuery({
    queryKey: ["knife-purchases", knifeId],
    queryFn: () => getKnifePurchases(knifeId),
  });

  const { data: valuations = [], isLoading: vLoading } = useQuery({
    queryKey: ["knife-valuations", knifeId],
    queryFn: () => getKnifeValuations(knifeId),
  });

  const createPurchaseMutation = useMutation({
    mutationFn: () =>
      createKnifePurchase(knifeId, {
        purchase_date: clampToTodayOrPast(pDate || null),
        seller: pSeller.trim() || undefined,
        location: pLocation.trim() || undefined,
        price: pPrice.trim() || null,
        currency: pCurrency as never,
        notes: pNotes.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knife-purchases", knifeId] });
      toast.success("سابقه خرید ثبت شد");
      setShowPurchaseForm(false);
      setPDate("");
      setPSeller("");
      setPLocation("");
      setPPrice("");
      setPNotes("");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در ثبت سابقه خرید");
    },
  });

  const deletePurchaseMutation = useMutation({
    mutationFn: (id: number) => deleteKnifePurchase(knifeId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knife-purchases", knifeId] });
      setDeletePurchaseId(null);
      toast.success("سابقه خرید حذف شد");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در حذف");
    },
  });

  const createValuationMutation = useMutation({
    mutationFn: () =>
      createKnifeValuation(knifeId, {
        valuation_date: clampToTodayOrPast(vDate || todayIsoDate())!,
        value: vValue.trim(),
        currency: vCurrency as never,
        source: vSource.trim() || undefined,
        notes: vNotes.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knife-valuations", knifeId] });
      toast.success("ارزش‌گذاری ثبت شد");
      setShowValuationForm(false);
      setVValue("");
      setVSource("");
      setVNotes("");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در ثبت ارزش‌گذاری");
    },
  });

  const deleteValuationMutation = useMutation({
    mutationFn: (id: number) => deleteKnifeValuation(knifeId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knife-valuations", knifeId] });
      setDeleteValuationId(null);
      toast.success("ارزش‌گذاری حذف شد");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در حذف");
    },
  });

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="size-4" />
            سوابق خرید
          </CardTitle>
          {canEdit && (
            <Button size="sm" variant="outline" onClick={() => setShowPurchaseForm((v) => !v)}>
              <Plus className="size-4" />
              افزودن
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {showPurchaseForm && (
            <div className="space-y-2 rounded-lg border border-border bg-surface-muted/40 p-3">
              <Input type="date" value={pDate} onChange={(e) => setPDate(e.target.value)} placeholder="تاریخ" />
              <Input value={pSeller} onChange={(e) => setPSeller(e.target.value)} placeholder="فروشنده" />
              <Input value={pLocation} onChange={(e) => setPLocation(e.target.value)} placeholder="محل" />
              <div className="flex gap-2">
                <Input value={pPrice} onChange={(e) => setPPrice(e.target.value)} placeholder="قیمت" />
                <select className="h-10 rounded-lg border border-border bg-surface px-2 text-sm" value={pCurrency} onChange={(e) => setPCurrency(e.target.value)}>
                  {CURRENCY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <Input value={pNotes} onChange={(e) => setPNotes(e.target.value)} placeholder="یادداشت" />
              <Button size="sm" loading={createPurchaseMutation.isPending} onClick={() => createPurchaseMutation.mutate()}>
                ثبت
              </Button>
            </div>
          )}
          {pLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : purchases.length === 0 ? (
            <p className="text-sm text-text-muted">سابقه‌ای ثبت نشده است.</p>
          ) : (
            <ul className="space-y-2">
              {purchases.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{p.price ? formatNumber(p.price) : "—"} {p.currency}</p>
                    <p className="text-xs text-text-muted">{[formatDate(p.purchase_date), p.seller, p.location].filter(Boolean).join(" · ")}</p>
                  </div>
                  {canEdit && (
                    <Button size="sm" variant="ghost" onClick={() => setDeletePurchaseId(p.id)}>
                      <Trash2 className="size-4 text-danger" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-4" />
            سوابق ارزش‌گذاری
          </CardTitle>
          {canEdit && (
            <Button size="sm" variant="outline" onClick={() => setShowValuationForm((v) => !v)}>
              <Plus className="size-4" />
              افزودن
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {showValuationForm && (
            <div className="space-y-2 rounded-lg border border-border bg-surface-muted/40 p-3">
              <Input type="date" value={vDate} onChange={(e) => setVDate(e.target.value)} />
              <div className="flex gap-2">
                <Input value={vValue} onChange={(e) => setVValue(e.target.value)} placeholder="ارزش *" />
                <select className="h-10 rounded-lg border border-border bg-surface px-2 text-sm" value={vCurrency} onChange={(e) => setVCurrency(e.target.value)}>
                  {CURRENCY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <Input value={vSource} onChange={(e) => setVSource(e.target.value)} placeholder="منبع" />
              <Input value={vNotes} onChange={(e) => setVNotes(e.target.value)} placeholder="یادداشت" />
              <Button size="sm" loading={createValuationMutation.isPending} disabled={!vValue.trim()} onClick={() => createValuationMutation.mutate()}>
                ثبت
              </Button>
            </div>
          )}
          {vLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : valuations.length === 0 ? (
            <p className="text-sm text-text-muted">سابقه‌ای ثبت نشده است.</p>
          ) : (
            <ul className="space-y-2">
              {valuations.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{formatNumber(v.value)} {v.currency}</p>
                    <p className="text-xs text-text-muted">{[formatDate(v.valuation_date), v.source].filter(Boolean).join(" · ")}</p>
                  </div>
                  {canEdit && (
                    <Button size="sm" variant="ghost" onClick={() => setDeleteValuationId(v.id)}>
                      <Trash2 className="size-4 text-danger" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deletePurchaseId !== null}
        onClose={() => setDeletePurchaseId(null)}
        title="حذف سابقه خرید"
        description="آیا از حذف این سابقه مطمئن هستید؟"
        confirmLabel="حذف"
        onConfirm={async () => {
          if (deletePurchaseId == null) return;
          await deletePurchaseMutation.mutateAsync(deletePurchaseId);
        }}
        loading={deletePurchaseMutation.isPending}
        variant="danger"
      />
      <ConfirmDialog
        open={deleteValuationId !== null}
        onClose={() => setDeleteValuationId(null)}
        title="حذف ارزش‌گذاری"
        description="آیا از حذف این ارزش‌گذاری مطمئن هستید؟"
        confirmLabel="حذف"
        onConfirm={async () => {
          if (deleteValuationId == null) return;
          await deleteValuationMutation.mutateAsync(deleteValuationId);
        }}
        loading={deleteValuationMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
