---
applyTo: "src/instrumentation/**/*.ts,src/app/api/telemetry-config/**/*.ts,src/app/components/FaroInitializer.tsx"
---

# Observability (Grafana Faro)

`TELEMETRY_URL` is a server-side env var (no `NEXT_PUBLIC_` prefix), read at **runtime**, not build-time. This
lets the same Docker image be used across environments with different telemetry endpoints.

- `src/app/api/telemetry-config/route.ts` exposes `TELEMETRY_URL` to the client at request time
- `FaroInitializer.tsx` (mounted from root layout) calls `initInstrumentation()` on client mount
- `initInstrumentation()` fetches `/api/telemetry-config`, then initializes Faro with web instrumentations + OpenTelemetry tracing
- `getFaroInstance()` returns the initialized `Faro` instance, or `null` before init completes — always guard with `?.`

## Manual Instrumentation

```typescript
import { getFaroInstance } from '@/instrumentation/faro';

// Pushing an error
try {
  // ...
} catch (error) {
  getFaroInstance()?.api.pushError(error);
}

// Custom trace
const faro = getFaroInstance();
if (faro) {
  const { trace, context } = faro.api.getOTEL();
  const tracer = trace.getTracer('default');
  const span = tracer.startSpan('some business process');
  context.with(trace.setSpan(context.active(), span), () => {
    // business logic
    span.end();
  });
}
```

Never import `getFaro` — it's a private, non-exported initializer. Only `getFaroInstance`, `initInstrumentation`,
and `setFaroUser` are exported from `src/instrumentation/faro.ts`.
