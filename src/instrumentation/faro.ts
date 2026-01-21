import { initializeFaro, getWebInstrumentations } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

declare global {
  interface Window {
    naisConfig?: {
      telemetryCollectorURL: string;
      app: {
        name: string;
        version: string;
      };
    };
  }
}

let faroInstance: ReturnType<typeof initializeFaro> | null = null;

export function initFaro() {
  if (typeof window === 'undefined' || faroInstance) {
    return faroInstance;
  }

  try {
    // Wait for nais.js to load and set window.naisConfig
    const checkConfig = () => {
      if (window.naisConfig) {
        faroInstance = initializeFaro({
          url: window.naisConfig.telemetryCollectorURL,
          app: window.naisConfig.app,
          instrumentations: [
            ...getWebInstrumentations({
              captureConsole: true,
            }),
            new TracingInstrumentation(),
          ],
        });
      } else {
        // Retry after a short delay if config not loaded yet
        setTimeout(checkConfig, 100);
      }
    };

    checkConfig();
  } catch (error) {
    console.warn('Failed to initialize Faro telemetry:', error);
  }

  return faroInstance;
}

export function getFaro() {
  return faroInstance;
}
