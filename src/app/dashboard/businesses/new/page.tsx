import { listAllCategories } from "@/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { BusinessForm } from "@/components/dashboard/business-form";

export default async function NewBusinessPage() {
  const categories = await listAllCategories();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Add Business" description="Set up a new business to start collecting feedback." />
      <BusinessForm categories={categories.filter((c) => c.isActive)} />
    </div>
  );
}
