import type { Metadata } from "next";
import { getCampaignBySlug } from "@/actions/public";
import { ReviewFlow } from "@/components/public/review-flow";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PublicReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);

  if (!campaign) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 px-6 text-center dark:bg-ink-900">
        <ShieldAlert className="mb-3 text-ink-400" size={32} />
        <h1 className="text-lg font-semibold text-foreground">This review link is no longer active</h1>
        <p className="mt-1 max-w-xs text-sm text-ink-500">Please check with the business for an updated link.</p>
      </div>
    );
  }

  const { business } = campaign;

  return (
    <ReviewFlow
      campaignSlug={slug}
      business={{
        name: business.name,
        logoUrl: business.logoUrl,
        coverImageUrl: business.coverImageUrl,
        description: business.description,
        primaryColor: business.primaryColor,
        buttonColor: business.buttonColor,
        defaultLanguage: business.defaultLanguage,
        allowedLanguages: (business.allowedLanguages as string[]) ?? ["en"],
      }}
      category={{
        name: business.category.name,
        attributes: business.category.attributes.map((a) => ({ id: a.id, label: a.label })),
      }}
      ctaText={campaign.ctaText}
      hasGoogleUrl={!!(campaign.googleReviewUrlOverride || business.googleReviewConfig?.googleReviewUrl)}
    />
  );
}
