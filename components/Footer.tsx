import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">TOKITA</h3>
            <p className="text-gray-400">
              Belanja hemat, hati senang. Lengkapi kebutuhan harianmu di Tokita.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Kategori</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Sembako
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Makanan
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Minuman
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Rumah Tangga
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Layanan</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Cara Belanja
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Promo
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Lokasi Toko
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Hubungi Kami
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Kontak</h4>
            <address className="not-italic text-gray-400">
              <p>Jl. Raya Tokita No. 88</p>
              <p>Jakarta, Indonesia</p>
              <p className="mt-2">cs@tokita.com</p>
              <p>WA: 0812-3456-7890</p>
            </address>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Tokita Market. All rights reserved.</p>
          <div className="mt-2">
            <Link
              href="/developer"
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              Developer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
