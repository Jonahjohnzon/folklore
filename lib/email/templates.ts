// lib/email/templates.ts
export function commentReplyTemplate(opts: { actorName: string; bookTitle: string; commentExcerpt: string; link: string }) {
  const text = `${opts.actorName} replied to your comment on "${opts.bookTitle}":\n\n"${opts.commentExcerpt}"\n\nView it: ${opts.link}`;
  const html = `
    <div style="font-family:sans-serif;max-width:480px">
      <p><strong>${opts.actorName}</strong> replied to your comment on <strong>${opts.bookTitle}</strong>:</p>
      <blockquote style="border-left:3px solid #ddd;padding-left:12px;color:#555">${opts.commentExcerpt}</blockquote>
      <a href="${opts.link}" style="display:inline-block;padding:10px 20px;background:#111;color:#fff;border-radius:6px;text-decoration:none">View reply</a>
    </div>`;
  return { subject: `${opts.actorName} replied to your comment`, html, text };
}

export function newCommentTemplate(opts: { actorName: string; bookTitle: string; commentExcerpt: string; link: string }) {
  const text = `${opts.actorName} commented on your book "${opts.bookTitle}":\n\n"${opts.commentExcerpt}"\n\nView it: ${opts.link}`;
  const html = `
    <div style="font-family:sans-serif;max-width:480px">
      <p><strong>${opts.actorName}</strong> commented on your book <strong>${opts.bookTitle}</strong>:</p>
      <blockquote style="border-left:3px solid #ddd;padding-left:12px;color:#555">${opts.commentExcerpt}</blockquote>
      <a href="${opts.link}" style="display:inline-block;padding:10px 20px;background:#111;color:#fff;border-radius:6px;text-decoration:none">View comment</a>
    </div>`;
  return { subject: `New comment on ${opts.bookTitle}`, html, text };
}

export function chapterPublishedTemplate(opts: { bookTitle: string; chapterTitle: string; authorName: string; link: string }) {
  const text = `${opts.authorName} published a new chapter of "${opts.bookTitle}": ${opts.chapterTitle}\n\nRead it: ${opts.link}`;
  const html = `
    <div style="font-family:sans-serif;max-width:480px">
      <p>New chapter of <strong>${opts.bookTitle}</strong> from ${opts.authorName}:</p>
      <p style="font-size:18px">${opts.chapterTitle}</p>
      <a href="${opts.link}" style="display:inline-block;padding:10px 20px;background:#111;color:#fff;border-radius:6px;text-decoration:none">Start reading</a>
    </div>`;
  return { subject: `New chapter: ${opts.bookTitle}`, html, text };
}

export function readingReminderTemplate(opts: { bookTitle: string; chapterTitle: string; link: string }) {
  const text = `You left off on "${opts.bookTitle}" — pick up where you stopped at ${opts.chapterTitle}.\n\n${opts.link}`;
  const html = `
    <div style="font-family:sans-serif;max-width:480px">
      <p>You haven't finished <strong>${opts.bookTitle}</strong> yet — you were on <strong>${opts.chapterTitle}</strong>.</p>
      <a href="${opts.link}" style="display:inline-block;padding:10px 20px;background:#111;color:#fff;border-radius:6px;text-decoration:none">Continue reading</a>
    </div>`;
  return { subject: `Continue reading ${opts.bookTitle}?`, html, text };
}

// lib/email/templates.ts — add alongside the existing templates
export function newReviewTemplate(opts: { actorName: string; bookTitle: string; rating: string; reviewExcerpt: string; link: string }) {
  const stars = "★".repeat(Number(opts.rating)) + "☆".repeat(5 - Number(opts.rating));
  const excerptBlock = opts.reviewExcerpt
    ? `<blockquote style="border-left:3px solid #ddd;padding-left:12px;color:#555">${opts.reviewExcerpt}</blockquote>`
    : "";
  const excerptText = opts.reviewExcerpt ? `\n\n"${opts.reviewExcerpt}"` : "";

  const text = `${opts.actorName} left a ${opts.rating}-star review on "${opts.bookTitle}":${excerptText}\n\nView it: ${opts.link}`;
  const html = `
    <div style="font-family:sans-serif;max-width:480px">
      <p><strong>${opts.actorName}</strong> left a review on <strong>${opts.bookTitle}</strong>:</p>
      <p style="color:#d4a72c;font-size:18px;letter-spacing:2px">${stars}</p>
      ${excerptBlock}
      <a href="${opts.link}" style="display:inline-block;padding:10px 20px;background:#111;color:#fff;border-radius:6px;text-decoration:none">View review</a>
    </div>`;
  return { subject: `${opts.actorName} reviewed ${opts.bookTitle}`, html, text };
}

// lib/email/templates.ts — add alongside the existing templates
export function earningsUpdateTemplate(opts: {
  bookTitle: string;
  chapterTitle: string;
  coins: number;
  link: string;
}) {
  const text = `You earned ${opts.coins} coins from a chapter unlock on "${opts.bookTitle}" (${opts.chapterTitle}).\n\nView it: ${opts.link}`;
  const html = `
    <div style="font-family:sans-serif;max-width:480px">
      <p>You earned <strong>${opts.coins} coins</strong> from a chapter unlock on <strong>${opts.bookTitle}</strong>:</p>
      <p style="font-size:18px">${opts.chapterTitle}</p>
      <a href="${opts.link}" style="display:inline-block;padding:10px 20px;background:#111;color:#fff;border-radius:6px;text-decoration:none">View chapter</a>
    </div>`;
  return { subject: `You earned ${opts.coins} coins on ${opts.bookTitle}`, html, text };
}

// lib/email/templates.ts — add alongside the existing templates
export function chapterUnlockedTemplate(opts: {
  bookTitle: string;
  chapterTitle: string;
  coins: number;
  newBalance: number;
  link: string;
}) {
  const text = `You unlocked "${opts.chapterTitle}" (${opts.bookTitle}) for ${opts.coins} coins. Your new balance is ${opts.newBalance} coins.\n\nRead it: ${opts.link}`;
  const html = `
    <div style="font-family:sans-serif;max-width:480px">
      <p>You unlocked a chapter of <strong>${opts.bookTitle}</strong>:</p>
      <p style="font-size:18px">${opts.chapterTitle}</p>
      <p style="color:#555">Spent: <strong>${opts.coins} coins</strong> · New balance: <strong>${opts.newBalance} coins</strong></p>
      <a href="${opts.link}" style="display:inline-block;padding:10px 20px;background:#111;color:#fff;border-radius:6px;text-decoration:none">Start reading</a>
    </div>`;
  return { subject: `You unlocked ${opts.chapterTitle}`, html, text };
}