// lib/email/templates.ts

// ---------------------------------------------------------------------------
// Shared design system
// ---------------------------------------------------------------------------
// Every template renders its content through `renderLayout`, so all emails
// share the same header, footer, spacing, and typography. Keep templates
// focused on *content*; layout/branding changes happen in one place.

const BRAND_NAME = "TipaTale";
const BRAND_COLOR = "#7c3aed"; // primary accent (buttons, links, stars)
const BRAND_DARK = "#18181b"; // header/footer background
const TEXT_MUTED = "#71717a";
const BG = "#f4f4f5";
const CARD_BG = "#ffffff";

function renderLayout(opts: { preheader?: string; bodyHtml: string; siteUrl?: string }) {
  const siteUrl = opts.siteUrl ?? "https://tipatale.com"
  const preheader = opts.preheader ?? "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${BRAND_NAME}</title>
  </head>
  <body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <!-- preheader: hidden preview text shown in inbox list -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${CARD_BG};border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">

            <!-- Header -->
            <tr>
              <td style="background:${BRAND_DARK};padding:22px 32px;">
                <a href="${siteUrl}" style="text-decoration:none;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.02em;">
                  📖 ${BRAND_NAME}
                </a>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:36px 32px;color:#27272a;font-size:15px;line-height:1.6;">
                ${opts.bodyHtml}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 32px 28px;border-top:1px solid #f0f0f1;">
                <p style="margin:0;font-size:12px;color:${TEXT_MUTED};">
                  You're receiving this email because you have an account on ${BRAND_NAME}.
                </p>
                {{UNSUBSCRIBE_HTML}}
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(label: string, link: string) {
  return `<a href="${link}" style="display:inline-block;margin-top:20px;padding:12px 26px;background:${BRAND_COLOR};color:#ffffff;font-weight:600;font-size:14px;border-radius:8px;text-decoration:none;">${label}</a>`;
}

function quoteBlock(text: string) {
  return `<div style="margin:18px 0;padding:14px 16px;background:#faf9fb;border-left:3px solid ${BRAND_COLOR};border-radius:0 6px 6px 0;color:#52525b;font-size:14px;font-style:italic;">
    "${text}"
  </div>`;
}

function stars(rating: number) {
  return `<span style="color:#f5b400;font-size:18px;letter-spacing:2px;">${"★".repeat(rating)}${"☆".repeat(5 - rating)}</span>`;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export function commentReplyTemplate(opts: { actorName: string; bookTitle: string; commentExcerpt: string; link: string }) {
  const text = `${opts.actorName} replied to your comment on "${opts.bookTitle}":\n\n"${opts.commentExcerpt}"\n\nView it: ${opts.link}`;

  const bodyHtml = `
    <p style="margin:0 0 4px;font-size:16px;font-weight:600;">💬 New reply</p>
    <p style="margin:0;">
      <strong>${opts.actorName}</strong> replied to your comment on <strong>${opts.bookTitle}</strong>:
    </p>
    ${quoteBlock(opts.commentExcerpt)}
    ${button("View reply", opts.link)}
  `;

  return {
    subject: `${opts.actorName} replied to your comment`,
    html: renderLayout({ preheader: `${opts.actorName} replied to your comment on ${opts.bookTitle}`, bodyHtml }),
    text,
  };
}

export function newCommentTemplate(opts: { actorName: string; bookTitle: string; commentExcerpt: string; link: string }) {
  const text = `${opts.actorName} commented on your book "${opts.bookTitle}":\n\n"${opts.commentExcerpt}"\n\nView it: ${opts.link}`;

  const bodyHtml = `
    <p style="margin:0 0 4px;font-size:16px;font-weight:600;">💬 New comment</p>
    <p style="margin:0;">
      <strong>${opts.actorName}</strong> commented on your book <strong>${opts.bookTitle}</strong>:
    </p>
    ${quoteBlock(opts.commentExcerpt)}
    ${button("View comment", opts.link)}
  `;

  return {
    subject: `New comment on ${opts.bookTitle}`,
    html: renderLayout({ preheader: `${opts.actorName} commented on ${opts.bookTitle}`, bodyHtml }),
    text,
  };
}

export function chapterPublishedTemplate(opts: { bookTitle: string; chapterTitle: string; authorName: string; link: string }) {
  const text = `${opts.authorName} published a new chapter of "${opts.bookTitle}": ${opts.chapterTitle}\n\nRead it: ${opts.link}`;

  const bodyHtml = `
    <p style="margin:0 0 4px;font-size:16px;font-weight:600;">✨ New chapter</p>
    <p style="margin:0;">${opts.authorName} just published a new chapter of <strong>${opts.bookTitle}</strong>:</p>
    <p style="margin:14px 0;font-size:19px;font-weight:700;color:${BRAND_DARK};">${opts.chapterTitle}</p>
    ${button("Start reading", opts.link)}
  `;

  return {
    subject: `New chapter: ${opts.bookTitle}`,
    html: renderLayout({ preheader: `${opts.authorName} published a new chapter of ${opts.bookTitle}`, bodyHtml }),
    text,
  };
}

export function readingReminderTemplate(opts: { bookTitle: string; chapterTitle: string; link: string }) {
  const text = `You left off on "${opts.bookTitle}" — pick up where you stopped at ${opts.chapterTitle}.\n\n${opts.link}`;

  const bodyHtml = `
    <p style="margin:0 0 4px;font-size:16px;font-weight:600;">📌 Pick up where you left off</p>
    <p style="margin:0;">You haven't finished <strong>${opts.bookTitle}</strong> yet — you were on:</p>
    <p style="margin:14px 0;font-size:19px;font-weight:700;color:${BRAND_DARK};">${opts.chapterTitle}</p>
    ${button("Continue reading", opts.link)}
  `;

  return {
    subject: `Continue reading ${opts.bookTitle}?`,
    html: renderLayout({ preheader: `Pick back up on ${opts.bookTitle}`, bodyHtml }),
    text,
  };
}

export function newReviewTemplate(opts: { actorName: string; bookTitle: string; rating: string; reviewExcerpt: string; link: string }) {
  const ratingNum = Number(opts.rating);
  const excerptText = opts.reviewExcerpt ? `\n\n"${opts.reviewExcerpt}"` : "";
  const text = `${opts.actorName} left a ${opts.rating}-star review on "${opts.bookTitle}":${excerptText}\n\nView it: ${opts.link}`;

  const bodyHtml = `
    <p style="margin:0 0 4px;font-size:16px;font-weight:600;">⭐ New review</p>
    <p style="margin:0;"><strong>${opts.actorName}</strong> left a review on <strong>${opts.bookTitle}</strong>:</p>
    <p style="margin:10px 0 0;">${stars(ratingNum)}</p>
    ${opts.reviewExcerpt ? quoteBlock(opts.reviewExcerpt) : ""}
    ${button("View review", opts.link)}
  `;

  return {
    subject: `${opts.actorName} reviewed ${opts.bookTitle}`,
    html: renderLayout({ preheader: `${opts.actorName} left a ${opts.rating}-star review`, bodyHtml }),
    text,
  };
}

export function earningsUpdateTemplate(opts: { bookTitle: string; chapterTitle: string; coins: number; link: string }) {
  const text = `You earned ${opts.coins} coins from a chapter unlock on "${opts.bookTitle}" (${opts.chapterTitle}).\n\nView it: ${opts.link}`;

  const bodyHtml = `
    <p style="margin:0 0 4px;font-size:16px;font-weight:600;">🪙 You earned coins</p>
    <p style="margin:0;">
      You earned <strong style="color:${BRAND_COLOR};">${opts.coins} coins</strong> from a chapter unlock on <strong>${opts.bookTitle}</strong>:
    </p>
    <p style="margin:14px 0;font-size:17px;font-weight:600;color:${BRAND_DARK};">${opts.chapterTitle}</p>
    ${button("View chapter", opts.link)}
  `;

  return {
    subject: `You earned ${opts.coins} coins on ${opts.bookTitle}`,
    html: renderLayout({ preheader: `You earned ${opts.coins} coins`, bodyHtml }),
    text,
  };
}

export function chapterUnlockedTemplate(opts: { bookTitle: string; chapterTitle: string; coins: number; newBalance: number; link: string }) {
  const text = `You unlocked "${opts.chapterTitle}" (${opts.bookTitle}) for ${opts.coins} coins. Your new balance is ${opts.newBalance} coins.\n\nRead it: ${opts.link}`;

  const bodyHtml = `
    <p style="margin:0 0 4px;font-size:16px;font-weight:600;">🔓 Chapter unlocked</p>
    <p style="margin:0;">You unlocked a chapter of <strong>${opts.bookTitle}</strong>:</p>
    <p style="margin:14px 0 6px;font-size:17px;font-weight:600;color:${BRAND_DARK};">${opts.chapterTitle}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 4px;font-size:13px;color:${TEXT_MUTED};">
      <tr>
        <td style="padding-right:18px;">Spent<br/><strong style="color:${BRAND_DARK};font-size:15px;">${opts.coins} coins</strong></td>
        <td>New balance<br/><strong style="color:${BRAND_DARK};font-size:15px;">${opts.newBalance} coins</strong></td>
      </tr>
    </table>
    ${button("Start reading", opts.link)}
  `;

  return {
    subject: `You unlocked ${opts.chapterTitle}`,
    html: renderLayout({ preheader: `You unlocked ${opts.chapterTitle}`, bodyHtml }),
    text,
  };
}

// ---------------------------------------------------------------------------
// New: win-back email for readers who haven't logged in for a while
// ---------------------------------------------------------------------------

export function inactivityWinBackTemplate(opts: {
  userName: string;
  daysInactive: number;
  /** book they were last reading, if any */
  lastBook?: { title: string; chapterTitle: string; coverUrl?: string; link: string };
  /** a few trending/recommended books to tempt them back */
  recommendedBooks?: { title: string; author: string; coverUrl?: string; link: string }[];
  siteUrl: string;
}) {
  const { userName, daysInactive, lastBook, recommendedBooks = [], siteUrl } = opts;

  const text = [
    `Hey ${userName}, it's been ${daysInactive} days since we've seen you on ${BRAND_NAME}.`,
    lastBook ? `You were reading "${lastBook.title}" — ${lastBook.chapterTitle}. Continue: ${lastBook.link}` : "",
    recommendedBooks.length ? `Some stories you might like:\n${recommendedBooks.map((b) => `- ${b.title} by ${b.author}: ${b.link}`).join("\n")}` : "",
    `Explore now: ${siteUrl}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const lastBookHtml = lastBook
    ? `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:22px 0;background:#faf9fb;border-radius:10px;">
      <tr>
        ${
          lastBook.coverUrl
            ? `<td width="72" style="padding:16px 0 16px 16px;">
                <img src="${lastBook.coverUrl}" width="60" height="88" style="border-radius:6px;object-fit:cover;display:block;" alt="${lastBook.title} cover" />
              </td>`
            : ""
        }
        <td style="padding:16px;">
          <p style="margin:0;font-size:12px;color:${TEXT_MUTED};text-transform:uppercase;letter-spacing:0.04em;">Right where you left off</p>
          <p style="margin:4px 0 2px;font-size:16px;font-weight:700;color:${BRAND_DARK};">${lastBook.title}</p>
          <p style="margin:0;font-size:13px;color:${TEXT_MUTED};">${lastBook.chapterTitle}</p>
        </td>
      </tr>
    </table>`
    : "";

  const recommendedHtml = recommendedBooks.length
    ? `
    <p style="margin:28px 0 12px;font-size:13px;font-weight:700;color:${BRAND_DARK};text-transform:uppercase;letter-spacing:0.04em;">Trending on ${BRAND_NAME}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        ${recommendedBooks
          .slice(0, 3)
          .map(
            (b) => `
          <td style="padding:0 6px;vertical-align:top;" width="${Math.floor(100 / Math.min(recommendedBooks.length, 3))}%">
            <a href="${b.link}" style="text-decoration:none;color:inherit;">
              ${
                b.coverUrl
                  ? `<img src="${b.coverUrl}" width="100%" style="border-radius:8px;display:block;margin-bottom:8px;aspect-ratio:2/3;object-fit:cover;" alt="${b.title} cover" />`
                  : `<div style="width:100%;aspect-ratio:2/3;background:#ececf0;border-radius:8px;margin-bottom:8px;"></div>`
              }
              <p style="margin:0;font-size:13px;font-weight:600;color:${BRAND_DARK};line-height:1.3;">${b.title}</p>
              <p style="margin:2px 0 0;font-size:12px;color:${TEXT_MUTED};">${b.author}</p>
            </a>
          </td>`
          )
          .join("")}
      </tr>
    </table>`
    : "";

  const bodyHtml = `
    <p style="margin:0 0 4px;font-size:22px;">👋</p>
    <p style="margin:0 0 4px;font-size:19px;font-weight:700;color:${BRAND_DARK};">We miss you, ${userName}</p>
    <p style="margin:8px 0 0;color:${TEXT_MUTED};">
      It's been <strong style="color:${BRAND_DARK};">${daysInactive} days</strong> since your last visit — and a lot has happened on ${BRAND_NAME} since then. New chapters, new stories, and readers waiting to hear what you think.
    </p>

    ${lastBookHtml}
    ${button(lastBook ? "Continue reading" : "Explore stories", lastBook ? lastBook.link : siteUrl)}
    ${recommendedHtml}
  `;

  return {
    subject: lastBook ? `${userName}, ${lastBook.title} is waiting for you 📖` : `${userName}, your next favorite story is waiting`,
    html: renderLayout({ preheader: `It's been ${daysInactive} days — come see what's new`, bodyHtml, siteUrl }),
    text,
  };
}

// lib/email/templates.ts — add this export
export function verifyEmailTemplate({ displayName, verifyUrl }: { displayName: string; verifyUrl: string }) {
  const subject = "Verify your email";
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="margin:0 0 12px;">Hi ${displayName},</h2>
      <p style="margin:0 0 16px;color:#3f3f46;">Confirm your email address to finish setting up your account.</p>
      <a href="${verifyUrl}" style="display:inline-block;background:#8B5CF6;color:#fff;padding:10px 20px;border-radius:999px;text-decoration:none;font-weight:600;">Verify email</a>
      <p style="margin:16px 0 0;font-size:12px;color:#71717a;">This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
      {{UNSUBSCRIBE_HTML}}
    </div>
  `;
  const text = `Hi ${displayName},\n\nConfirm your email address: ${verifyUrl}\n\nThis link expires in 24 hours.`;
  return { subject, html, text };
}


// app/api/lib/email/templates.ts — add
function emailShell({
  heading,
  body,
  buttonText,
  buttonUrl,
  footnote,
}: {
  heading: string;
  body: string;
  buttonText: string;
  buttonUrl: string;
  footnote: string;
}) {
  return `
    <div style="max-width: 480px; margin: 0 auto; padding: 40px 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 16px;">
        ${heading}
      </h1>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 28px;">
        ${body}
      </p>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="border-radius: 9999px; background-color: #7c3aed;">
            <a href="${buttonUrl}"
               style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 9999px;">
              ${buttonText}
            </a>
          </td>
        </tr>
      </table>
      <p style="font-size: 12px; color: #9ca3af; margin: 28px 0 0; line-height: 1.5;">
        ${footnote}
      </p>
    </div>
  `;
}

export function resetPasswordTemplate({
  displayName,
  resetUrl,
}: {
  displayName: string;
  resetUrl: string;
}) {
  const subject = "Reset your password";
  const text = `Hi ${displayName},\n\nWe received a request to reset your password. This link expires in 30 minutes:\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`;
  const html = emailShell({
    heading: `Hi ${displayName},`,
    body: "We received a request to reset your password. Click below to choose a new one.",
    buttonText: "Reset password",
    buttonUrl: resetUrl,
    footnote: "This link expires in 30 minutes. If you didn't request this, you can safely ignore this email — your password won't change.",
  });
  return { subject, html, text };
}

export function verifyEmailChangeTemplate({
  displayName,
  verifyUrl,
}: {
  displayName: string;
  verifyUrl: string;
}) {
  const subject = "Confirm your new email";
  const text = `Hi ${displayName},\n\nConfirm your new email address to complete the change:\n${verifyUrl}\n\nThis link expires in 1 hour.`;
  const html = emailShell({
    heading: `Hi ${displayName},`,
    body: "Confirm your new email address to complete the change.",
    buttonText: "Verify email",
    buttonUrl: verifyUrl,
    footnote: "This link expires in 1 hour. If you didn't request this, you can safely ignore this email.",
  });
  return { subject, html, text };
}