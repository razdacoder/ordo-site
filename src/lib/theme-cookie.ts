/**
 * The theme preference lives in a cookie on the site's bare domain (www.
 * stripped), so it survives a www/apex switch — the dashboard is on its own
 * domain and keeps its own setting. On bare `localhost` browsers refuse a
 * Domain cookie, so it's host-only there.
 *
 * THEME_SCRIPT in routes/__root.tsx repeats this logic inline (it runs
 * before any module loads) — keep the two in sync.
 */

export type Theme = "light" | "dark";

export const THEME_COOKIE = "ordo-theme";
/** Where older builds kept the preference; read once as a fallback. */
const LEGACY_KEY = "ordo:theme";

function cookieDomain(): string | null {
  const host = window.location.hostname.replace(/^www\./, "");
  return host.includes(".") ? host : null;
}

export function readStoredTheme(): Theme | null {
  const match = document.cookie.match(/(?:^|;\s*)ordo-theme=(light|dark)/);
  if (match) return match[1] as Theme;
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy === "light" || legacy === "dark") return legacy;
  } catch {
    // storage blocked — fall through to the OS preference
  }
  return null;
}

export function storeTheme(theme: Theme) {
  const domain = cookieDomain();
  document.cookie =
    `${THEME_COOKIE}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax` +
    (domain ? `; Domain=${domain}` : "");
}
