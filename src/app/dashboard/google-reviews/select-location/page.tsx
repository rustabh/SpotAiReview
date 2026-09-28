import { listPendingLocations } from "@/actions/google-reviews";
import { PageHeader } from "@/components/dashboard/page-header";
import { Alert } from "@/components/ui/alert";
import { LocationPicker } from "@/components/dashboard/google-location-picker";

export default async function SelectGoogleLocationPage({ searchParams }: { searchParams: Promise<{ businessId?: string }> }) {
  const { businessId } = await searchParams;
  if (!businessId) {
    return <Alert tone="error">Missing business.</Alert>;
  }

  const result = await listPendingLocations(businessId);

  return (
    <div>
      <PageHeader title="Choose your Google location" description="Your Google account manages more than one location — pick the one that matches this business." />
      {!result.ok ? (
        <Alert tone="error">{result.error}</Alert>
      ) : (
        <LocationPicker businessId={businessId} locations={result.data} />
      )}
    </div>
  );
}
