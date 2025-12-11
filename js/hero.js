// js/hero.js - Hero Component for Tokita

function loadHero() {
  const heroPlaceholder = document.getElementById('hero-placeholder');

  heroPlaceholder.innerHTML = `
    <section class="hero-section">
      <div class="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          alt="Supermarket background"
          class="w-full h-full object-cover opacity-20"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-indigo-800 to-indigo-600 mix-blend-multiply"></div>
      </div>
      <div class="hero-content">
        <div class="hero-text hero-fade-in">
          <h1 class="font-extrabold tracking-tight">
            Belanja Hemat di TOKITA
          </h1>
          <p class="text-indigo-100">
            Katalog lengkap kebutuhan harian Anda. Mulai dari sembako, makanan
            ringan, hingga kebutuhan rumah tangga.
          </p>
          <div class="hero-buttons">
            <a
              href="products.html"
              class="btn btn-primary btn-lg px-8 py-4 text-lg font-bold"
            >
              Lihat Katalog
            </a>
            <a
              href="#about"
              class="btn btn-outline btn-lg px-8 py-4 text-lg font-bold"
            >
              Pelajari Lebih
            </a>
          </div>
        </div>
      </div>
    </section>
  `;
}