// Splits chapter.content into an ordered array of HTML block strings, one
// per paragraph/heading/etc, so each block's array index can be used
// directly as a stable `paragraphIndex` for comments.

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

// Recursively unwraps single-container wrappers (e.g. one outer <div>) and
// flattens levels that don't themselves contain recognized block tags,
// until it finds the actual list of paragraph-level elements.
function collectBlockElements(root: Element, depth = 0): Element[] {
  if (depth > 8) return Array.from(root.children); // safety valve

  const direct = Array.from(root.children);

  if (direct.length === 0) return [];

  // Single non-block wrapper (<div><p>...</p><p>...</p></div>) -> drill in.
  if (direct.length === 1 && !BLOCK_TAGS.has(direct[0].tagName)) {
    return collectBlockElements(direct[0], depth + 1);
  }

  const hasAnyBlockChild = direct.some((el) => BLOCK_TAGS.has(el.tagName));
  if (hasAnyBlockChild) return direct;

  // None of the direct children are recognized block tags — flatten one
  // level down and see if that surfaces real blocks.
  const nested = direct.flatMap((el) => collectBlockElements(el, depth + 1));
  return nested.length > 0 ? nested : direct;
}

// Some editors save every paragraph inside a single <p> (or <div>),
// separated by <br> / <br/> / <br /> tags instead of separate elements.
// Detect that case and split on the <br> boundaries instead.
function splitByBreaks(el: Element): string[] {
  const inner = el.innerHTML;
  if (!/<br\s*\/?>/i.test(inner)) return [el.outerHTML];

  const tag = el.tagName.toLowerCase();
  return inner
    .split(/(?:<br\s*\/?>\s*){1,}/i)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => `<${tag}>${chunk}</${tag}>`);
}

export function splitIntoBlocks(content: string): string[] {
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(content);

  if (looksLikeHtml) {
    const doc = new DOMParser().parseFromString(content, "text/html");
    const elements = collectBlockElements(doc.body);

    if (elements.length > 0) {
      // If we ended up with exactly one block, check whether it's actually
      // several paragraphs joined by <br> tags and split those out too.
      if (elements.length === 1) {
        const brSplit = splitByBreaks(elements[0]);
        if (brSplit.length > 1) return brSplit;
      }
      return elements.map((el) => el.outerHTML);
    }
  }

  return content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p)}</p>`);
}