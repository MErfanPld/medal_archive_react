"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Save, Shield } from "lucide-react";
import { getRoleById } from "@/lib/data/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PERMISSION_GROUPS = [
  { name: "مدال‌ها", perms: ["view_medals", "add_medals", "change_medals", "delete_medals"] },
  { name: "دسته‌بندی‌ها", perms: ["view_categories", "add_categories", "change_categories", "delete_categories"] },
  { name: "کاربران", perms: ["view_users", "add_users", "change_users", "delete_users"] },
  { name: "نقش‌ها", perms: ["view_roles", "add_roles", "change_roles", "delete_roles"] },
  { name: "گزارش‌ها", perms: ["view_reports"] },
  { name: "تنظیمات", perms: ["view_settings", "change_settings"] },
];

export default function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: role, isLoading } = useQuery({
    queryKey: ["role", id],
    queryFn: () => getRoleById(Number(id)),
  });
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (role) {
      setName(role.name);
      setSelected(new Set(role.permissions || []));
    }
  }, [role]);

  const toggle = (p: string) => {
    const next = new Set(selected);
    if (next.has(p)) next.delete(p);
    else next.add(p);
    setSelected(next);
  };

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/roles/${id}`}><ArrowRight className="h-5 w-5" /></Link>
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          ویرایش نقش
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">اطلاعات نقش</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="text-sm font-medium mb-1.5 block">نام نقش</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ماتریس دسترسی‌ها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {PERMISSION_GROUPS.map((g) => (
            <div key={g.name} className="border rounded-lg p-3">
              <span className="font-medium text-sm block mb-2">{g.name}</span>
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
        <Button onClick={() => router.push(`/admin/roles/${id}`)}>
          <Save className="h-4 w-4 ml-2" />
          ذخیره تغییرات
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/admin/roles/${id}`}>انصراف</Link>
        </Button>
      </div>
    </div>
  );
}
