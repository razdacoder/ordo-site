/**
 * The site talks to two other services:
 *
 *   APP_URL  — the Ordo dashboard (where "Sign in" goes), e.g. https://ordo.app
 *   API_URL  — Django as this server reaches it, for server-side fetches of
 *              branding and feature content (see site-api.ts)
 *
 * The site and dashboard live on separate domains, so neither can be derived
 * from the request host — APP_URL is required.
 */

export interface Origins {
  /** The dashboard, as the browser reaches it. */
  app: string;
}

function trim(url: string): string {
  return url.replace(/\/+$/, "");
}

export function origins(): Origins {
  const app = process.env.APP_URL;
  if (!app) throw new Error("APP_URL is not set (the dashboard's origin, e.g. https://ordo.app)");
  return { app: trim(app) };
}
