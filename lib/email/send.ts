// lib/email/send.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Novelly <onboarding@resend.dev>"; // subdomain, see deliverability notes below

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string; // always include plain-text — spam filters penalize HTML-only emails
  unsubscribeToken?: string;
}

export async function sendEmail({ to, subject, html, text, unsubscribeToken }: SendEmailInput) {
  const unsubscribeUrl = unsubscribeToken
    ? `https://yourdomain.com/api/notifications/unsubscribe?token=${unsubscribeToken}`
    : undefined;

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject,
      html: unsubscribeUrl ? `${html}<hr/><p style="font-size:12px;color:#888">
        <a href="${unsubscribeUrl}">Unsubscribe from these emails</a>
      </p>` : html,
      text: unsubscribeUrl ? `${text}\n\nUnsubscribe: ${unsubscribeUrl}` : text,
      headers: unsubscribeUrl
        ? {
            // List-Unsubscribe headers are what let Gmail/Outlook show their native
            // "Unsubscribe" button next to the sender — this alone meaningfully
            // reduces spam-complaint rates because people click it instead of hitting "Report spam"
            "List-Unsubscribe": `<${unsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          }
        : undefined,
    });
  } catch (err) {
    // never let a failed email throw and break the actual user action
    // (posting a comment, publishing a chapter) that triggered it
    console.error("[email] send failed:", err);
  }
}