import "server-only";
import { Resend } from "resend";

const FROM_ADDRESS = process.env.EMAIL_FROM ?? "AiReview <onboarding@resend.dev>";

function wrapper(bodyHtml: string) {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:32px 16px;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="padding:24px 28px;border-bottom:1px solid #e2e8f0;">
        <span style="font-weight:800;font-size:18px;color:#0b0f19;">AiReview</span>
        <span style="font-size:12px;color:#94a3b8;margin-left:6px;">by Febble Spot</span>
      </div>
      <div style="padding:28px;color:#334155;font-size:15px;line-height:1.6;">
        ${bodyHtml}
      </div>
      <div style="padding:16px 28px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;">
        Powered by Febble Spot
      </div>
    </div>
  </body>
</html>`;
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Sends a transactional email via Resend when RESEND_API_KEY is configured.
 * Without a key, it logs the email server-side (visible only in server
 * logs, never to the requester) so the product never silently breaks and
 * never leaks a secret link to whoever triggered the request.
 */
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const fullHtml = wrapper(html);

  if (!isEmailConfigured()) {
    console.log(`[email:mock] To: ${to} | Subject: ${subject}\n${html}`);
    return { ok: true as const, delivered: false };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({ from: FROM_ADDRESS, to, subject, html: fullHtml });
  if (error) {
    console.error("[email:resend] Failed to send:", error);
    return { ok: false as const, delivered: false };
  }
  return { ok: true as const, delivered: true };
}

export function passwordResetEmail(resetUrl: string) {
  return `
    <p style="margin:0 0 16px;">We received a request to reset your AiReview password.</p>
    <p style="margin:0 0 24px;">Click the button below to choose a new password. This link expires in 30 minutes.</p>
    <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:10px;">Reset Password</a>
    <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
  `;
}

export function welcomeEmail(name: string) {
  return `
    <p style="margin:0 0 16px;">Hi ${name},</p>
    <p style="margin:0 0 16px;">Welcome to AiReview! Your account is ready — set up your first business and QR campaign in under five minutes.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard/businesses/new" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:10px;">Set Up Your Business</a>
  `;
}

export function businessOwnerCreatedEmail(name: string, email: string, temporaryPassword: string) {
  return `
    <p style="margin:0 0 16px;">Hi ${name},</p>
    <p style="margin:0 0 16px;">An AiReview account has been created for you. Here are your login details:</p>
    <p style="margin:0 0 8px;"><strong>Email:</strong> ${email}</p>
    <p style="margin:0 0 24px;"><strong>Temporary password:</strong> ${temporaryPassword}</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/login" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:10px;">Log In</a>
    <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;">We recommend changing this password after your first login.</p>
  `;
}

export function teamInviteEmail(businessName: string, role: string) {
  return `
    <p style="margin:0 0 16px;">You've been added to <strong>${businessName}</strong>'s team on AiReview as a <strong>${role.toLowerCase()}</strong>.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:10px;">Open Dashboard</a>
  `;
}
