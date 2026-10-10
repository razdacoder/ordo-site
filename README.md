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
(`/api/system/branding/`, `/api/public/features/`). The browser never calls
the API, so the site doesn't need a CORS entry.

## Environment

| Var       | Required | What |
| --------- | -------- | ---- |
| `APP_URL` | yes      | Dashboard origin, used as the "Sign in" target, e.g. `https://ordo.app` |
| `API_URL` | no       | Django as this server reaches it (can be an internal address). Default `http://localhost:8000` |
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
docker run -p 3000:3000 -e APP_URL=https://ordo.app -e API_URL=http://api.internal:8000 ordo-site
```

`.github/workflows/docker-publish.yml` pushes the image to GHCR on every push
to `main`.

## Shared design

`src/index.css`, `src/components/ui/button.tsx`, `src/components/logo.tsx` and
`src/lib/brand.ts` are copies of the dashboard's. If you change the design
system in one repo, copy the change to the other.
