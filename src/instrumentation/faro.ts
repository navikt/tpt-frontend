import { initializeFaro, getWebInstrumentations, Faro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

let faro: Faro | null = null;
let initPromise: Promise<void> | null = null;

export function initInstrumentation(): void {
  if (typeof window === 'undefined' || faro !== null || initPromise !== null) return;

  initPromise = getFaro();
}

async function getFaro(): Promise<void> {
  if (faro !== null || typeof window === 'undefined') {
    return;
  }

  try {
    // Fetch telemetry config from runtime API endpoint
    const response = await fetch('/api/telemetry-config');
    if (!response.ok) {
      console.warn('Failed to fetch telemetry config:', response.statusText);
      return;
    }

    const config = await response.json();
    const telemetryUrl = config.url;

    if (!telemetryUrl) {
      console.warn(
        'TELEMETRY_URL is not set. Faro instrumentation will not be initialized.\n' +
        'Set the TELEMETRY_URL environment variable in your deployment.'
      );
      return;
    }

    console.info('Initializing Faro telemetry:', { url: telemetryUrl });

    faro = initializeFaro({
      url: telemetryUrl,
      app: {
        name: 'tpt-frontend',
        version: process.env.NEXT_PUBLIC_VERSION || 'unknown',
      },
      instrumentations: [
        ...getWebInstrumentations({
          captureConsole: true,
        }),
        new TracingInstrumentation(),
      ],
    });
  } catch (error) {
    console.error('Failed to initialize Faro telemetry:', error);
  }
}

export function getFaroInstance(): Faro | null {
  return faro;
}
