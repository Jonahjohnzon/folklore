// lib/reader-blocks.ts

const BLOCK_TAGS = new Set([
  "P", "H1", "H2", "H3", "H4", "H5", "H6",
  "BLOCKQUOTE", "UL", "OL", "PRE", "FIGURE", "HR", "TABLE",
]);

export function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function withDropCap(html: string): string {
  const match = html.match(/^(\s*<[^>]+>\s*)([^<])/);
  if (!match) return html;
  const [, prefix, firstChar] = match;
  return `${prefix}<span class="cr-drop-cap">${firstChar}</span>${html.slice(prefix.length + firstChar.length)}`;
}

function collectBlockElements(root: Element, depth = 0): Element[] {
  if (depth > 8) return Array.from(root.children);

  const direct = Array.from(root.children);
  if (direct.length === 0) return [];

  if (direct.length === 1 && !BLOCK_TAGS.has(direct[0].tagName)) {
    return collectBlockElements(direct[0], depth + 1);
  }

  const hasAnyBlockChild = direct.some((el) => BLOCK_TAGS.has(el.tagName));
  if (hasAnyBlockChild) return direct;

  const nested = direct.flatMap((el) => collectBlockElements(el, depth + 1));
  return nested.length > 0 ? nested : direct;
}

// Some editors save several real paragraphs inside ONE element, separated
// by <br><br> (or a run of <br>s) instead of separate <p> tags. This now
// runs on every block element we find — not just when the whole doc is a
// single wrapper — so mid-document merged paragraphs get split too.
function splitByBreaks(el: Element): string[] {
  const inner = el.innerHTML;
  const tag = el.tagName.toLowerCase();

  // Require a DOUBLE break (or more) to count as a paragraph boundary —
  // a single <br> is a soft line break (e.g. dialogue, poetry) and should
  // stay inside the same paragraph, matching how Wattpad/Inkitt treat it.
  const DOUBLE_BR = /(?:<br\s*\/?>\s*){2,}/i;

  if (DOUBLE_BR.test(inner)) {
    const chunks = inner
      .split(DOUBLE_BR)
      .map((chunk) => chunk.trim())
      .filter(Boolean);
    if (chunks.length > 1) {
      return chunks.map((chunk) => `<${tag}>${chunk}</${tag}>`);
    }
  }

  const text = el.textContent ?? "";
  if (/\n{2,}/.test(text)) {
    const chunks = text
      .split(/\n{2,}/)
      .map((chunk) => chunk.trim())
      .filter(Boolean);
    if (chunks.length > 1) {
      return chunks.map((chunk) => `<p>${escapeHtml(chunk)}</p>`);
    }
  }

  return [el.outerHTML];
}

export function splitIntoBlocks(content: string): string[] {
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(content);

  if (looksLikeHtml) {
    const doc = new DOMParser().parseFromString(content, "text/html");
    const elements = collectBlockElements(doc.body);

    if (elements.length > 0) {
      // Run the break-split on EVERY element and flatten — fixes the case
      // where only one wrapper among several was ever checked before.
      return elements.flatMap((el) => splitByBreaks(el));
    }
  }

  return content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p)}</p>`);
}