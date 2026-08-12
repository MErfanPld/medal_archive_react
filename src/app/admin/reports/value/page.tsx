"use client";

import Link from "next/link";
import { ArrowRight, Coins, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ValueReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/reports"><ArrowRight className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Coins className="h-6 w-6 text-amber-600" />
            ارزش مجموعه
          </h1>
          <p className="text-sm text-text-muted">تحلیل ارزش و روند رشد</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-5">
            <p className="text-sm text-amber-800">ارزش کل تخمینی</p>
            <p className="text-2xl font-bold text-amber-900 mt-1">۴٫۲ میلیارد ریال</p>
            <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +۸٫۱٪ نسبت به سال قبل
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-text-muted">میانگین ارزش مدال</p>
            <p className="text-2xl font-bold mt-1">۳٫۴ میلیون</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-text-muted">بالاترین ارزش</p>
            <p className="text-2xl font-bold mt-1">۸۵ میلیون</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>توزیع ارزش بر اساس دسته</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "سلطنتی", value: "۱٫۶ میلیارد", pct: 38 },
            { name: "نظامی", value: "۱٫۱ میلیارد", pct: 26 },
            { name: "یادبود", value: "۰٫۹ میلیارد", pct: 21 },
            { name: "ورزشی", value: "۰٫۴ میلیارد", pct: 10 },
            { name: "سایر", value: "۰٫۲ میلیارد", pct: 5 },
          ].map((r) => (
            <div key={r.name} className="flex items-center gap-3">
              <span className="w-20 text-sm">{r.name}</span>
              <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${r.pct}%` }} />
              </div>
              <span className="w-28 text-sm text-text-muted text-left">{r.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
