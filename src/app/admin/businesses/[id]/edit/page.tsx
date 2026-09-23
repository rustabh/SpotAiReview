import { notFound } from "next/navigation";
import { getBusinessDetail } from "@/actions/business";
import { listAllCategories } from "@/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { BusinessForm } from "@/components/dashboard/business-form";

export default async function AdminEditBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [business, categories] = await Promise.all([getBusinessDetail(id), listAllCategories()]);
  if (!business) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={`Edit ${business.name}`} description="Editing as Super Admin." />
      <BusinessForm
        businessId={business.id}
        onSavedPath={() => "/admin/businesses"}
        categories={categories.filter((c) => c.isActive || c.id === business.categoryId)}
        defaultValues={{
          name: business.name,
          categoryId: business.categoryId,
          subcategory: business.subcategory ?? "",
          description: business.description ?? "",
          phone: business.phone ?? "",
          email: business.email ?? "",
          website: business.website ?? "",
          whatsapp: business.whatsapp ?? "",
          address: business.address ?? "",
          city: business.city ?? "",
          state: business.state ?? "",
          country: business.country ?? "",
          instagramUrl: business.instagramUrl ?? "",
          facebookUrl: business.facebookUrl ?? "",
          linkedinUrl: business.linkedinUrl ?? "",
          youtubeUrl: business.youtubeUrl ?? "",
          googleReviewUrl: business.googleReviewConfig?.googleReviewUrl ?? "",
          usp: business.usp ?? "",
          targetAudience: business.targetAudience ?? "",
          brandTone: business.brandTone ?? "",
          primaryColor: business.primaryColor,
          buttonColor: business.buttonColor,
        }}
      />
    </div>
  );
}
