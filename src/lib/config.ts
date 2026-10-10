import { getRouteApi } from "@tanstack/react-router";

const root = getRouteApi("__root__");

/** The dashboard origin (lib/origins.server.ts). */
export function useOrigins() {
  return root.useLoaderData().origins;
}

/** Branding as fetched during the server render, or null if it failed. */
export function useBranding() {
  return root.useLoaderData().branding;
}
