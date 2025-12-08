// Service worker cleanup utility to clear old caches

export function clearServiceWorkerCaches(): Promise<void> {
  return new Promise((resolve) => {
    if ('serviceWorker' in navigator) {
      // Unregister existing service workers
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        const unregisterPromises = registrations.map(registration => registration.unregister());
        
        Promise.all(unregisterPromises).then(() => {
          // Clear all caches
          if ('caches' in window) {
            caches.keys().then(names => {
              const deletePromises = names.map(name => caches.delete(name));
              Promise.all(deletePromises).then(() => {
                console.log('All caches cleared');
                resolve();
              }).catch(() => resolve()); // Resolve even if cache deletion fails
            }).catch(() => resolve()); // Resolve even if cache names fetch fails
          } else {
            resolve();
          }
        }).catch(() => resolve()); // Resolve even if unregistration fails
      }).catch(() => resolve()); // Resolve even if getRegistrations fails
    } else {
      resolve();
    }
  });
}

export async function forceRefreshPage(): Promise<void> {
  // Clear caches and force reload
  await clearServiceWorkerCaches();
  window.location.reload();
}