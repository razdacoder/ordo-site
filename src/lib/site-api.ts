import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

/*
 * Server functions for data the site needs at render time, fetched from
 * Django's public endpoints on the server so pages arrive rendered (and
 * crawlable). API_URL is Django as this server reaches it — possibly an
 * internal address. The browser never calls the API.
 */

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
  const base = (process.env.API_URL ?? "http://api.localhost:8000").replace(/\/+$/, "");
  return `${base}/api${path}`;
}

async function getJson<T>(path: string): Promise<T | null> {
  const res = await fetch(apiUrl(path), { headers: { Accept: "application/json" } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return (await res.json()) as T;
}

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

/* ---------------------------------------------------------- demo requests */

export type DemoKind = "demo" | "setup" | "question";

export interface DemoRequestInput {
  kind: DemoKind;
  name: string;
  email: string;
  phone: string;
  institution: string;
  job_title: string;
  student_count: string;
  message: string;
  /** Hidden from people; a bot that fills it in is quietly ignored. */
  website: string;
}

export type DemoRequestResult =
  | { ok: true }
  | { ok: false; detail: string; errors?: Record<string, string[]> };

const DEMO_FIELDS: Array<keyof DemoRequestInput> = [
  "kind", "name", "email", "phone", "institution", "job_title", "student_count", "message", "website",
];

/*
 * Posts the demo form to Django from this server, passing on the visitor's
 * address so Django's per visitor limit counts them, not us. Errors come
 * back as values so the form can show them next to the fields.
 */
export const submitDemoRequest = createServerFn({ method: "POST" })
  .validator((input: unknown): DemoRequestInput => {
    const raw = (input ?? {}) as Record<string, unknown>;
    const out = {} as Record<string, string>;
    for (const key of DEMO_FIELDS) out[key] = typeof raw[key] === "string" ? (raw[key] as string).slice(0, 2000) : "";
    return out as unknown as DemoRequestInput;
  })
  .handler(async ({ data }): Promise<DemoRequestResult> => {
    const { getRequestIP } = await import("@tanstack/react-start/server");
    const ip = getRequestIP({ xForwardedFor: true });
    try {
      const res = await fetch(apiUrl("/public/demo-requests/"), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(ip ? { "X-Forwarded-For": ip } : {}),
        },
        body: JSON.stringify(data),
      });
      if (res.ok) return { ok: true };
      const body = (await res.json().catch(() => ({}))) as {
        detail?: string;
        errors?: Record<string, string[]>;
      };
      return {
        ok: false,
        detail: body.detail ?? "Something went wrong. Please try again.",
        errors: body.errors,
      };
    } catch {
      return {
        ok: false,
        detail: "We couldn't send that just now. Please try again, or email hello@ordo.app.",
      };
    }
  });
