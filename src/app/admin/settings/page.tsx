import { getPlatformSettings } from "@/actions/platform";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { PlatformSettingsForm } from "@/components/admin/platform-settings-form";

export default async function AdminSettingsPage() {
  const settings = await getPlatformSettings();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Platform Settings" description="Global configuration for the Spot AI Review platform." />
      <Card>
        <CardContent className="p-6">
          <PlatformSettingsForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
