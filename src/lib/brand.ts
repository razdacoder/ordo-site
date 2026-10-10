/**
 * Applies the configured institution brand colour across the site.
 *
 * The whole design system resolves to four `--brand*` CSS variables that share
 * a single hue (see index.css). We keep each theme's carefully-tuned
 * lightness/chroma scale and only swap in the chosen colour's hue (and its
 * chroma for the primary slots). The root route renders brandCss as a <style>
 * block, so the first paint is already on-brand. Keep in sync with the
 * dashboard's lib/brand.tsx.
 */

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Convert a #RGB or #RRGGBB string to OKLCH. Returns null on malformed input. */
function hexToOklch(hex: string): { l: number; c: number; h: number } | null {
  let m = hex.trim().replace(/^#/, "");
  if (m.length === 3) m = m.split("").map((ch) => ch + ch).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(m)) return null;
  const r = srgbToLinear(parseInt(m.slice(0, 2), 16));
  const g = srgbToLinear(parseInt(m.slice(2, 4), 16));
  const b = srgbToLinear(parseInt(m.slice(4, 6), 16));

  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const c = Math.sqrt(a * a + bb * bb);
  let h = (Math.atan2(bb, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c, h };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/** CSS overriding the brand variables for light and dark mode, or "". */
export function brandCss(hex: string | null | undefined): string {
  const parsed = hex ? hexToOklch(hex) : null;
  if (!parsed) return "";
  const { c, h } = parsed;
  const v = (name: string, l: number, chroma: number) =>
    `${name}:oklch(${l} ${chroma} ${h});`;
  const main = clamp(c, 0.08, 0.26);
  // Chart series — light→deep ramp at the brand hue.
  const charts =
    v("--chart-1", 0.78, 0.12) +
    v("--chart-2", 0.66, 0.18) +
    v("--chart-3", 0.55, 0.22) +
    v("--chart-4", 0.42, 0.21) +
    v("--chart-5", 0.3, 0.16);
  const light =
    v("--brand", 0.55, main) +
    v("--brand-foreground", 0.99, 0.005) +
    v("--brand-soft", 0.95, 0.045) +
    v("--brand-strong", 0.42, Math.min(main, 0.22));
  const dark =
    v("--brand", 0.7, Math.min(main, 0.2)) +
    v("--brand-foreground", 0.155, 0.012) +
    v("--brand-soft", 0.32, 0.1) +
    v("--brand-strong", 0.84, Math.min(main, 0.16));
  return `:root{${light}${charts}}.dark{${dark}${charts}}`;
}
