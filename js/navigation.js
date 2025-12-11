// js/navigation.js - Navigation Component for Tokita

// Create navigation component
function loadNavigation() {
  const navPlaceholder = document.getElementById('navigation-placeholder');
  
  navPlaceholder.innerHTML = `
    <nav class="bg-white shadow-md sticky top-0 z-50">
      <div class="nav-container">
        <div class="nav-content">
          <div class="flex items-center">
            <a href="/" class="flex-shrink-0 flex items-center gap-2">
              <img
                src="images/LOGO.webp"
                alt="Tokita Logo"
                class="h-12 w-auto object-contain"
              />
            </a>
          </div>

          <div class="hidden md:flex items-center space-x-8">
            <a href="/" class="text-gray-700 hover:text-indigo-600 font-medium">
              Beranda
            </a>
            <a href="products.html" class="text-gray-700 hover:text-indigo-600 font-medium">
              Katalog
            </a>
            <a href="#promo" class="text-gray-700 hover:text-indigo-600 font-medium">
              Promo
            </a>
            <a href="#about" class="text-gray-700 hover:text-indigo-600 font-medium">
              Tentang Kami
            </a>
          </div>

          <div class="md:hidden flex items-center">
            <button
              id="mobile-menu-button"
              class="text-gray-700 p-2"
              aria-label="Toggle menu"
            >
              <svg
                id="mobile-menu-icon"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  id="menu-lines"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div id="mobile-menu" class="mobile-menu bg-white border-t">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a
            href="/"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 mobile-menu-link"
          >
            Beranda
          </a>
          <a
            href="products.html"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 mobile-menu-link"
          >
            Katalog
          </a>
          <a
            href="#promo"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 mobile-menu-link"
          >
            Promo
          </a>
          <a
            href="#about"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 mobile-menu-link"
          >
            Tentang Kami
          </a>
        </div>
      </div>
    </nav>
  `;

  // Mobile menu functionality
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuLines = document.getElementById('menu-lines');
  const menuIcon = document.getElementById('mobile-menu-icon');

  // Ensure mobile menu is hidden by default when component loads
  if (mobileMenu) {
    // Make sure it starts in hidden state
    mobileMenu.classList.remove('active');
  }

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', function() {
      // Only toggle on small screens (< 768px)
      if (window.innerWidth < 768) {
        mobileMenu.classList.toggle('active');

        // Change the menu icon based on state
        if (mobileMenu.classList.contains('active')) {
          // Change to close icon (X)
          menuLines.setAttribute('d', 'M6 18L18 6M6 6l12 12');
        } else {
          // Change back to menu icon (bars)
          menuLines.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
        }
      }
    });

    // Close menu when clicking on a mobile menu link
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', function() {
        // Only close menu on small screens
        if (window.innerWidth < 768) {
          mobileMenu.classList.remove('active');
          // Reset to menu icon (bars)
          menuLines.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
        }
      });
    });
  }

  // Handle route changes for SPA-like behavior (if needed)
  window.addEventListener('popstate', function() {
    if (mobileMenu) {
      // Always hide mobile menu on route change
      mobileMenu.classList.remove('active');
      // Reset to menu icon (bars)
      if (menuLines) {
        menuLines.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
      }
    }
  });

  // Handle window resize to properly manage menu state
  window.addEventListener('resize', function() {
    // On resize, if we're on desktop view, ensure mobile menu is closed
    if (window.innerWidth >= 768) {
      mobileMenu.classList.remove('active');
      // Reset to menu icon (bars)
      if (menuLines) {
        menuLines.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
      }
    }
  });
}