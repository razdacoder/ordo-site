import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { getConfig } from "@/lib/site-api";
import { ThemeProvider } from "@/lib/theme";
import { brandCss } from "@/lib/brand";
import styles from "@/index.css?url";

// Apply the theme before paint to avoid a flash of the wrong palette. Runs
// before any module loads, so it inlines lib/theme-cookie.ts — keep in sync.
const THEME_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)ordo-theme=(light|dark)/);var s=m?m[1]:localStorage.getItem("ordo:theme");var t=s==="light"||s==="dark"?s:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";var r=document.documentElement;if(t==="dark")r.classList.add("dark");r.style.colorScheme=t}catch(_){}})()`;

// Bump when the icons change: Chrome caches favicons per page URL and will
// otherwise keep showing (or swap back to) the old one.
const ICON_VERSION = "3";

export const Route = createRootRoute({
  // Dashboard origin + branding, resolved on the server.
  loader: () => getConfig(),
  staleTime: Infinity,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "color-scheme", content: "light dark" },
      { title: "Ordo | Exam scheduling, hall distribution & seat allocation" },
      {
        name: "description",
        content:
          "Ordo schedules, distributes, seats, and documents every exam. Automated timetable generation, hall distribution, seat allocation, and broadsheet exports.",
      },
    ],
    links: [
      { rel: "stylesheet", href: styles },
      { rel: "icon", type: "image/svg+xml", href: `/favicon.svg?v=${ICON_VERSION}` },
      { rel: "icon", type: "image/png", sizes: "64x64", href: `/favicon-32.png?v=${ICON_VERSION}` },
      { rel: "apple-touch-icon", href: `/apple-touch-icon.png?v=${ICON_VERSION}` },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  const { branding } = Route.useLoaderData();
  const brand = brandCss(branding?.brand_color);

  return (
    // The theme script sets `class`/`style` before hydration.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <HeadContent />
        {brand && <style dangerouslySetInnerHTML={{ __html: brand }} />}
      </head>
      <body>
        <ThemeProvider>
          <Outlet />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
