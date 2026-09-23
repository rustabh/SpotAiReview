import { z } from "zod";

export const businessSchema = z.object({
  name: z.string().min(2, "Business name is required").max(120),
  categoryId: z.string().uuid("Select a category"),
  subcategory: z.string().max(120).optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  whatsapp: z.string().max(30).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  city: z.string().max(120).optional().or(z.literal("")),
  state: z.string().max(120).optional().or(z.literal("")),
  country: z.string().max(120).optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  youtubeUrl: z.string().url().optional().or(z.literal("")),
  googleReviewUrl: z.string().url("Enter a valid Google review URL"),
  usp: z.string().max(500).optional().or(z.literal("")),
  targetAudience: z.string().max(300).optional().or(z.literal("")),
  brandTone: z.string().max(200).optional().or(z.literal("")),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  buttonColor: z.string().optional(),
});

export type BusinessInput = z.infer<typeof businessSchema>;

export const campaignSchema = z.object({
  businessId: z.string().uuid(),
  name: z.string().min(2, "Campaign name is required").max(120),
  placement: z.string().max(120).optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
  ctaText: z.string().max(120).optional().or(z.literal("")),
  googleReviewUrlOverride: z.string().url().optional().or(z.literal("")),
});

export type CampaignInput = z.infer<typeof campaignSchema>;
