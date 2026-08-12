"use client";

import Link from "next/link";
import { BarChart3, Globe2, Coins, ShoppingBag, TrendingUp, ArrowUpLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const kpis = [
  { label: "کل مدال‌ها", value: "1,248", change: "+12.4%", icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
  { label: "ارزش مجموعه", value: "۴٫۲ میلیارد", change: "+8.1%", icon: Coins, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "کشورها", value: "47", change: "+3", icon: Globe2, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "خریدهای اخیر", value: "86", change: "+15%", icon: ShoppingBag, color: "text-orange-600", bg: "bg-orange-50" },
];

const links = [
  { href: "/admin/reports/countries", title: "تحلیل کشورها", desc: "توزیع جغرافیایی مجموعه", icon: Globe2 },
  { href: "/admin/reports/value", title: "ارزش مجموعه", desc: "روند ارزش و ارز", icon: Coins },
  { href: "/admin/reports/purchases", title: "تاریخچه خرید", desc: "خریدها و فروشندگان", icon: ShoppingBag },
];

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-primary" />
          گزارش‌ها و تحلیل‌ها
        </h1>
        <p className="text-sm text-text-muted mt-1">نمای کلی آمار و بینش‌های مجموعه</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl ${k.bg}`}>
                    <Icon className={`h-5 w-5 ${k.color}`} />
                  </div>
                  <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
                    <TrendingUp className="h-3 w-3" />
                    {k.change}
                  </span>
                </div>
                <p className="text-2xl font-bold mt-3">{k.value}</p>
                <p className="text-sm text-text-muted">{k.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <Link key={l.href} href={l.href}>
              <Card className="h-full hover:border-primary/40 hover:shadow-md transition-all group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                      <Icon className="h-5 w-5 text-text-muted group-hover:text-primary" />
                    </div>
                    <ArrowUpLeft className="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <CardTitle className="text-base mt-2">{l.title}</CardTitle>
                  <p className="text-sm text-text-muted">{l.desc}</p>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">توزیع دسته‌بندی (نمایشی)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "نظامی", pct: 34, color: "bg-primary" },
              { name: "یادبود", pct: 28, color: "bg-blue-500" },
              { name: "سلطنتی", pct: 18, color: "bg-amber-500" },
              { name: "ورزشی", pct: 12, color: "bg-emerald-500" },
              { name: "سایر", pct: 8, color: "bg-slate-400" },
            ].map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="w-20 text-sm">{c.name}</span>
                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} />
                </div>
                <span className="w-10 text-sm text-text-muted text-left">{c.pct}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
