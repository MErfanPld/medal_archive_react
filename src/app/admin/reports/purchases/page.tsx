"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const purchases = [
  { id: 1, medal: "مدال تاج‌گذاری", seller: "گالری هنر پارس", price: "۱۸٬۵۰۰٬۰۰۰", date: "۱۳۹۸/۱۲/۲۴", currency: "IRR" },
  { id: 2, medal: "نشان لیاقت نظامی", seller: "سجاد کریمی", price: "۸٬۵۰۰٬۰۰۰", date: "۱۳۹۹/۰۵/۰۱", currency: "IRR" },
  { id: 3, medal: "مدال المپیک مونیخ", seller: "حراج اشتوتگارت", price: "۱٬۲۰۰", date: "۱۴۰۰/۰۲/۱۵", currency: "EUR" },
  { id: 4, medal: "نشان افتخار", seller: "بازار تهران", price: "۴٬۲۰۰٬۰۰۰", date: "۱۴۰۱/۰۸/۱۰", currency: "IRR" },
  { id: 5, medal: "مدال صلح", seller: "گالری اروپا", price: "۸۵۰", date: "۱۴۰۲/۰۳/۲۲", currency: "EUR" },
];

export default function PurchasesReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/reports"><ArrowRight className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-orange-600" />
            تاریخچه خرید
          </h1>
          <p className="text-sm text-text-muted">خریدهای ثبت‌شده در مجموعه</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-3xl font-bold text-orange-600">۸۶</p>
            <p className="text-sm text-text-muted">خرید ثبت‌شده</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-3xl font-bold">۲۴</p>
            <p className="text-sm text-text-muted">فروشنده یکتا</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-3xl font-bold">۱۵٪+</p>
            <p className="text-sm text-text-muted">رشد سالانه</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>آخرین خریدها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-text-muted">
                  <th className="text-right p-2 font-medium">مدال</th>
                  <th className="text-right p-2 font-medium">فروشنده</th>
                  <th className="text-right p-2 font-medium">قیمت</th>
                  <th className="text-right p-2 font-medium">تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="p-2 font-medium">{p.medal}</td>
                    <td className="p-2">{p.seller}</td>
                    <td className="p-2">
                      {p.price} <Badge variant="outline" className="mr-1">{p.currency}</Badge>
                    </td>
                    <td className="p-2 text-text-muted">{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
