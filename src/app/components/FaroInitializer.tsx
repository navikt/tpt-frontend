'use client';

import { useEffect } from 'react';
import { initFaro } from '@/instrumentation/faro';

export function FaroInitializer() {
  useEffect(() => {
    initFaro();
  }, []);

  return null;
}
