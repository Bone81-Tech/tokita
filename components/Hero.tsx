import Link from 'next/link';

export default function Hero() {
  return (
    <section id="hero" className="relative bg-indigo-700 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          alt="Supermarket background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-800 to-indigo-600 mix-blend-multiply"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg">
            Belanja Hemat di TOKITA
          </h1>
          <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Katalog lengkap kebutuhan harian Anda. Mulai dari sembako, makanan
            ringan, hingga kebutuhan rumah tangga.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="#products"
              className="bg-yellow-400 text-indigo-900 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-yellow-300 transition-transform transform hover:-translate-y-1"
            >
              Lihat Katalog
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
