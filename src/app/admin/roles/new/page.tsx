"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Save, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PERMISSION_GROUPS = [
  { name: "مدال‌ها", perms: ["view_medals", "add_medals", "change_medals", "delete_medals"] },
  { name: "دسته‌بندی‌ها", perms: ["view_categories", "add_categories", "change_categories", "delete_categories"] },
  { name: "کاربران", perms: ["view_users", "add_users", "change_users", "delete_users"] },
  { name: "نقش‌ها", perms: ["view_roles", "add_roles", "change_roles", "delete_roles"] },
  { name: "گزارش‌ها", perms: ["view_reports"] },
  { name: "تنظیمات", perms: ["view_settings", "change_settings"] },
];

export default function NewRolePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (p: string) => {
    const next = new Set(selected);
    if (next.has(p)) next.delete(p);
    else next.add(p);
    setSelected(next);
  };

  const toggleGroup = (perms: string[]) => {
    const allSelected = perms.every((p) => selected.has(p));
    const next = new Set(selected);
    perms.forEach((p) => (allSelected ? next.delete(p) : next.add(p)));
    setSelected(next);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/roles"><ArrowRight className="h-5 w-5" /></Link>
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          نقش جدید
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">اطلاعات نقش</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="text-sm font-medium mb-1.5 block">نام نقش</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً: ویرایشگر" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ماتریس دسترسی‌ها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {PERMISSION_GROUPS.map((g) => (
            <div key={g.name} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{g.name}</span>
                <Button variant="ghost" size="sm" onClick={() => toggleGroup(g.perms)}>
                  {g.perms.every((p) => selected.has(p)) ? "لغو همه" : "انتخاب همه"}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {g.perms.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggle(p)}
                    className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
                      selected.has(p)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    {p.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => router.push("/admin/roles")} disabled={!name.trim()}>
          <Save className="h-4 w-4 ml-2" />
          ذخیره نقش
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/roles">انصراف</Link>
        </Button>
      </div>
    </div>
  );
}
