// This script helps detect and remove service workers that might cause caching issues
// It should be added to the HTML head in production

if ('serviceWorker' in navigator) {
  // Remove any existing service workers that might interfere
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}