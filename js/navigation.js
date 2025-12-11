// js/navigation.js - Navigation Component for Tokita

// Create navigation component
function loadNavigation() {
  // Check if we're on the admin page by looking at the current URL
  const isAdminPage = window.location.pathname.includes('admin.html');

  let adminLogoutButton = '';
  if (isAdminPage) {
    adminLogoutButton = `
      <button id="logout-btn" class="md:ml-4 btn btn-outline">
        Logout
      </button>
    `;
  }

  const navPlaceholder = document.getElementById('navigation-placeholder');

  navPlaceholder.innerHTML = `
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-content">
          <a href="/" class="navbar-brand gap-2">
            <img
              src="images/LOGO.webp"
              alt="Tokita Logo"
              class="h-12 w-auto object-contain"
            />
            <span class="hidden md:block">Tokita</span>
          </a>

          <div class="hidden md:flex items-center">
            <div class="navbar-nav">
              <a href="/" class="navbar-link">Beranda</a>
              <a href="products.html" class="navbar-link">Katalog</a>
              <a href="#promo" class="navbar-link">Promo</a>
              <a href="#about" class="navbar-link">Tentang Kami</a>
            </div>

            ${adminLogoutButton}
          </div>

          <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div class="navbar-menu" id="navbar-menu">
        <a href="/" class="navbar-link">Beranda</a>
        <a href="products.html" class="navbar-link">Katalog</a>
        <a href="#promo" class="navbar-link">Promo</a>
        <a href="#about" class="navbar-link">Tentang Kami</a>

        ${adminLogoutButton.replace('md:ml-4', '').replace('btn-outline', 'btn-outline block w-full text-left')}
      </div>
    </nav>
  `;

  // Mobile menu functionality
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const navbarMenu = document.getElementById('navbar-menu');

  if (mobileMenuToggle && navbarMenu) {
    mobileMenuToggle.addEventListener('click', function() {
      navbarMenu.classList.toggle('active');
      // Toggle hamburger animation
      mobileMenuToggle.classList.toggle('active');
    });

    // Close menu when clicking on a mobile menu link
    const mobileMenuLinks = document.querySelectorAll('.navbar-menu .navbar-link');
    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', function() {
        navbarMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
      });
    });

    // Close menu when clicking outside of it
    document.addEventListener('click', function(event) {
      if (!navbarMenu.contains(event.target) && !mobileMenuToggle.contains(event.target) && navbarMenu.classList.contains('active')) {
        navbarMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
      }
    });
  }

  // Add logout functionality if on admin page
  if (isAdminPage) {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async function() {
        try {
          await window.tokitaAPI.authAPI.logout();
          // On successful logout, redirect to the home page.
          window.location.href = 'index.html';
        } catch (error) {
          console.error('Logout failed:', error);
          alert(`Gagal logout: ${error.message}`);
        }
      });
    }
  }

  // Add scroll effect to navbar
  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}