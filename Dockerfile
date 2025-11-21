FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:22-dev AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (NAIS build should handle NAV package authentication)
RUN npm ci --ignore-scripts

COPY next.config.ts tsconfig.json ./
COPY src/ ./src/
COPY public/ ./public/

RUN npm run build

FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:22-slim
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

EXPOSE 3000

CMD ["server.js"]