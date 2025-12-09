// js/footer.js - Footer Component for Tokita

function loadFooter() {
  const footerPlaceholder = document.getElementById('footer-placeholder');
  
  footerPlaceholder.innerHTML = `
    <footer class="bg-gray-900 text-white py-12">
      <div class="footer-container">
        <div class="footer-grid">
          <div>
            <h3 class="text-xl font-bold mb-4">TOKITA</h3>
            <p class="text-gray-400">
              Belanja hemat, hati senang. Lengkapi kebutuhan harianmu di Tokita.
            </p>
          </div>
          <div>
            <h4 class="text-lg font-semibold mb-4">Kategori</h4>
            <ul class="space-y-2">
              <li>
                <a href="#" class="text-gray-400 hover:text-white">
                  Sembako
                </a>
              </li>
              <li>
                <a href="#" class="text-gray-400 hover:text-white">
                  Makanan
                </a>
              </li>
              <li>
                <a href="#" class="text-gray-400 hover:text-white">
                  Minuman
                </a>
              </li>
              <li>
                <a href="#" class="text-gray-400 hover:text-white">
                  Rumah Tangga
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 class="text-lg font-semibold mb-4">Layanan</h4>
            <ul class="space-y-2">
              <li>
                <a href="#" class="text-gray-400 hover:text-white">
                  Cara Belanja
                </a>
              </li>
              <li>
                <a href="#" class="text-gray-400 hover:text-white">
                  Promo
                </a>
              </li>
              <li>
                <a href="#" class="text-gray-400 hover:text-white">
                  Lokasi Toko
                </a>
              </li>
              <li>
                <a href="#" class="text-gray-400 hover:text-white">
                  Hubungi Kami
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 class="text-lg font-semibold mb-4">Kontak</h4>
            <address class="not-italic text-gray-400">
              <p>Jl. Arif Rahman Hakim no. 150 Surabaya</p>
            </address>
          </div>
        </div>
        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Tokita Market. All rights reserved.</p>
          <div class="mt-2">
            <a
              href="login.html"
              class="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              Admin
            </a>
          </div>
          <div class="mt-1">
            <a
              href="https://bonedigitalservice.web.id"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              Developed by Bone Digital Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  `;
}