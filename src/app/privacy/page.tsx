import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/"><Logo size={28} wordmarkClassName="text-sm" tagline={false} /></Link>
          <Link href="/register"><Button size="sm">Get Started Free</Button></Link>
        </div>
      </header>

      <article className="prose prose-slate mx-auto max-w-3xl px-6 py-14 prose-headings:font-heading prose-a:text-brand-600 dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-ink-400">Last updated: 24 September 2026</p>

        <p>
          This Privacy Policy explains how Febble Spot (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) collects, uses, and protects
          information when you use AiReview — whether as a business owner using the platform or a customer
          submitting feedback through a business’s review campaign.
        </p>

        <h2>1. Information We Collect</h2>
        <h3>From Business Owners</h3>
        <ul>
          <li>Account details: name, email address, password (stored as a secure hash, never in plain text)</li>
          <li>Business details you provide: business name, category, contact info, branding, and Google review link</li>
          <li>Usage data: campaigns created, team members invited, subscription plan</li>
        </ul>
        <h3>From Customers Submitting Feedback</h3>
        <ul>
          <li>The rating, tags, and written feedback they choose to submit</li>
          <li>Their selected language</li>
          <li>Basic technical data (timestamp, and which campaign/QR code was scanned) used only for the business’s own funnel analytics</li>
        </ul>
        <p>
          We do not require customers to create an account or provide their name, email, or phone number to
          submit feedback through a review campaign.
        </p>

        <h2>2. How We Use Information</h2>
        <ul>
          <li>To operate the core product — generating AI-assisted review drafts strictly from what a customer typed</li>
          <li>To show business owners analytics about their own campaigns</li>
          <li>To send transactional emails (password resets, account creation, team invites) — never marketing emails without consent</li>
          <li>To maintain security, prevent abuse, and enforce our <Link href="/terms">Terms of Service</Link></li>
        </ul>

        <h2>3. AI Processing</h2>
        <p>
          When generating or transforming a review draft, the specific rating, tags, and text a customer entered
          are sent to our configured AI provider (which may be OpenAI, Anthropic, or an internal offline model,
          depending on configuration) solely to produce the draft text. No other personal data is included in
          this request, and the AI is explicitly instructed to use only the information provided — never to
          introduce facts, names, or claims that weren’t given.
        </p>

        <h2>4. Third-Party Service Providers</h2>
        <p>We rely on the following categories of infrastructure providers to operate AiReview:</p>
        <ul>
          <li>Cloud hosting and deployment (e.g., Vercel)</li>
          <li>Database hosting (e.g., Neon, PostgreSQL)</li>
          <li>Transactional email delivery (e.g., Resend)</li>
          <li>AI providers for review draft generation (e.g., OpenAI, Anthropic), where configured</li>
        </ul>
        <p>These providers process data only as needed to deliver the service and are not permitted to use it for their own purposes.</p>

        <h2>5. Data Retention</h2>
        <p>
          We retain account and business data for as long as the account is active. Customer feedback is
          retained by the business that collected it for as long as their account remains active, subject to
          their chosen plan’s analytics retention period. You can request deletion of your account and
          associated data at any time.
        </p>

        <h2>6. Your Rights</h2>
        <p>
          Depending on your location, you may have rights to access, correct, export, or delete your personal
          data. To exercise these rights, contact us using the details on our <Link href="/about">About</Link>{" "}
          page.
        </p>

        <h2>7. Cookies and Local Storage</h2>
        <p>
          We use essential cookies/local storage required for authentication (keeping you signed in) and basic
          product functionality. We do not use third-party advertising trackers.
        </p>

        <h2>8. Security</h2>
        <p>
          Passwords are stored using industry-standard hashing (bcrypt). Access to business data is restricted
          so that one business owner can never read another business’s data, enforced at the database query
          level for every request.
        </p>

        <h2>9. Children’s Privacy</h2>
        <p>AiReview is intended for business use and is not directed at children under 18.</p>

        <h2>10. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. Material changes will be reflected by updating the date above.</p>

        <h2>11. Contact</h2>
        <p>Questions about this Privacy Policy can be sent to the contact details listed on our <Link href="/about">About</Link> page.</p>
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
