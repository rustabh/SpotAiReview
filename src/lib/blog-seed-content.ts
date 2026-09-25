export type BlogSeedPost = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  category: string;
  coverEmoji: string;
  keywords: string[];
  readingMinutes: number;
  content: string; // Markdown
};

export const BLOG_SEED_POSTS: BlogSeedPost[] = [
  {
    slug: "how-to-get-more-google-reviews-2026-guide",
    title: "How to Get More Google Reviews in 2026: The Complete Guide for Local Businesses",
    metaTitle: "How to Get More Google Reviews in 2026 (Complete Guide)",
    metaDescription:
      "A step-by-step guide to getting more Google reviews in 2026 — the best timing, scripts, QR code strategies, and tools local businesses use to turn happy customers into 5-star reviews.",
    excerpt:
      "The exact timing, wording, and QR code strategy local businesses use to turn happy customers into published five-star Google reviews.",
    category: "Google Reviews",
    coverEmoji: "⭐",
    keywords: [
      "how to get more google reviews",
      "google reviews for local business",
      "increase google reviews",
      "google review strategy 2026",
      "get customers to leave reviews",
      "google business profile reviews",
    ],
    readingMinutes: 12,
    content: `Every local business owner has heard some version of the same complaint: "My customers love us, but almost nobody leaves us a Google review." Meanwhile, a competitor two streets away with mediocre service somehow has 400 reviews and a 4.6-star rating sitting right at the top of the map pack.

The gap almost never comes down to service quality. It comes down to **process**. Businesses that consistently earn more Google reviews have simply made it easier, faster, and more natural for a happy customer to leave one. This guide walks through exactly how to do that in 2026 — the timing, the wording, the tools, and the mistakes that quietly kill review requests before they even start.

## Why Google Reviews Matter More Than Ever

Google reviews aren't just social proof anymore — they're one of the strongest local SEO ranking signals Google uses to decide which businesses show up in the "map pack" (the three business listings that appear above organic results for local searches like "dentist near me" or "best cafe in Andheri").

Three things specifically move the needle:

1. **Review count** — more reviews signal an established, trustworthy business.
2. **Review recency** — a steady stream of recent reviews tells Google (and customers) that you're active and consistently good, not just good once in 2019.
3. **Review content** — reviews that naturally mention your services, location, or specialties (e.g., "great teeth whitening in Andheri West") reinforce the keywords Google associates with your listing.

That last point is why generic, one-line reviews ("Good service!") are far less valuable than reviews where a real customer describes what actually happened in their own words — which is exactly the gap a tool like AiReview is built to close (more on that further down).

## Step 1: Fix the Timing — Ask at the Peak of Satisfaction

The single biggest lever in review collection is *when* you ask. Most businesses ask at the worst possible moment — after the customer has already left, when the emotional high of the experience has faded and inertia has taken over.

The best moment is almost always **right after the positive outcome is delivered**, while the feeling is fresh:

- A restaurant: right after the meal, when the bill is paid and the customer is visibly satisfied.
- A salon or clinic: right as the customer is checking out, post-service.
- An e-commerce or service business: right after a successful delivery or resolved support ticket, not weeks later.
- A hotel: at checkout, not three days after they've flown home and forgotten the details.

If you wait for an email three days later, you've lost most of your conversion rate. Immediate, in-the-moment requests consistently outperform delayed ones by a wide margin because you're capturing intent while it still exists.

## Step 2: Make the Ask Effortless — Remove Every Point of Friction

Here's the uncomfortable truth: most customers *want* to leave a good review when they've had a great experience. They just don't, because the process feels like a chore. Every extra step — opening an app, searching for your business, remembering what to write — is a chance for them to give up.

This is where **QR codes** have become the standard tool for local businesses. A QR code printed on a receipt, table tent, business card, or standee removes almost every point of friction:

- No searching for your business name on Google.
- No typing your business name and hoping autocomplete gets it right.
- One scan takes them directly to a pre-loaded review flow.

We cover QR code review strategy in depth in our companion guide, [QR Code Reviews Explained](/blog/qr-code-reviews-explained), but the short version is: if you're not using a QR code for review collection in 2026, you're leaving reviews on the table.

## Step 3: Give Customers Something to Say (Without Telling Them What to Write)

A huge number of would-be five-star reviews never get written because the customer freezes at the blank text box. They liked the experience, but "how was your experience?" is a surprisingly hard question to answer from a cold start.

Two proven techniques:

1. **Prompt with categories, not blank text.** Instead of "write a review," ask "what did you like?" with tappable options like *Service*, *Cleanliness*, *Value*, *Staff*. This gives the customer a starting point.
2. **Offer AI-assisted drafting — grounded in what they actually said.** This is different from a fake-review generator. The right way to do this is to let the customer describe their experience in a sentence or two, a star rating, and a couple of tags, and then use AI *only* to turn those inputs into a well-written paragraph — never inventing details the customer didn't provide. This is the entire design principle behind [AiReview by Febble Spot](/about): the AI never fabricates an experience, it just helps a real customer articulate the one they already had, in their own language.

This single change — going from a blank box to a guided, AI-assisted flow — is often the difference between a 4% and a 35% completion rate on review requests.

## Step 4: Never Let a Bad Rating Become a Public Review

If you ask every customer for a public review, you will occasionally ask someone who's unhappy. Publicly funnelling every single customer straight to Google without any filtering is how businesses accidentally invite 1-star reviews.

The fix isn't to hide negative feedback — that's dishonest and against Google's guidelines. The fix is **feedback routing**: ask for a rating first, and if it's low, route the customer to a private feedback form directed straight to the business owner instead of a public Google review page. This way:

- Happy customers (4-5 stars) are guided toward posting on Google.
- Unhappy customers (1-3 stars) get a direct channel to complain to you — where you can actually fix the problem — instead of venting publicly.

This is standard practice among modern review-collection tools and is the model AiReview uses by default: low ratings are never hidden, they're simply routed to a private feedback inbox so the business can respond and resolve the issue before it becomes public.

## Step 5: Put the QR Code Where the Moment Actually Happens

Placement matters as much as the ask itself. The best-performing spots are physical points that coincide with the moment of highest satisfaction:

- **Restaurants & cafes:** table tents, the printed bill, a small standee at the billing counter.
- **Salons & spas:** the reception desk, mirror stickers at each styling chair.
- **Clinics:** the checkout counter, appointment reminder cards.
- **Retail:** the packaging insert, the receipt, near the billing counter.
- **Hotels:** the room key card sleeve, checkout desk, in-room welcome card.
- **Home services (plumbers, electricians, etc.):** printed on the invoice or a card left behind after the job.

Read our full breakdown in [Review Standees 101](/blog/review-standees-that-get-scanned) for exact standee sizing, wording, and design tips that measurably increase scan rates.

## Step 6: Track the Full Funnel, Not Just the Star Rating

Most businesses only look at their final Google rating and have no idea *why* their review count is stagnant. The real answer usually lives further up the funnel:

- **Scans** — how many people are actually scanning the code at all?
- **Started** — of those who scan, how many begin the feedback flow?
- **Completed** — how many finish giving feedback?
- **AI draft generated** — how many get to a written review?
- **Copied / clicked through to Google** — how many actually post it?

If your scan count is high but completions are low, the flow itself is too long or confusing. If completions are high but Google click-throughs are low, customers are writing feedback but not following through to actually post — often because the "open Google" step has friction (wrong link, app doesn't open, etc.). This is exactly why full-funnel analytics — not just star ratings — is a core feature of AiReview's dashboard: you can see precisely where customers are dropping off and fix that specific step instead of guessing.

## Step 7: Make It Work in the Customer's Own Language

If you serve a multilingual customer base — extremely common across Indian cities — offering the review flow only in English quietly excludes a large chunk of your customers from ever leaving feedback at all. A customer who's more comfortable in Hindi, Marathi, Tamil, or Hinglish is far more likely to complete a review flow that lets them write in the language they actually think in, rather than forcing them to translate their thoughts into English first.

## Common Mistakes That Kill Review Requests

- **Asking too late.** By email, days after the visit — response rates collapse.
- **Asking everyone the same way regardless of sentiment.** No filtering means more negative public reviews than necessary.
- **Making the process multi-step and app-dependent.** Requiring an app download or account creation kills completion rates instantly.
- **Offering incentives for reviews.** This violates Google's policies and can get your business profile suspended. Never offer discounts, freebies, or cash in exchange for a review — ask for honest feedback, not a purchased rating.
- **Ignoring the reviews once they arrive.** Responding to reviews — especially critical ones — signals to future customers (and to Google) that the business is active and cares.

## A Simple 30-Day Plan to Increase Your Google Reviews

**Week 1:** Set up a QR code campaign at your point of highest satisfaction (checkout, billing counter, delivery confirmation). Print and place it physically.

**Week 2:** Train staff on a one-line verbal prompt: "If you enjoyed your visit, we'd really appreciate a quick Google review — just scan this code." Consistency here matters more than the wording itself.

**Week 3:** Review your funnel data. Are people scanning but not completing? Simplify the flow. Are they completing but not clicking through to Google? Check the review link is correct and opens properly on both Android and iOS.

**Week 4:** Respond to every new review, positive or negative. This closes the loop and often earns repeat business from customers who feel heard.

## Frequently Asked Questions

**Is it okay to ask customers for a Google review?**
Yes — asking for an honest review is completely within Google's guidelines. What's not allowed is asking only satisfied customers while suppressing unhappy ones from leaving feedback anywhere, or offering incentives in exchange for a review.

**How many Google reviews does a local business need?**
There's no fixed number, but businesses with 50+ recent, detailed reviews consistently outrank competitors with fewer or older reviews in local map pack results. Consistency (a steady trickle of new reviews) matters more than a single burst.

**Can I use AI to write my Google reviews for customers?**
You can use AI to *help a real customer* turn their own genuine feedback into a well-written review — that's legitimate and increasingly common. What you should never do is generate fake reviews on behalf of customers who didn't actually have the experience, which violates Google's policies and can get your business profile penalized or removed.

**What's the fastest way to start collecting more reviews this week?**
Set up a QR code campaign pointing directly to your Google review link, place it at your point of highest customer satisfaction, and start asking verbally and consistently. Tools like AiReview can have this live in under five minutes, complete with a guided AI-assisted writing flow and full analytics from the first scan.

---

Ready to put this into practice? [Set up your first QR review campaign for free](/register) and start turning happy customers into five-star Google reviews today.`,
  },
  {
    slug: "qr-code-reviews-explained",
    title: "QR Code Reviews Explained: How QR Codes Turn Happy Customers Into 5-Star Google Reviews",
    metaTitle: "QR Code Reviews Explained: The Complete 2026 Guide",
    metaDescription:
      "What is a QR code review, how does it work, and why are QR codes now the standard way local businesses collect Google reviews? A complete guide with setup steps and best practices.",
    excerpt:
      "What a QR code review actually is, how the technology works, and why it converts far better than asking customers to search for your business manually.",
    category: "QR Codes",
    coverEmoji: "📱",
    keywords: [
      "qr code review",
      "google review qr code",
      "qr code for reviews",
      "review qr code generator",
      "how does qr code review work",
      "scan to review",
    ],
    readingMinutes: 11,
    content: `If you've eaten at a restaurant, checked into a hotel, or visited a clinic recently, you've probably seen a small square barcode on the table, receipt, or counter with a line underneath it: "Scan to share your experience." That's a QR code review campaign — and it has quietly become the most effective way local businesses collect Google reviews.

This guide explains exactly what a QR code review is, how the technology behind it works, why it converts so much better than asking customers to search for your business manually, and how to set one up correctly.

## What Is a QR Code Review?

A QR code review is a printed or digital QR (Quick Response) code that, when scanned with a phone camera, takes the customer directly to a review collection page for a specific business — skipping the need to search for the business on Google, open an app, or type anything at all.

Instead of saying "please leave us a review on Google" and hoping the customer remembers to do it later (they almost never do), the business hands them a direct, one-tap path to do it *right now*, while their experience is still fresh.

Most modern QR code review tools — including AiReview — don't just link straight to the Google review box. They route the customer through a short, guided flow first:

1. **Language selection** — so the customer can respond in the language they're most comfortable with.
2. **A quick star rating** — capturing overall sentiment immediately.
3. **A few tappable tags** (e.g., "Service," "Cleanliness," "Value") plus an optional sentence or two of free text.
4. **An AI-assisted draft** — using only what the customer typed, rewritten into a natural, well-structured review.
5. **A final "Copy & Open Google" step** — where the customer reviews the draft, edits it if they want, and posts it themselves.

This structured flow is precisely why QR-based review collection converts so much better than a plain link: it removes the "blank page problem" that stops most people from ever finishing a review.

## Why QR Codes Specifically (and Not Just a Link)?

You might wonder why a QR code matters when you could just text or email a review link. The answer comes down to **context and friction**:

- **QR codes work at the physical point of the experience.** A link in a follow-up email arrives hours or days later, after the emotional peak of satisfaction has faded. A QR code on the table or receipt captures the customer *right when they're happiest*.
- **No typing required.** Opening a camera and scanning takes under two seconds. Typing a URL, searching a business name, or navigating an app takes far longer — and every extra second is a chance for the customer to give up.
- **Works for both digital and offline touchpoints.** A QR code prints on paper, plastic, vinyl standees, table tents, and packaging just as easily as it displays on a screen — a link can't do that.
- **It feels native to how people already interact with the world.** Since 2020, QR codes have become a default UI pattern for menus, payments, and check-ins — customers already know exactly what to do when they see one.

## How the Technology Actually Works

At a technical level, a QR code review campaign is straightforward:

1. A business creates a **campaign** in their review platform (e.g., "Reception QR" or "Table 4").
2. The platform generates a **unique URL** for that campaign — something like *yoursite.com/r/AB12XYZ*.
3. A **QR code image** is generated that encodes this URL. Scanning it with any phone camera opens the URL directly in the browser — no app installation needed.
4. The customer lands on a mobile-optimized review page tied to that specific campaign, business, and (optionally) placement — so you know exactly which physical QR code drove which review.
5. Every step of the customer's journey — scan, start, rating, completion, AI draft, Google click — is logged as an analytics event, giving the business owner a full funnel view instead of just a final star count.

Because each campaign has its own unique code, a single business can run multiple QR codes simultaneously — one at reception, one at billing, one on packaging — and see exactly which placement performs best.

## QR Code vs NFC: What's the Difference?

QR codes aren't the only "tap and review" technology — NFC (Near Field Communication) tags are a close cousin, embedded in small stickers or cards that customers can tap their phone against instead of scanning. Both point to the same underlying URL and flow; the difference is purely in how the customer initiates it. We cover the tradeoffs in detail in [NFC Review Cards vs QR Codes](/blog/nfc-vs-qr-code-reviews) — but the short version is: QR codes are cheaper, universally compatible, and easier to print at scale, while NFC feels slightly more premium and doesn't require opening a camera app. Many businesses use both.

## Best Practices for QR Code Review Campaigns

**1. One code per physical location, not one code for the whole business.**
If you have multiple tables, counters, or branches, create a separate campaign for each. This lets you see which specific placement is converting and where customers are actually scanning from — data you lose entirely with a single generic code.

**2. Keep the printed instruction short and specific.**
"Scan to share your experience" outperforms vague text like "Follow us" or a bare QR code with no explanation. Tell the customer exactly what will happen when they scan.

**3. Size matters — don't print it too small.**
A QR code needs to be scannable from a comfortable distance (roughly arm's length for a table tent, a bit further for a wall-mounted standee). As a rule of thumb, a code should be at least 3–4 cm across for close-up placements like receipts, and considerably larger — 15 cm or more — for standees viewed from a few feet away. See our [standee sizing guide](/blog/review-standees-that-get-scanned) for exact dimensions per use case.

**4. Test the scan yourself before printing at scale.**
Print a single test copy and physically scan it with both an Android and iPhone camera before ordering 500 standees. A code with too little quiet space (margin) around it, or printed at too small a resolution, can fail to scan reliably.

**5. Route low ratings away from the public review page.**
As covered in our [main Google reviews guide](/blog/how-to-get-more-google-reviews-2026-guide), a well-designed QR review flow asks for a rating first and only sends happy customers (4-5 stars) toward the public Google review step — unhappy customers get a private feedback channel instead. This protects your public rating while still surfacing real complaints you can act on.

**6. Refresh and monitor performance regularly.**
QR codes don't wear out, but placements can become stale — a standee that's been sitting in the same spot for a year tends to become invisible to regular staff and customers. Periodically review your funnel analytics (scans → completions → Google clicks) and reposition or redesign underperforming codes.

## Common Questions About QR Code Reviews

**Do customers need to download an app to use a QR code review?**
No — scanning a QR code opens a standard mobile web page in the phone's default browser. There's nothing to install, which is a major reason completion rates are so much higher than app-based alternatives.

**Can I track how many people scanned my QR code?**
Yes, this is one of the biggest advantages over a generic printed review link. A proper QR review platform logs every scan as an analytics event, so you can see scan counts, completion rates, and Google click-throughs broken down by campaign and placement.

**Is it against Google's policy to use a QR code to ask for reviews?**
No. Asking customers for genuine reviews — through a QR code, verbally, or by any other means — is fully within Google's guidelines. What's against policy is incentivizing reviews (offering discounts or gifts in exchange) or gating the QR code so only positive reviews reach Google while negative ones are suppressed from ever being submitted anywhere at all.

**How long does it take to set up a QR code review campaign?**
With a platform like AiReview, creating a campaign, generating the QR code, and downloading a print-ready file takes under two minutes — no design or technical skill required.

---

Ready to generate your first QR code review campaign? [Create your free campaign](/register) and have a scannable, print-ready QR code in under five minutes.`,
  },
  {
    slug: "review-standees-that-get-scanned",
    title: "Review Standees 101: How to Design a QR Code Standee That Actually Gets Scanned",
    metaTitle: "Review Standee Design Guide: QR Codes That Actually Get Scanned",
    metaDescription:
      "Learn how to design a Google review standee that gets scanned — correct sizing, placement, wording, and print specs for restaurants, salons, clinics, and retail stores.",
    excerpt:
      "Exact QR code sizing, placement, and wording for review standees that actually get scanned — with print specs for restaurants, salons, and clinics.",
    category: "QR Codes",
    coverEmoji: "🪧",
    keywords: [
      "review standee",
      "google review standee design",
      "qr code standee",
      "table tent qr code",
      "review standee size",
      "scan to review standee",
    ],
    readingMinutes: 10,
    content: `A review standee is one of the cheapest, highest-ROI pieces of marketing collateral a local business can print — and also one of the most commonly done badly. A poorly designed standee with a tiny code, no clear instruction, and vague design sits on a counter for months collecting zero scans, while a well-designed one sitting in the exact same spot can generate dozens of new Google reviews a month.

This guide covers everything that actually affects scan rate: sizing, placement, wording, and print specifications — based on what consistently works across restaurants, salons, clinics, and retail stores.

## What a Review Standee Actually Needs to Do

A standee has exactly one job: get picked up (visually) and scanned within about three seconds of a customer noticing it. That means it needs to answer three questions instantly, without the customer having to think:

1. **What is this?** (A way to leave a review)
2. **Why should I do it?** (Implicit — because they had a good experience)
3. **How do I do it?** (Scan the code with your phone camera)

Anything that slows down answering those three questions — clutter, small text, an unclear call to action, or a code that's too small to scan comfortably — directly reduces your conversion rate.

## The Anatomy of a High-Converting Standee

**1. A short, action-first headline.**
"Scan to Share Your Experience" or "Loved Your Visit? Leave Us a Review" outperforms vague headers like "Follow Us" or no header at all. Lead with the action, not the brand name — customers already know whose table they're sitting at.

**2. A large, high-contrast QR code.**
This is the single most important visual element, and the one most standees get wrong by making it too small or too low-contrast. See the sizing section below for exact specs.

**3. A one-line incentive-free nudge (optional but effective).**
A short line like "Takes less than 30 seconds" or "Answer 3 quick questions" sets expectations and reduces perceived effort — a major factor in whether someone bothers to pull out their phone.

**4. Your logo, small and secondary.**
Brand recognition matters, but the QR code should always be the visual focal point — not the logo. A standee that's 70% logo and 20% QR code will underperform one that flips that ratio.

**5. No clutter.**
Avoid social media handles, opening hours, menu items, or promotional offers on the same standee. A review standee should do one job. Combining it with five other messages dilutes all of them, including the review ask.

## Correct QR Code Sizing by Placement

QR code scan failures are almost always a sizing or print-quality issue, not a customer-behavior issue. Use these as minimum sizes for reliable scanning at typical viewing distances:

| Placement | Typical viewing distance | Minimum QR code size |
|---|---|---|
| Printed receipt | Very close (10-20 cm) | 2.5 - 3 cm |
| Table tent / tent card | Arm's length (30-50 cm) | 4 - 5 cm |
| Counter standee | Arm's length to 1 meter | 6 - 8 cm |
| Wall-mounted poster | 1 - 2 meters | 12 - 15 cm |
| Large floor standee / banner | 2 - 4 meters | 20 cm or larger |

As a general rule of thumb: **the QR code should be roughly one-tenth of the intended scanning distance.** A code meant to be scanned from a meter away needs to be about 10 cm across to scan reliably on the first try — smaller, and you'll see a spike in failed scans and abandoned attempts.

## Placement: Where to Actually Put the Standee

The best placement is always the point where satisfaction is highest and the customer's hands (and attention) are free:

- **Restaurants:** on the table itself (tent card) or at the billing counter, presented alongside the bill.
- **Cafes:** at the pickup counter or on the table, especially near where customers wait for their order.
- **Salons & spas:** at the styling chair mirror or the checkout counter, right as the service concludes.
- **Clinics:** the checkout/reception desk, ideally handed over with the payment receipt or prescription.
- **Hotels:** the front desk at checkout, and a smaller card left in the room for guests who check out via app or in a hurry.
- **Retail stores:** near the billing counter, or printed directly on the receipt/packaging insert for customers who take purchases home.
- **Home services (electricians, plumbers, etc.):** printed on the invoice left with the customer after the job — this is often the *only* physical touchpoint you get, so make it count.

Avoid placing standees somewhere customers pass by quickly without pausing (like a doorway) — the QR code needs a moment of stillness to be scanned, so pair it with a moment where the customer is already seated, standing at a counter, or waiting.

## Wording That Works (and Wording to Avoid)

**Use:**
- "Scan to Share Your Experience"
- "Loved your visit? Leave us a quick review"
- "Tell us how we did — takes 30 seconds"

**Avoid:**
- Generic or vague phrases like "Scan Here" with no context
- Anything that implies an incentive ("Scan for a discount!") — this violates Google's review policies and can get a business profile penalized
- Long paragraphs of instructions — a standee is a glance-and-act object, not a reading exercise

## Print Specifications That Matter

- **Resolution:** Export QR codes at a minimum of 300 DPI for print. A code that looks sharp on screen at 72 DPI can become blurry and unscannable once printed and can fail entirely at larger standee sizes.
- **Quiet zone (margin):** Always leave clear white space around the QR code equal to at least 4 modules (the smallest squares in the code) on each side. Cropping too close to the code edges is one of the most common causes of scan failures.
- **Contrast:** Dark code on a light background scans far more reliably than light-on-dark or low-contrast color combinations. Stick to a dark foreground (navy, black) on white or very light backgrounds unless you've specifically tested an alternative.
- **Material:** For counters and tables, laminated card stock or acrylic stands hold up far better than plain paper, which curls, stains, and becomes unscannable within weeks in a food-service environment.
- **File format:** Use the SVG or high-resolution PNG export from your review platform rather than a screenshot, which introduces compression artifacts that can break scannability at larger print sizes.

## Testing Before You Print at Scale

Before ordering 50 or 500 standees, always:

1. Print a single test copy at the final intended size.
2. Physically scan it with at least one Android and one iPhone, from the realistic distance and lighting the standee will actually sit in (including artificial restaurant lighting, which can create glare on laminated surfaces).
3. Confirm the scan lands on the correct campaign page — not a generic homepage — and that the flow loads quickly on a typical customer's mobile data connection.

## Measuring Whether Your Standee Is Working

A standee's performance should be judged on **scan-to-completion rate**, not just gut feeling. If your review platform gives you funnel analytics (scans → started → completed → Google click), check in after the first two weeks:

- **Low scans:** The standee likely isn't visible or isn't prompting action — reconsider placement, size, or headline.
- **High scans but low completions:** The flow itself may be too long, or the customer is losing interest after scanning — simplify the steps.
- **High completions but low Google click-throughs:** Check that your Google review link is correctly configured and opens properly on both Android and iOS.

## Frequently Asked Questions

**What size should a QR code review standee be for a restaurant table?**
A table tent standee should have a QR code at least 4-5 cm across, viewed from roughly arm's length. Larger counter standees intended to be seen from further away need proportionally bigger codes — see the sizing table above.

**Can I put multiple QR codes on one standee?**
Generally no — a single, unambiguous QR code with one clear call to action converts far better than a standee offering multiple scan options (e.g., one for reviews, one for a menu, one for social media), which creates decision fatigue and reduces overall completion for all of them.

**How often should I replace or reposition a review standee?**
There's no fixed schedule, but if funnel analytics show a placement's scan rate declining over time, it's worth repositioning or refreshing the design — customers and staff both start to visually "tune out" objects that have been in the same spot for a long time.

**Does the standee design need to match my brand exactly?**
It helps for consistency, but the QR code's visibility and contrast should never be sacrificed for brand color matching. If your brand color is light yellow, for instance, keep the QR code itself in high-contrast black-on-white and use your brand color for secondary design elements only.

---

Need a print-ready QR code for your next standee? [Generate one for free](/register) — every campaign includes a downloadable PNG and SVG sized correctly for print.`,
  },
  {
    slug: "ai-assisted-reviews-vs-fake-reviews",
    title: "AI-Assisted Reviews vs Fake Reviews: How AiReview by Febble Spot Keeps Every Review Honest",
    metaTitle: "AI-Assisted Reviews vs Fake Reviews: What's the Difference?",
    metaDescription:
      "AI can help customers write better reviews — or it can fabricate fake ones. Here's the critical difference, why it matters for your business, and how AiReview by Febble Spot is built to never fabricate a review.",
    excerpt:
      "The critical difference between AI that fabricates fake reviews and AI that helps a real customer write about an experience they actually had.",
    category: "AI & Product",
    coverEmoji: "✨",
    keywords: [
      "ai generated reviews",
      "fake reviews ai",
      "ai assisted reviews",
      "grounded ai reviews",
      "google review policy ai",
      "febble spot ai review",
    ],
    readingMinutes: 11,
    content: `Artificial intelligence and online reviews have become tangled together in the public conversation — and mostly for the wrong reasons. Headlines about "AI-generated fake reviews flooding Amazon and Google" have made plenty of business owners nervous about using any AI tool near their review collection process at all.

That caution is fair. But it also misses an important distinction: there's a fundamental difference between **AI that fabricates reviews** and **AI that helps a real customer articulate a real experience they actually had.** The first is fraud. The second is simply good product design — and it's the entire philosophy behind how AiReview, part of the Febble Spot ecosystem, is built.

This article explains that distinction clearly, why it matters for your business's long-term standing with Google, and exactly how grounded AI-assisted review writing works under the hood.

## The Problem With Fake AI-Generated Reviews

A fake review is any review that describes an experience the reviewer didn't actually have — whether it's written entirely by a bot, purchased from a review farm, or generated by AI with no real customer input at all. These reviews typically:

- Invent specific details (staff names, menu items, prices) that may not even be accurate
- Use suspiciously generic, repetitive phrasing across many "different" reviewers
- Appear in unnatural bursts (50 five-star reviews overnight)
- Are written by someone who never set foot in the business

Google actively fights this. Its review policies explicitly prohibit fake engagement, and Google's spam-detection systems increasingly flag reviews with telltale signs of AI-generated fabrication — repetitive sentence structures, oddly specific but unverifiable claims, or timing patterns inconsistent with real customer behavior. Businesses caught using fake reviews risk having reviews removed, receiving a policy strike, or in serious cases having their entire Google Business Profile suspended.

Beyond the policy risk, there's a simpler problem: fake reviews don't build real trust. Customers are increasingly good at spotting suspiciously generic five-star reviews, and a business profile full of them can actually *hurt* conversion rather than help it.

## What "Grounded" AI-Assisted Reviews Actually Means

The alternative — and the approach used by AiReview — starts from a completely different premise: **the AI is only allowed to use facts the real customer has actually provided.** Nothing more.

Here's what that looks like in practice, step by step:

1. A real customer, who actually visited the business, scans a QR code after their visit.
2. They select a genuine star rating reflecting their real experience.
3. They tap a few relevant tags (e.g., "Friendly Staff," "Great Value," "Clean") that describe what actually stood out to them.
4. They optionally write a sentence or two in their own words — "the waiter was really attentive and the pasta was excellent."
5. **Only at this point** does AI enter the picture — and its only job is to take those specific inputs (the rating, the tags, and the customer's own words) and turn them into a well-structured, natural-sounding paragraph. It is explicitly instructed never to add a fact, a name, a claim, or a detail the customer didn't provide.
6. The customer sees the AI-drafted review, can edit it further, regenerate it, or ask for a shorter/more natural/more professional version — and then **copies it and posts it themselves** on their own Google account.

At every step, the human is the source of truth and the final publisher. The AI is a writing assistant, not an author. This is functionally identical to using a grammar checker or an editing assistant to polish an email you wrote yourself — the underlying content and decision to send it is still entirely yours.

## Why This Distinction Matters for Google's Policies

Google's guidance on reviews centers on **authenticity of experience**, not on whether a keyboard or an AI model helped format the text. A review is legitimate as long as:

- The reviewer actually had the experience they're describing.
- The content reflects their genuine opinion.
- They are the one submitting it, in their own account, of their own accord.

None of that is violated by AI helping someone phrase their own genuine thoughts more clearly — in the same way spell-check, autocomplete, or a translation tool doesn't make a review "fake." What *does* violate policy is generating content about an experience that didn't happen, or on behalf of someone who never gave their input at all. That's the line AiReview is deliberately designed never to cross.

## The Business Case: Why Grounded AI Reviews Convert Better Than Blank Boxes

Beyond the ethical and policy angle, there's a very practical reason grounded AI-assisted writing matters: **most customers who would leave a great review never do, simply because writing one feels like effort.**

Data across review-collection tools consistently shows the same pattern: presenting a customer with a blank "write a review" text box results in a small fraction of intended reviewers actually finishing. The moment you replace that blank box with a guided flow — rating, tags, a sentence of input, then an AI-polished draft the customer can tweak and approve — completion rates rise dramatically, often by 5-8x.

The AI isn't manufacturing enthusiasm the customer doesn't have. It's removing the writing-effort barrier that stops a genuinely happy customer from ever expressing that enthusiasm in the first place.

## What Good AI-Assisted Review Tools Should Never Do

If you're evaluating any AI review tool for your business, these are hard lines that should never be crossed:

- **Never generate a review without real customer input first.** If a tool lets you "bulk generate reviews" for customers who never interacted with the flow, that's a fake-review generator, not an assistant.
- **Never invent specific factual claims** — staff names, product details, prices — that weren't part of the customer's own input.
- **Never publish on the customer's behalf.** The customer should always see, edit if they choose, and personally submit the final review from their own account.
- **Never suppress negative feedback from being expressed at all** — routing a low rating to private feedback instead of the public review page is fine and standard practice; preventing an unhappy customer from ever recording feedback anywhere is not.

## How AiReview Applies This in Practice

AiReview's grounding system works by constructing a strict "context" object for every AI generation request containing only: the business name, category, the customer's star rating, their selected tags, and their own written text. The AI model is explicitly instructed — via a system prompt — to use *only* this information and never introduce outside facts, invented specifics, or exaggerated marketing language. If a customer provides too little input (for example, just a star rating with no tags or text), the system asks for a little more detail rather than letting the AI fill the gap with fabricated content.

This is also why every draft comes with regeneration and editing options — "Make it shorter," "More natural," "More professional" — so the customer stays in full creative control of their own words, with AI purely handling the phrasing and structure.

## Frequently Asked Questions

**Is it against Google's policy to use AI to help write reviews?**
No — using AI to help a genuine customer phrase their own real experience is not against Google's policies. What's prohibited is generating fake reviews from people who didn't have the experience, or incentivizing/manipulating the review process itself.

**Can AI-written reviews get my business's Google profile penalized?**
Reviews that are clearly fabricated, purchased, or posted in unnatural bulk patterns can trigger Google's spam detection and result in review removal or profile penalties. Reviews written by real customers — even with AI assistance in phrasing — that reflect a genuine visit and genuine opinion are not the type of content these policies target.

**How does AiReview prevent the AI from making things up?**
By strictly limiting what information is available to the AI model at generation time — only the customer's own rating, selected tags, and typed input are ever passed in, with an explicit instruction never to introduce outside facts. If there isn't enough real input to work with, the system asks the customer for a bit more detail instead of inventing content.

**Does the customer have to use the AI draft exactly as generated?**
No — customers can freely edit the draft, regenerate it, or ask for a different tone (shorter, more natural, more professional) before copying it. The AI produces a starting point; the customer remains the final author and publisher.

---

Curious how a grounded AI review flow looks in practice? [Read more about our approach](/about) or [start your first campaign for free](/register).`,
  },
  {
    slug: "nfc-vs-qr-code-reviews",
    title: "NFC Review Cards vs QR Codes: Which Is Better for Collecting Google Reviews in 2026?",
    metaTitle: "NFC vs QR Code for Reviews: Which Should You Use in 2026?",
    metaDescription:
      "NFC review cards and QR codes both drive customers to your Google review page — but they work differently. Compare cost, compatibility, and conversion to pick the right one for your business.",
    excerpt:
      "NFC tags and QR codes both drive customers to your Google review page — but the cost, compatibility, and conversion tradeoffs are very different.",
    category: "QR Codes",
    coverEmoji: "📶",
    keywords: [
      "nfc review card",
      "nfc vs qr code",
      "tap to review",
      "nfc google review",
      "nfc business card review",
      "qr code or nfc for reviews",
    ],
    readingMinutes: 9,
    content: `Two technologies dominate the "scan or tap to leave a review" landscape today: QR codes and NFC (Near Field Communication) tags. Both ultimately do the same job — sending a customer's phone to the same review page — but they get there in different ways, and each has real tradeoffs worth understanding before you invest in printing standees or ordering NFC cards.

This guide breaks down exactly how each works, where each one wins, and how to decide which fits your business (or whether you should just use both).

## How QR Codes Work for Reviews

A QR code is a two-dimensional barcode that encodes a URL. A customer opens their phone's camera app, points it at the code, and their phone recognizes the pattern and shows a link to tap — which opens the review page in their default browser.

**Strengths:**
- **Works on virtually every smartphone made in the last decade**, without any special hardware — just a camera and, on very old devices, sometimes a separate QR scanner app.
- **Extremely cheap to produce.** A QR code can be printed on paper, receipts, packaging, or vinyl standees for the cost of ink and printing — no per-unit hardware cost.
- **Easy to update.** If you're using a dynamic QR code service (recommended), you can change the destination URL without reprinting the physical code.
- **Instantly recognizable.** Since 2020, QR codes have become a universal UI pattern for menus, payments, and check-ins — customers already know what to do when they see one.

**Weaknesses:**
- Requires the customer to open their camera app first (though modern phones often auto-detect QR codes directly from the lock screen camera shortcut).
- Slightly more prone to scan failure if printed too small, low-contrast, or with too little quiet-space margin (see our [standee design guide](/blog/review-standees-that-get-scanned) for correct sizing).
- Requires decent lighting and a steady hand for a second or two.

## How NFC Review Cards Work

NFC uses short-range wireless communication — the same technology behind contactless payments (Tap to Pay) and Apple Pay/Google Pay. A small NFC chip is embedded in a card, sticker, or countertop tag. When a customer taps their phone against it, the phone automatically opens the encoded link — no camera, no app, no scanning motion required.

**Strengths:**
- **Feels premium and effortless.** A single tap, no need to line up a camera shot or find good lighting.
- **Works even in low light**, since there's no visual scanning involved.
- **More durable for repeated physical handling** — a metal or plastic NFC card at a reception desk can be tapped thousands of times without wearing out, unlike a printed QR code that can fade, get stained, or peel.
- **Harder to "screenshot and ignore."** Because there's nothing to visually scan, customers engage with it in the moment rather than photographing it to "do later" (which often means never).

**Weaknesses:**
- **Hardware cost.** Each NFC tag or card has a real per-unit cost, unlike a QR code that's essentially free to reproduce.
- **Compatibility caveats.** While the overwhelming majority of smartphones from the last several years support NFC, a small number of older or budget devices don't, and some Android phones require NFC to be manually enabled in settings (iPhones since iPhone 7 support background NFC tag reading by default in most regions).
- **Can't be printed at scale casually.** You can't just "print more" NFC tags the way you can print more QR code flyers — each additional card is a real cost and a physical object you need to source and program.
- **Slightly less familiar to some customers**, particularly outside major cities, compared to the now near-universal recognition of QR codes.

## Head-to-Head Comparison

| Factor | QR Code | NFC Tag/Card |
|---|---|---|
| Setup cost | Free to print | Per-unit hardware cost |
| Scan/tap speed | ~2-3 seconds | ~1 second |
| Works in low light | Requires decent lighting | Works regardless of lighting |
| Device compatibility | Universal (any camera phone) | Very high, with rare exceptions |
| Durability (physical wear) | Moderate (paper can fade/tear) | High (built into card/metal tag) |
| Cost to scale to many locations | Very low | Moderate to high |
| Customer familiarity | Extremely high | High and growing |
| Best for | Tables, receipts, packaging, standees, anywhere printable | Reception desks, countertops, premium/repeat-touch surfaces |

## Which Should Your Business Use?

**Choose QR codes if:**
- You need to deploy across many physical locations or printed surfaces cheaply (every table, every receipt, every piece of packaging).
- Budget is a primary concern.
- You want the flexibility to update or redesign frequently without reordering hardware.

**Choose NFC if:**
- You have a single, high-traffic touchpoint (like a reception desk or checkout counter) where a durable, premium, one-tap experience matters more than cost-per-unit.
- Your environment has inconsistent lighting (dim restaurants, poorly lit counters) where scanning a QR code can be frustrating.
- You want to minimize customers "screenshotting for later" and instead capture the moment immediately.

**Use both if:**
- You want maximum coverage — for example, a QR code on every table and receipt, plus an NFC tag at the checkout counter as a fast, durable alternative for customers who prefer tapping. This is increasingly common among higher-volume businesses that want to remove every possible point of friction, regardless of which method a given customer finds most natural.

The good news is that with a modern review platform, both methods can point to the exact same underlying campaign and URL — meaning you don't need separate analytics, separate review flows, or separate setup for QR and NFC. A single campaign can support both an NFC tap and a QR scan, feeding into one unified funnel report.

## Setting Up Both Without Duplicating Work

When using a platform like AiReview, a single review campaign generates both a scannable QR code (as a downloadable PNG/SVG) and supports linking an NFC device to the exact same campaign URL. This means:

- One campaign, one link, one review flow.
- Combined analytics — you see total scans/taps, completions, and Google click-throughs in one place, regardless of which physical method drove the traffic.
- No need to maintain two separate systems or reconcile numbers between a QR provider and a separate NFC provider.

## Frequently Asked Questions

**Do NFC review cards work on all phones?**
The vast majority of smartphones released in the last several years support NFC, including all iPhones from the iPhone 7 onward and virtually all modern Android devices. A small number of older or ultra-budget devices may lack NFC support, which is the main reason many businesses keep a QR code as a fallback even where NFC is the primary method.

**Is NFC more expensive than QR codes?**
Yes — QR codes cost nothing beyond printing, while NFC tags/cards have a real per-unit hardware cost. For businesses deploying at many locations or printed surfaces, QR codes are typically the more cost-effective default, with NFC reserved for a small number of high-traffic touchpoints.

**Can I use the same review page for both my QR code and NFC card?**
Yes, and this is the recommended approach — point both to the same campaign so all your review funnel analytics stay unified in one dashboard rather than split across two systems.

**Which converts better, QR or NFC?**
Both convert significantly better than no physical touchpoint at all (i.e., relying on customers to search for your business manually). Within the two, NFC often has a marginally faster interaction time since there's no camera or lighting dependency, but QR codes' near-universal compatibility and near-zero cost make them the more practical default for most small and mid-sized businesses.

---

Want to set up both QR and NFC on the same campaign? [Create your first campaign for free](/register) — AiReview supports linking NFC devices to any QR campaign at no extra cost.`,
  },
  {
    slug: "google-review-mistakes-costing-you-customers",
    title: "7 Google Review Mistakes That Are Costing Local Businesses Customers (And How to Fix Them)",
    metaTitle: "7 Google Review Mistakes Costing You Customers (+ Fixes)",
    metaDescription:
      "From asking at the wrong time to ignoring negative reviews, here are the 7 most common Google review mistakes local businesses make — and exactly how to fix each one.",
    excerpt:
      "From bad timing to ignoring negative feedback, these are the 7 most common Google review mistakes local businesses make — and how to fix each one.",
    category: "Google Reviews",
    coverEmoji: "⚠️",
    keywords: [
      "google review mistakes",
      "common review mistakes",
      "google business profile mistakes",
      "how to respond to negative reviews",
      "google review policy violations",
      "local business reviews",
    ],
    readingMinutes: 10,
    content: `Most local businesses aren't losing customers because of bad service — they're losing potential customers because of how they handle Google reviews. A single unanswered one-star review sitting at the top of a business's profile, or a review count that hasn't moved in eight months, quietly costs far more business than owners realize.

Here are the seven most common mistakes we see across restaurants, clinics, salons, and retail businesses — and exactly how to fix each one.

## Mistake 1: Asking for Reviews at the Wrong Time (Or Never Asking At All)

The most common mistake isn't asking badly — it's not asking at all, or asking so long after the experience that the customer's motivation has evaporated. Many businesses rely entirely on customers spontaneously deciding to leave a review, which happens far less often than owners assume, especially from satisfied-but-not-ecstatic customers who make up the majority of any customer base.

**The fix:** Ask at the peak moment of satisfaction — right after the meal, right after checkout, right after a successful service — not through a follow-up email days later. We cover exact timing and scripts in our [complete Google reviews guide](/blog/how-to-get-more-google-reviews-2026-guide).

## Mistake 2: Making the Review Process Too Difficult

Even when businesses do ask, they often send customers on a scavenger hunt: "Just search for us on Google and leave a review!" This requires the customer to open an app, type your exact business name, hope autocomplete finds the right listing among similarly named competitors, and then face a blank text box.

**The fix:** Use a direct link or QR code that takes the customer straight to your specific review page — no searching required. A QR code printed at the point of purchase removes nearly the entire friction chain in one step. See our [QR code reviews guide](/blog/qr-code-reviews-explained) for setup details.

## Mistake 3: The Blank Text Box Problem

Even with a direct link, many review platforms simply drop the customer into an empty "write your review" box with no guidance. For most people, staring at a blank text field with no prompt is enough to make them close the tab and move on — not because they don't have positive things to say, but because turning a vague good feeling into written words feels like real effort.

**The fix:** Guide the customer with a star rating first, then a few tappable descriptive tags, then a short prompt for their own words — and offer an AI-assisted draft based only on what they've actually said, which they can edit and approve before posting. This structured approach consistently converts far more "would-be reviewers" into actual published reviews than a blank box ever does.

## Mistake 4: Treating Every Customer the Same, Regardless of Sentiment

Sending every single customer — happy or frustrated — straight to the public Google review page is a quiet risk. If a small percentage of your customers have a rough experience on any given day, funneling all of them toward a public review page increases your odds of collecting public 1 and 2-star reviews you could have otherwise resolved privately.

**The fix:** Ask for a star rating first. Route customers giving 4-5 stars toward the public Google review flow, and route customers giving 1-3 stars to a private feedback form that goes directly to you. This isn't about hiding criticism — it's about giving unhappy customers a direct channel to be heard and resolved, while still allowing every customer to leave feedback somewhere.

## Mistake 5: Incentivizing Reviews (Which Violates Google's Policy)

It's tempting to offer a discount, free item, or entry into a giveaway in exchange for a review — but this directly violates Google's review policies, which prohibit incentivized or conditional reviews. Beyond the policy risk (which can result in review removal or profile penalties), incentivized reviews also tend to be shorter, less specific, and less trustworthy to future customers who can often spot a "review for a free coffee" pattern.

**The fix:** Ask for honest feedback, full stop — no discounts, no giveaways, no "leave a review to enter." If you want to thank customers for taking the time, do it after the fact and disconnected from whether or how they reviewed you, not as a stated condition.

## Mistake 6: Ignoring Reviews Once They're Posted

A shockingly large number of business profiles have zero owner responses to any review — positive or negative. This is a missed opportunity twice over: it signals to prospective customers that the business isn't actively engaged, and it wastes a real chance to publicly resolve a complaint or reinforce a positive experience.

**The fix:** Respond to every new review within a few days, especially negative ones. A thoughtful, non-defensive response to a critical review often reassures future customers more than the negative review itself concerns them — it shows the business takes feedback seriously and acts on it.

## Mistake 7: Only Looking at the Star Rating, Never the Funnel

Business owners often check their overall Google rating and stop there, with no visibility into *why* review growth has stalled. Is the QR code not getting scanned? Are customers starting but abandoning the flow halfway through? Are they completing the write-up but never actually clicking through to Google to post it?

**The fix:** Track the full journey — scans, session starts, completions, AI drafts generated, and Google click-throughs — not just the final star count. A funnel view immediately shows you *where* the drop-off is happening, so you can fix that specific step instead of guessing. This is exactly the kind of visibility a proper review-collection dashboard should give you by default.

## A Quick Self-Audit

Ask yourself these five questions about your current review process:

1. Do we ask for a review at the actual moment of highest satisfaction, or hope customers remember later?
2. Is there a direct, one-scan or one-tap path to our review page, or do we expect customers to search manually?
3. Do we guide customers with a rating and prompts, or drop them into a blank text box?
4. Do we route unhappy customers somewhere private, or send everyone to the same public page?
5. Do we respond to reviews — especially critical ones — within a few days?

If you answered "no" or "not sure" to more than one of these, there's a straightforward, low-cost fix available for each — and most of them can be implemented in an afternoon with the right tool.

## Frequently Asked Questions

**Can offering a discount for a review get my Google Business Profile suspended?**
Repeated or reported incentivized-review practices can lead to review removal and, in serious or repeated cases, penalties against the business profile. It's not worth the risk when a well-designed, friction-free ask converts nearly as well without violating policy.

**Should I respond to every single review, even short ones like "Great!"?**
It's good practice to respond to as many as feasible, especially all negative and mixed reviews. For very short positive reviews, even a brief "Thank you for visiting!" reinforces engagement, though prioritizing detailed and critical reviews first is a reasonable approach if time is limited.

**What's the single highest-impact fix from this list?**
For most businesses, fixing the timing and friction of the initial ask (mistakes 1 and 2) produces the largest jump in review volume, since it addresses the biggest drop-off point — the vast majority of potential reviewers who simply never start the process at all.

**How do I know if my review funnel has a friction problem?**
Compare your QR code or link scan count to your actual completed review count. A large gap between the two — many scans but few completed reviews — points to friction inside the review-writing flow itself, not a lack of customer willingness.

---

Ready to fix your review funnel end to end? [Set up a guided, AI-assisted review campaign for free](/register) and get full funnel analytics from your very first scan.`,
  },
];
