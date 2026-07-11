// lib/email/send.ts
import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify().catch((err) => {
  console.error("[email] SMTP transport verification failed:", err);
});

const FROM = process.env.EMAIL_FROM ?? "TipaTale <hello@tipatale.com>";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string; // always include plain-text — spam filters penalize HTML-only emails
  unsubscribeToken?: string;
}

export async function sendEmail({ to, subject, html, text, unsubscribeToken }: SendEmailInput) {
  const unsubscribeUrl = unsubscribeToken
    ? `https://tipatale.com/api/notifications/unsubscribe?token=${unsubscribeToken}`
    : undefined;

  const unsubscribeHtml = unsubscribeUrl
    ? `<p style="margin:8px 0 0;font-size:12px;">
         <a href="${unsubscribeUrl}" style="color:#71717a;">Unsubscribe from these emails</a>
       </p>`
    : "";

  const finalHtml = html.includes("{{UNSUBSCRIBE_HTML}}")
    ? html.replace("{{UNSUBSCRIBE_HTML}}", unsubscribeHtml)
    : unsubscribeUrl
      ? `${html}<hr/><p style="font-size:12px;color:#888"><a href="${unsubscribeUrl}">Unsubscribe from these emails</a></p>`
      : html;

  const finalText = unsubscribeUrl ? `${text}\n\nUnsubscribe: ${unsubscribeUrl}` : text;

  try {
    await transporter.sendMail({
      from: FROM,
      to,
      subject,
      html: finalHtml,
      text: finalText,
      headers: unsubscribeUrl
        ? {
            "List-Unsubscribe": `<${unsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          }
        : undefined,
    });
  } catch (err) {
    console.log("[email] send failed:", { to, subject, err });
    throw err; // let callers decide: fire-and-forget spots already .catch() this
  }
}