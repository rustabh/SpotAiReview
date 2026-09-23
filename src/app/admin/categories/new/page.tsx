import { PageHeader } from "@/components/dashboard/page-header";
import { CategoryForm } from "@/components/admin/category-form";
import { Card, CardContent } from "@/components/ui/card";

export default function NewCategoryPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Add Business Category" description="Define the experience attributes and AI context for a new type of business." />
      <Card>
        <CardContent className="p-6">
          <CategoryForm />
        </CardContent>
      </Card>
    </div>
  );
}
