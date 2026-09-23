import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES: {
  name: string;
  description: string;
  attributes: string[];
  questions: string[];
  aiContext: string;
}[] = [
  {
    name: "Restaurant",
    description: "Restaurants, cafes and dining establishments",
    attributes: ["Food", "Taste", "Service", "Ambience", "Cleanliness", "Value"],
    questions: ["What did you order?", "How was the wait time?"],
    aiContext: "Focus on food quality, taste, service speed and ambience. Avoid inventing specific dish names not mentioned by the customer.",
  },
  {
    name: "Salon & Spa",
    description: "Hair salons, spas and beauty studios",
    attributes: ["Staff", "Service Quality", "Cleanliness", "Result", "Professionalism", "Experience"],
    questions: ["Which service did you get?", "How was the result?"],
    aiContext: "Focus on staff skill, service outcome and salon cleanliness. Never invent a specific stylist name.",
  },
  {
    name: "Clinic & Healthcare",
    description: "Clinics, hospitals, doctors and dentists",
    attributes: ["Doctor", "Staff", "Waiting Time", "Cleanliness", "Communication", "Overall Experience"],
    questions: ["What was your visit for?", "How was your interaction with the doctor?"],
    aiContext: "Focus on care quality, communication and cleanliness. Never invent a diagnosis, treatment or medical outcome.",
  },
  {
    name: "Hotel",
    description: "Hotels, resorts and stays",
    attributes: ["Room", "Cleanliness", "Staff", "Location", "Service", "Breakfast", "Value"],
    questions: ["How was your room?", "Would you recommend this stay?"],
    aiContext: "Focus on room quality, staff hospitality and location. Never invent room numbers or specific staff names.",
  },
  {
    name: "Retail Store",
    description: "Retail, clothing, electronics and jewellery stores",
    attributes: ["Product Quality", "Staff", "Price", "Variety", "Shopping Experience"],
    questions: ["What did you purchase?", "How was the staff assistance?"],
    aiContext: "Focus on product quality, pricing and shopping experience. Never invent specific product names not mentioned.",
  },
  {
    name: "Digital Marketing Agency",
    description: "Marketing, branding and creative agencies",
    attributes: ["Communication", "Creativity", "Delivery", "Support", "Results", "Professionalism"],
    questions: ["What service did the agency provide?", "How were the results?"],
    aiContext: "Focus on communication quality, creativity and delivery timelines. Never invent specific campaign metrics.",
  },
  {
    name: "Real Estate Agency",
    description: "Real estate agents, brokers and property consultants",
    attributes: ["Communication", "Property", "Documentation", "Support", "Professionalism"],
    questions: ["What kind of property were you looking for?", "How was the support during the process?"],
    aiContext: "Focus on communication, professionalism and support during the property process. Never invent property prices or addresses.",
  },
  {
    name: "Automobile Service Center",
    description: "Car and bike service centers and dealers",
    attributes: ["Service Quality", "Staff", "Turnaround Time", "Pricing", "Cleanliness"],
    questions: ["What service did your vehicle need?", "How long did it take?"],
    aiContext: "Focus on service quality, turnaround time and pricing transparency. Never invent specific vehicle issues not mentioned.",
  },
  {
    name: "Gym & Fitness Studio",
    description: "Gyms, fitness studios and personal training",
    attributes: ["Trainers", "Equipment", "Cleanliness", "Ambience", "Value", "Results"],
    questions: ["What programs did you use?", "How were the trainers?"],
    aiContext: "Focus on trainer quality, equipment and ambience. Never invent specific fitness results or numbers.",
  },
  {
    name: "Coaching Institute",
    description: "Coaching centers, training institutes and schools",
    attributes: ["Teaching Quality", "Staff", "Study Material", "Infrastructure", "Results", "Support"],
    questions: ["Which course did you take?", "How was the teaching quality?"],
    aiContext: "Focus on teaching quality, study material and support. Never invent exam scores or specific outcomes.",
  },
];

