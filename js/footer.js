// js/footer.js - Footer Component for Tokita

function loadFooter() {
  const footerPlaceholder = document.getElementById('footer-placeholder');

  footerPlaceholder.innerHTML = `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-grid">
          <div class="footer-brand">
            <h3>TOKITA</h3>
            <p>
              Belanja hemat, hati senang. Lengkapi kebutuhan harianmu di Tokita.
            </p>
          </div>
          <div class="footer-column">
            <h4>Kategori</h4>
            <ul class="footer-links">
              <li>
                <a href="#">
                  Sembako
                </a>
              </li>
              <li>
                <a href="#">
                  Makanan
                </a>
              </li>
              <li>
                <a href="#">
                  Minuman
                </a>
              </li>
              <li>
                <a href="#">
                  Rumah Tangga
                </a>
              </li>
            </ul>
          </div>
          <div class="footer-column">
            <h4>Layanan</h4>
            <ul class="footer-links">
              <li>
                <a href="#">
                  Cara Belanja
                </a>
              </li>
              <li>
                <a href="#">
                  Promo
                </a>
              </li>
              <li>
                <a href="#">
                  Lokasi Toko
                </a>
              </li>
              <li>
                <a href="#">
                  Hubungi Kami
                </a>
              </li>
            </ul>
          </div>
          <div class="footer-column">
            <h4>Kontak</h4>
            <address class="footer-contact">
              <p>Jl. Arif Rahman Hakim no. 150 Surabaya</p>
            </address>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 Tokita Market. All rights reserved.</p>
          <div class="mt-2">
            <a
              href="login.html"
            >
              Admin
            </a>
          </div>
          <div class="mt-1">
            <a
              href="https://bonedigitalservice.web.id"
              target="_blank"
              rel="noopener noreferrer"
            >
              Developed by Bone Digital Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  `;
}