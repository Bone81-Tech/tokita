// js/pwa-install.js - PWA Install Button for Tokita

function loadPWAInstallButton() {
  // Create PWA install button element
  const pwaInstallButtonDiv = document.getElementById('pwa-install-button');
  
  pwaInstallButtonDiv.innerHTML = `
    <div id="pwa-install-container" class="pwa-install-button hidden">
      <button
        id="pwa-install-btn"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
        aria-label="Install aplikasi"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        <span id="pwa-install-text">Install App</span>
      </button>
    </div>
  `;

  // Check if it's iOS Safari
  const isIOS = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent) && /safari/.test(userAgent) && !/chrome/.test(userAgent);
  };

  let deferredPrompt = null;
  const pwaInstallContainer = document.getElementById('pwa-install-container');
  const pwaInstallBtn = document.getElementById('pwa-install-btn');
  const pwaInstallText = document.getElementById('pwa-install-text');

  // Handle iOS differently
  if (isIOS()) {
    pwaInstallContainer.classList.remove('hidden');
    pwaInstallText.textContent = 'Install PWA';
    
    pwaInstallBtn.addEventListener('click', () => {
      alert('Untuk menginstal di iOS:\n1. Ketuk tombol "Share" di browser\n2. Gulir ke bawah\n3. Pilih "Add to Home Screen"');
    });
  } else {
    // For non-iOS devices, use the standard PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;
      // Update UI to notify the user they can install the PWA
      pwaInstallContainer.classList.remove('hidden');
    });

    pwaInstallBtn.addEventListener('click', () => {
      if (!deferredPrompt) return;

      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          // User accepted the install prompt (logging removed for production)
        } else {
          // User dismissed the install prompt (logging removed for production)
        }
        deferredPrompt = null;
        pwaInstallContainer.classList.add('hidden');
      });
    });
  }
}