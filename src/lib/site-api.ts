import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { origins } from "./origins.server";

/*
 * Server functions for data the site needs at render time, fetched from
 * Django's public endpoints on the server so pages arrive rendered (and
 * crawlable). API_URL is Django as this server reaches it — possibly an
 * internal address. The browser never calls the API.
 */

export interface Branding {
  institution_name: string;
  institution_short_name: string;
  logo_url: string | null;
  brand_color: string;
}

export interface FeatureSummary {
  slug: string;
  title: string;
  subtitle: string;
  icon: string | null;
}

export interface Feature extends FeatureSummary {
  overview: string;
  capabilities: string[];
  how_it_works: string[];
  benefits: string[];
}

function apiUrl(path: string): string {
  const base = (process.env.API_URL ?? "http://localhost:8000").replace(/\/+$/, "");
  return `${base}/api${path}`;
}

async function getJson<T>(path: string): Promise<T | null> {
  const res = await fetch(apiUrl(path), { headers: { Accept: "application/json" } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return (await res.json()) as T;
}

/** Site-wide data for the root route: the dashboard origin, and branding. */
export const getConfig = createServerFn({ method: "GET" }).handler(async () => {
  let branding: Branding | null = null;
  try {
    branding = await getJson<Branding>("/system/branding/");
  } catch (err) {
    // Branding is decoration — render the stock Ordo look rather than fail.
    console.error("branding fetch failed", err);
  }
  return { origins: origins(), branding };
});

export const getFeatures = createServerFn({ method: "GET" }).handler(async () => {
  const data = await getJson<{ results: FeatureSummary[] }>("/public/features/");
  return data?.results ?? [];
});

export const getFeature = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const feature = await getJson<Feature>(`/public/features/${encodeURIComponent(slug)}/`);
    if (!feature) throw notFound();
    return feature;
  });
