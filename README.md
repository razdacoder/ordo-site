# Ordo site

The Ordo marketing site: landing page and module pages (`/`, `/features`,
`/features/:slug`). TanStack Start on Node (Nitro), server-rendered so pages
arrive complete and crawlable.

It's one of three services:

| Service   | Repo      | Example host     |
| --------- | --------- | ---------------- |
| Site      | this repo | your site domain |
| Dashboard | `ems-ibr` (`frontend/`) | `ordo.app` |
| API       | `ems-ibr` (Django)      | `api.ordo.app` |

The site only talks to Django from the server, through its public endpoints
(`/api/public/features/`). The browser never calls
the API, so the site doesn't need a CORS entry.

## Environment

| Var       | Required | What |
| --------- | -------- | ---- |
| `API_URL` | no       | Django as this server reaches it (can be an internal address). Default `http://api.localhost:8000` (Django picks the public schema by host) |
| `PORT`    | no       | Default `3000` in the Docker image |

## Development

```sh
pnpm install
pnpm dev        # http://localhost:3001 — reads .env.development
```

Run the dashboard on `:3000` and Django on `:8000` alongside it.

## Production

```sh
docker build -t ordo-site .
docker run -p 3000:3000 -e API_URL=http://api.internal:8000 ordo-site
```

`.github/workflows/docker-publish.yml` pushes the image to GHCR on every push
to `main`.

## Shared design

The site follows the Ordo design system (`design-system/` in the
`ordo-system` repo): Outfit, Signal green, square uppercase controls and
underlined fields. `src/index.css`, `src/components/ui/button.tsx`, `input.tsx`,
`label.tsx`, `src/components/logo.tsx` (without `BrandLockup`) and
`public/favicon.svg` are copies of the dashboard's. If you change the design
system in one repo, copy the change to the other.

## Demo requests

`/demo` (`?kind=setup` or `?kind=question` to preselect) posts to Django's
`/api/public/demo-requests/` from this server, forwarding the visitor's IP.
Requests show up in the console under **Requests**, and the platform Owners
get an email for each one.
