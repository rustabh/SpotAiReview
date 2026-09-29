import { listPendingPages } from "@/actions/social";
import { PageHeader } from "@/components/dashboard/page-header";
import { Alert } from "@/components/ui/alert";
import { SocialPagePicker } from "@/components/dashboard/social-page-picker";

export default async function SelectSocialPagePage({ searchParams }: { searchParams: Promise<{ businessId?: string }> }) {
  const { businessId } = await searchParams;
  if (!businessId) {
    return <Alert tone="error">Missing business.</Alert>;
  }

  const result = await listPendingPages(businessId);

  return (
    <div>
      <PageHeader title="Choose your Facebook Page" description="Your Facebook account manages more than one Page — pick the one that matches this business." />
      {!result.ok ? (
        <Alert tone="error">{result.error}</Alert>
      ) : (
        <SocialPagePicker businessId={businessId} pages={result.data} />
      )}
    </div>
  );
}