const LANGUAGES = [
  { code: "en", name: "English", isDefault: true },
  { code: "hi", name: "Hindi" },
  { code: "hi-en", name: "Hinglish" },
  { code: "mr", name: "Marathi" },
  { code: "gu", name: "Gujarati" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "bn", name: "Bengali" },
  { code: "pa", name: "Punjabi" },
];

const PLANS = [
  { name: "Free", slug: "free", monthlyPrice: 0, yearlyPrice: 0, businessLimit: 1, campaignLimit: 2, aiGenerationsPerMonth: 50, teamMemberLimit: 1, languageLimit: 2, advancedInsights: false },
  { name: "Starter", slug: "starter", monthlyPrice: 99900, yearlyPrice: 999000, businessLimit: 1, campaignLimit: 5, aiGenerationsPerMonth: 500, teamMemberLimit: 2, languageLimit: 4, advancedInsights: false },
  { name: "Pro", slug: "pro", monthlyPrice: 299900, yearlyPrice: 2999000, businessLimit: 3, campaignLimit: 20, aiGenerationsPerMonth: 3000, teamMemberLimit: 5, languageLimit: 8, advancedInsights: true },
  { name: "Business", slug: "business", monthlyPrice: 799900, yearlyPrice: 7999000, businessLimit: 10, campaignLimit: 100, aiGenerationsPerMonth: 15000, teamMemberLimit: 20, languageLimit: 11, advancedInsights: true },
];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}
function token(n = 7) {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: n }, () => A[Math.floor(Math.random() * A.length)]).join("");
}

