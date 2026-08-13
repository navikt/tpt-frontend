FROM node:24 AS builder
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=secret,id=NODE_AUTH_TOKEN,env=NODE_AUTH_TOKEN \
    pnpm config set //npm.pkg.github.com/:_authToken="${NODE_AUTH_TOKEN}" && \
    pnpm install --frozen-lockfile

COPY next.config.ts tsconfig.json ./
COPY src/ ./src/
COPY messages/ ./messages/
COPY public/ ./public/

RUN pnpm run build

FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:24-slim
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["server.js"]
