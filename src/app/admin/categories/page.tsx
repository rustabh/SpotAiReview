import Link from "next/link";
import { listAllCategories } from "@/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryToggle } from "@/components/admin/category-toggle";
import { Plus } from "lucide-react";

export default async function AdminCategoriesPage() {
  const categories = await listAllCategories();

  return (
    <div>
      <PageHeader
        title="Business Categories"
        description="Category-specific attributes and questions power the customer feedback flow for every business type."
        action={<Link href="/admin/categories/new"><Button><Plus size={15} /> Add Category</Button></Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{c.name}</h3>
                  <p className="text-xs text-ink-400">{c._count.businesses} business{c._count.businesses === 1 ? "" : "es"}</p>
                </div>
                <Badge tone={c.isActive ? "success" : "neutral"}>{c.isActive ? "Active" : "Inactive"}</Badge>
              </div>
              {c.description && <p className="mt-2 text-sm text-ink-500">{c.description}</p>}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.attributes.map((a) => <Badge key={a.id} tone="brand">{a.label}</Badge>)}
              </div>
              <div className="mt-4">
                <CategoryToggle categoryId={c.id} isActive={c.isActive} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