async function main() {
  console.log("Seeding Spot AI Review demo data...");

  await prisma.platformSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      platformName: "Spot AI Review",
      aiProvider: (process.env.AI_PROVIDER?.toUpperCase() as "MOCK" | "OPENAI" | "ANTHROPIC") || "MOCK",
      aiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
    },
  });

  for (const lang of LANGUAGES) {
    await prisma.language.upsert({ where: { code: lang.code }, update: {}, create: lang });
  }

  const plans: Record<string, string> = {};
  for (const plan of PLANS) {
    const created = await prisma.plan.upsert({ where: { slug: plan.slug }, update: plan, create: plan });
    plans[plan.slug] = created.id;
  }

  const categoryIds: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const slug = slugify(cat.name);
    const created = await prisma.businessCategory.upsert({
      where: { slug },
      update: {},
      create: {
        name: cat.name,
        slug,
        description: cat.description,
        aiContext: cat.aiContext,
        isCustom: false,
        attributes: { create: cat.attributes.map((label, order) => ({ label, order })) },
        questions: { create: cat.questions.map((text, order) => ({ text, order })) },
      },
    });
    categoryIds[cat.name] = created.id;
  }

  const adminPasswordHash = await bcrypt.hash("Admin@12345", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@febblespot.com" },
    update: {},
    create: {
      name: "Febble Spot Admin",
      email: "admin@febblespot.com",
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  const ownerPasswordHash = await bcrypt.hash("Owner@12345", 10);
  const owner = await prisma.user.upsert({
    where: { email: "owner@demo.com" },
    update: {},
    create: {
      name: "Rustabh Chauhan",
      email: "owner@demo.com",
      passwordHash: ownerPasswordHash,
      role: "BUSINESS_OWNER",
      status: "ACTIVE",
    },
  });

  const existingSub = await prisma.subscription.findFirst({ where: { userId: owner.id } });
  if (!existingSub) {
    await prisma.subscription.create({
      data: { userId: owner.id, planId: plans["pro"], status: "ACTIVE", billingCycle: "MONTHLY" },
    });
  }

  const demoBusinesses = [
    {
      name: "The Garden Bistro",
      category: "Restaurant",
      description: "A cozy multi-cuisine bistro known for fresh ingredients and warm hospitality.",
      city: "Mumbai",
      googleReviewUrl: "https://search.google.com/local/writereview?placeid=demo-garden-bistro",
    },
    {
      name: "Glow Salon & Spa",
      category: "Salon & Spa",
      description: "A premium unisex salon offering hair, skin and spa services.",
      city: "Pune",
      googleReviewUrl: "https://search.google.com/local/writereview?placeid=demo-glow-salon",
    },
    {
      name: "Wellness Care Clinic",
      category: "Clinic & Healthcare",
      description: "A multi-specialty outpatient clinic focused on patient-first care.",
      city: "Bengaluru",
      googleReviewUrl: "https://search.google.com/local/writereview?placeid=demo-wellness-clinic",
    },
  ];

  const attributePool: Record<string, string[]> = {
    Restaurant: ["Food", "Service", "Ambience"],
    "Salon & Spa": ["Staff", "Service Quality", "Result"],
    "Clinic & Healthcare": ["Doctor", "Staff", "Communication"],
  };

  const sampleFeedbackText: Record<string, string[]> = {
    Restaurant: [
      "The staff was very attentive and the food came out quickly. Really enjoyed the ambience too.",
      "Food was good but service was a bit slow during peak hours.",
      "Loved the pasta, and the staff was friendly throughout our visit.",
    ],
    "Salon & Spa": [
      "The stylist understood exactly what I wanted and the result was great.",
      "Very professional staff, the salon was clean and well maintained.",
      "Good service overall, though I had to wait a little longer than expected.",
    ],
    "Clinic & Healthcare": [
      "The doctor explained everything clearly and the staff was helpful.",
      "Waiting time was long but the consultation itself was thorough.",
      "Very clean clinic and the staff communicated well throughout.",
    ],
  };

  for (const biz of demoBusinesses) {
    const slug = slugify(`${biz.name}-${token(4)}`);
    const existing = await prisma.business.findFirst({ where: { name: biz.name } });
    const business =
      existing ??
      (await prisma.business.create({
        data: {
          name: biz.name,
          slug,
          categoryId: categoryIds[biz.category],
          description: biz.description,
          city: biz.city,
          country: "India",
          createdById: owner.id,
          members: { create: { userId: owner.id, role: "OWNER", acceptedAt: new Date() } },
          googleReviewConfig: { create: { googleReviewUrl: biz.googleReviewUrl } },
          services: {
            create: [{ name: "Signature Service", order: 0 }, { name: "Walk-in Consultation", order: 1 }],
          },
        },
      }));

    let campaign = await prisma.reviewCampaign.findFirst({ where: { businessId: business.id } });
    if (!campaign) {
      campaign = await prisma.reviewCampaign.create({
        data: {
          businessId: business.id,
          name: "Reception QR",
          code: `SPOT-RVW-${token(6)}`,
          slug: token(7),
          placement: "Reception",
          ctaText: "Scan to Share Your Experience",
          qrCode: { create: {} },
        },
      });
    }

    const existingFeedbackCount = await prisma.customerFeedback.count({ where: { businessId: business.id } });
    if (existingFeedbackCount === 0) {
      const ratings = [5, 4, 5, 3, 4, 5];
      for (let i = 0; i < ratings.length; i++) {
        const session = await prisma.customerSession.create({
          data: {
            businessId: business.id,
            campaignId: campaign.id,
            language: "en",
            currentStep: "ai-review",
            completedAt: new Date(),
          },
        });
        await prisma.customerFeedback.create({
          data: {
            sessionId: session.id,
            businessId: business.id,
            rating: ratings[i],
            selectedAttributes: attributePool[biz.category] ?? [],
            writtenFeedback: sampleFeedbackText[biz.category][i % sampleFeedbackText[biz.category].length],
            language: "en",
          },
        });
        await prisma.analyticsEvent.createMany({
          data: [
            { businessId: business.id, campaignId: campaign.id, sessionId: session.id, type: "SCAN" },
            { businessId: business.id, campaignId: campaign.id, sessionId: session.id, type: "SESSION_STARTED" },
            { businessId: business.id, campaignId: campaign.id, sessionId: session.id, type: "FEEDBACK_SUBMITTED" },
          ],
        });
      }
    }
  }

  console.log("Seed complete.");
  console.log("Super Admin login: admin@febblespot.com / Admin@12345");
  console.log("Business Owner login: owner@demo.com / Owner@12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
