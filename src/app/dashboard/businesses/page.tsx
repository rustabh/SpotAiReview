import Link from "next/link";
import { listMyBusinesses } from "@/actions/business";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Building2, Plus, MapPin } from "lucide-react";

export default async function BusinessesPage() {
  const businesses = await listMyBusinesses();

  return (
    <div>
      <PageHeader
        title="My Businesses"
        description="Manage every business you run under one account."
        action={
          <Link href="/dashboard/businesses/new">
            <Button><Plus size={15} /> Add Business</Button>
          </Link>
        }
      />

      {businesses.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No businesses yet"
          description="Create your first business to start collecting customer feedback."
          action={<Link href="/dashboard/businesses/new"><Button><Plus size={15} /> Add Business</Button></Link>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((b) => (
            <Link key={b.id} href={`/dashboard/businesses/${b.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 font-semibold dark:bg-brand-900/30">
                      {b.name.charAt(0).toUpperCase()}
                    </div>
                    <Badge tone={b.status === "ACTIVE" ? "success" : "danger"}>{b.status}</Badge>
                  </div>
                  <h3 className="mt-3 font-semibold text-foreground">{b.name}</h3>
                  <p className="text-sm text-ink-500">{b.category.name}</p>
                  {b.city && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-ink-400">
                      <MapPin size={12} /> {b.city}{b.state ? `, ${b.state}` : ""}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
