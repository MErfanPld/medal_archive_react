"use client";

import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const countries = [
  { name: "ایران", count: 412, pct: 33 },
  { name: "آلمان", count: 186, pct: 15 },
  { name: "انگلستان", count: 142, pct: 11 },
  { name: "فرانسه", count: 98, pct: 8 },
  { name: "روسیه", count: 87, pct: 7 },
  { name: "ایالات متحده", count: 76, pct: 6 },
  { name: "ایتالیا", count: 54, pct: 4 },
  { name: "سایر", count: 193, pct: 16 },
];

export default function CountriesReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/reports"><ArrowRight className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe2 className="h-6 w-6 text-blue-600" />
            تحلیل کشورها
          </h1>
          <p className="text-sm text-text-muted">توزیع جغرافیایی مجموعه مدال‌ها</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-3xl font-bold text-blue-600">47</p>
            <p className="text-sm text-text-muted">کشور</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-3xl font-bold">۱٬۲۴۸</p>
            <p className="text-sm text-text-muted">کل مدال</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-3xl font-bold text-primary">ایران</p>
            <p className="text-sm text-text-muted">بیشترین سهم</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-3xl font-bold">۳۳٪</p>
            <p className="text-sm text-text-muted">سهم ایران</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>رتبه‌بندی کشورها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {countries.map((c) => (
            <div key={c.name} className="flex items-center gap-3">
              <span className="w-28 text-sm font-medium">{c.name}</span>
              <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${c.pct}%` }} />
              </div>
              <span className="w-16 text-sm text-text-muted text-left">{c.count}</span>
              <span className="w-10 text-sm text-text-muted">{c.pct}%</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
