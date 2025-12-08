'use client';

import { useEffect } from 'react';
import { clearServiceWorkerCaches } from '@/lib/sw-cleanup';

export default function ClearSWCache() {
  useEffect(() => {
    // Clear any existing service worker caches on component mount
    clearServiceWorkerCaches();
  }, []);

  return null; // This component doesn't render anything
}