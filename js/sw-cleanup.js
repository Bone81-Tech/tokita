// js/sw-cleanup.js - Service Worker Cleanup for Tokita

// Clear service worker caches when script loads
function clearServiceWorkerCaches() {
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
            }).catch(() => {}); // Continue even if cache deletion fails
          }).catch(() => {}); // Continue even if cache names fetch fails
        }
      }).catch(() => {}); // Continue even if unregistration fails
    }).catch(() => {}); // Continue even if getRegistrations fails
  }
}

// Force refresh page (clear caches and reload)
function forceRefreshPage() {
  clearServiceWorkerCaches();
  window.location.reload();
}

// Execute cleanup when the script is loaded
clearServiceWorkerCaches();