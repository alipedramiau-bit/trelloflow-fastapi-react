/**
 * Contrast helpers: pick a text color (dark or light) that is the opposite
 * of a given background color, so titles/chips stay readable on any
 * user-chosen color (covers, labels) in every browser.
 */

/** Relative luminance (WCAG 2.x) of a #rgb / #rrggbb hex color. */
function luminance(hex: string): number {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6) return 0;
  const int = parseInt(h, 16);
  if (Number.isNaN(int)) return 0;
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * Returns the contrasting text color for a background hex color.
 * Dark slate on light backgrounds (amber, emerald, cyan, ...),
 * white on dark ones (blue, red, violet, pink, ...).
 */
export function readableTextColor(bg: string | null | undefined): string {
  if (!bg) return '#ffffff';
  if (luminance(bg) > 0.32) return '#0f172a';
  return '#ffffff';
}
