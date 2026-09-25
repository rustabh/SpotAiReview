import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/"><Logo size={28} wordmarkClassName="text-sm" tagline={false} /></Link>
          <Link href="/register"><Button size="sm">Get Started Free</Button></Link>
        </div>
      </header>

      <article className="prose prose-slate mx-auto max-w-3xl px-6 py-14 prose-headings:font-heading prose-a:text-brand-600 dark:prose-invert">
        <h1>Terms of Service</h1>
        <p className="text-sm text-ink-400">Last updated: 24 September 2026</p>

        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of AiReview, a product operated by
          Febble Spot (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;). By creating an account or using AiReview, you agree to these Terms.
        </p>

        <h2>1. What AiReview Does</h2>
        <p>
          AiReview lets businesses create QR/NFC code campaigns to collect genuine customer feedback and helps
          customers turn their own real experience into a written review using AI assistance. AiReview does not
          generate reviews for experiences that did not happen, and does not publish reviews on a customer’s
          behalf — customers always review, edit, and submit their own review themselves.
        </p>

        <h2>2. Accounts</h2>
        <p>
          You must provide accurate information when creating an account and are responsible for keeping your
          login credentials secure. You are responsible for all activity that occurs under your account,
          including actions taken by team members you invite.
        </p>

        <h2>3. Acceptable Use</h2>
        <p>You agree not to use AiReview to:</p>
        <ul>
          <li>Generate or publish reviews describing experiences that did not genuinely occur</li>
          <li>Incentivize, purchase, or otherwise manipulate reviews in violation of Google’s or any other platform’s policies</li>
          <li>Suppress, hide, or prevent customers from submitting genuine negative feedback</li>
          <li>Upload content that is unlawful, defamatory, or infringes another party’s rights</li>
          <li>Attempt to access another business’s or user’s data without authorization</li>
          <li>Interfere with or disrupt the service, including through automated scraping or abuse of AI generation limits</li>
        </ul>

        <h2>4. Subscriptions and Billing</h2>
        <p>
          AiReview offers a free plan and paid plans with higher usage limits. Paid plan pricing is shown at{" "}
          <Link href="/#pricing">/#pricing</Link>. Where payment processing is enabled, charges are billed in
          advance on a recurring basis until you downgrade or cancel. We do not store your full payment card
          details — these are handled directly by our payment processor.
        </p>

        <h2>5. Customer Data You Collect</h2>
        <p>
          As a business using AiReview, you are responsible for how you collect and use feedback from your own
          customers, including complying with applicable consumer protection and data protection laws in your
          jurisdiction. You must not use AiReview to collect sensitive personal data beyond what is reasonably
          necessary for a feedback/review flow.
        </p>

        <h2>6. AI-Generated Content</h2>
        <p>
          AI-assisted review drafts are generated based only on information a customer provides during the
          feedback flow (rating, selected tags, and their own written text). Neither Febble Spot nor the
          business using AiReview guarantees the accuracy, tone, or suitability of AI-generated text, and
          customers are always free to edit any draft before submitting it as their own review.
        </p>

        <h2>7. Intellectual Property</h2>
        <p>
          AiReview, its branding, and underlying software are owned by Febble Spot. You retain ownership of the
          business content you upload (business details, branding, questions) and the feedback your customers
          submit through your campaigns.
        </p>

        <h2>8. Termination</h2>
        <p>
          You may stop using AiReview and delete your account at any time. We may suspend or terminate accounts
          that violate these Terms, including accounts used to generate or incentivize fake reviews.
        </p>

        <h2>9. Disclaimer and Limitation of Liability</h2>
        <p>
          AiReview is provided &ldquo;as is&rdquo; without warranties of any kind. To the maximum extent permitted by law,
          Febble Spot is not liable for indirect, incidental, or consequential damages arising from your use of
          the service, including any action taken by a third-party review platform (such as Google) against
          your business listing.
        </p>

        <h2>10. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of AiReview after changes take effect
          constitutes acceptance of the updated Terms.
        </p>

        <h2>11. Contact</h2>
        <p>Questions about these Terms can be sent to the contact details listed on our <Link href="/about">About</Link> page.</p>
      </article>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <Logo size={24} wordmarkClassName="text-xs" tagline={false} />
          <p className="flex items-center gap-1.5 text-xs text-ink-400"><ShieldCheck size={13} /> Powered by Febble Spot</p>
        </div>
      </footer>
    </div>
  );
}
