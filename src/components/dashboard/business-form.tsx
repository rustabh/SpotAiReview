"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBusiness, updateBusiness } from "@/actions/business";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Category = { id: string; name: string };

export function BusinessForm({
  categories,
  businessId,
  defaultValues,
  onSavedPath,
}: {
  categories: Category[];
  businessId?: string;
  defaultValues?: Record<string, string>;
  /** Where to send the user after a successful save. Defaults to the new/updated business's dashboard detail page. */
  onSavedPath?: (businessId: string) => string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const v = defaultValues ?? {};

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const input = Object.fromEntries(fd.entries());

    let savedId = businessId;
    if (businessId) {
      const result = await updateBusiness(businessId, input);
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
    } else {
      const result = await createBusiness(input);
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      savedId = result.data.businessId;
    }
    router.push(onSavedPath ? onSavedPath(savedId!) : `/dashboard/businesses/${savedId}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}

      <Card>
        <CardHeader><CardTitle>Basic Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Business name *</Label>
            <Input id="name" name="name" required defaultValue={v.name} placeholder="e.g. The Garden Bistro" />
          </div>
          <div>
            <Label htmlFor="categoryId">Business category *</Label>
            <Select id="categoryId" name="categoryId" required defaultValue={v.categoryId}>
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="subcategory">Subcategory</Label>
            <Input id="subcategory" name="subcategory" defaultValue={v.subcategory} placeholder="Optional" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={v.description} placeholder="Tell customers a little about your business" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contact & Location</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" defaultValue={v.phone} /></div>
          <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" defaultValue={v.email} /></div>
          <div><Label htmlFor="website">Website</Label><Input id="website" name="website" placeholder="https://" defaultValue={v.website} /></div>
          <div><Label htmlFor="whatsapp">WhatsApp</Label><Input id="whatsapp" name="whatsapp" defaultValue={v.whatsapp} /></div>
          <div className="sm:col-span-2"><Label htmlFor="address">Address</Label><Input id="address" name="address" defaultValue={v.address} /></div>
          <div><Label htmlFor="city">City</Label><Input id="city" name="city" defaultValue={v.city} /></div>
          <div><Label htmlFor="state">State</Label><Input id="state" name="state" defaultValue={v.state} /></div>
          <div><Label htmlFor="country">Country</Label><Input id="country" name="country" defaultValue={v.country} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Google Review & Social Links</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="googleReviewUrl">Google review URL *</Label>
            <Input id="googleReviewUrl" name="googleReviewUrl" required placeholder="https://search.google.com/local/writereview?placeid=..." defaultValue={v.googleReviewUrl} />
          </div>
          <div><Label htmlFor="instagramUrl">Instagram</Label><Input id="instagramUrl" name="instagramUrl" defaultValue={v.instagramUrl} /></div>
          <div><Label htmlFor="facebookUrl">Facebook</Label><Input id="facebookUrl" name="facebookUrl" defaultValue={v.facebookUrl} /></div>
          <div><Label htmlFor="linkedinUrl">LinkedIn</Label><Input id="linkedinUrl" name="linkedinUrl" defaultValue={v.linkedinUrl} /></div>
          <div><Label htmlFor="youtubeUrl">YouTube</Label><Input id="youtubeUrl" name="youtubeUrl" defaultValue={v.youtubeUrl} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Brand & Positioning</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label htmlFor="usp">USP</Label><Input id="usp" name="usp" defaultValue={v.usp} placeholder="What makes you different?" /></div>
          <div><Label htmlFor="targetAudience">Target audience</Label><Input id="targetAudience" name="targetAudience" defaultValue={v.targetAudience} /></div>
          <div><Label htmlFor="brandTone">Brand tone</Label><Input id="brandTone" name="brandTone" placeholder="e.g. warm, professional" defaultValue={v.brandTone} /></div>
          <div><Label htmlFor="primaryColor">Primary color</Label><Input id="primaryColor" name="primaryColor" type="color" defaultValue={v.primaryColor || "#0F172A"} className="h-10 w-full" /></div>
          <div><Label htmlFor="buttonColor">Button color</Label><Input id="buttonColor" name="buttonColor" type="color" defaultValue={v.buttonColor || "#2563EB"} className="h-10 w-full" /></div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" loading={loading}>{businessId ? "Save Changes" : "Create Business"}</Button>
      </div>
    </form>
  );
}
