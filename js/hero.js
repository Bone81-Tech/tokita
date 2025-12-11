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
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg">
            Belanja Hemat di TOKITA
          </h1>
          <p class="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Katalog lengkap kebutuhan harian Anda. Mulai dari sembako, makanan
            ringan, hingga kebutuhan rumah tangga.
          </p>
          <div class="flex justify-center gap-4">
            <div class="bg-yellow-400 p-2 rounded-full transition-all duration-300 hover:shadow-yellow-300 hover:shadow-2xl">
              <a
                href="products.html"
                class="bg-white text-indigo-900 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-yellow-100 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 hover:shadow-xl"
              >
                Lihat Katalog
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}