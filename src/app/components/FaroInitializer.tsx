'use client';

import { useEffect } from 'react';
import { initInstrumentation, setFaroUser } from '@/instrumentation/faro';

export function FaroInitializer() {
  useEffect(() => {
    initInstrumentation().then(async () => {
      try {
        const response = await fetch('/api/user');
        if (!response.ok) return;
        const { email } = await response.json();
        if (email) setFaroUser(email);
      } catch {
        // Non-critical: telemetry continues without user context
      }
    });
  }, []);

  return null;
}
