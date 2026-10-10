# Ordo marketing site (TanStack Start on Node via Nitro).
# Runtime env: APP_URL (the dashboard origin, required) and API_URL (Django
# as this server reaches it). See src/lib/origins.server.ts.

# pnpm 11 needs Node >= 22.13; corepack installs the version pinned in
# package.json's "packageManager".
FROM node:22-slim AS build
WORKDIR /site
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM node:22-slim AS runtime
WORKDIR /site
ENV NODE_ENV=production
# Nitro's node-server output is self-contained — no node_modules needed.
COPY --from=build /site/.output ./.output
ENV PORT=3000
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
