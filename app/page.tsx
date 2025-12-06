import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="bg-gray-50">
      <Navigation />
      <Hero />
      <ProductGrid />
      
      {/* About Section */}
      <section id="about" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Tentang TOKITA
              </h2>
              <p className="text-gray-600 mb-4">
                TOKITA adalah koperasi karyawan Universitas Hangtuah Surabaya.
                Kami menyediakan berbagai macam produk sembako, makanan ringan,
                dan kebutuhan rumah tangga dengan harga terbaik.
              </p>
              <p className="text-gray-600">
                Komitmen kami adalah memberikan pengalaman belanja yang hemat,
                lengkap, dan mudah bagi setiap pelanggan.
              </p>
            </div>
            <div className="md:w-1/2 flex flex-col items-center space-y-4">
              <img
                src="/images/gambar-depan-kecil.webp"
                alt="Toko Tokita"
                className="rounded-xl shadow-lg w-full max-w-md object-cover h-64 md:h-80"
              />
              <img
                src="/images/gambar-rak-kiri-oke.webp"
                alt="Rak Produk Kiri Tokita"
                className="rounded-xl shadow-lg w-full max-w-md object-cover h-64 md:h-80"
              />
              <img
                src="/images/gambar-rak-kanan-oke.webp"
                alt="Rak Produk Kanan Tokita"
                className="rounded-xl shadow-lg w-full max-w-md object-cover h-64 md:h-80"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
