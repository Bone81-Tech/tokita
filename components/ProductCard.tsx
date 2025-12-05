import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.image || 'https://placehold.co/400x300?text=No+Image';
  const displayPrice = typeof product.price === 'number'
    ? `Rp ${product.price.toLocaleString('id-ID')}`
    : product.price;
  const promoPrice = product.promo_price
    ? typeof product.promo_price === 'number'
      ? `Rp ${product.promo_price.toLocaleString('id-ID')}`
      : product.promo_price
    : null;

  return (
    <div className="product-card bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = 'https://placehold.co/400x300?text=Produk+Tokita';
          }}
        />
        {product.rating && (
          <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 text-sm font-semibold text-indigo-600">
            {product.rating} ★
          </div>
        )}
        {promoPrice && (
          <div className="absolute top-2 left-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold">
            PROMO
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex flex-col h-full justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {product.name || 'Nama Produk'}
            </h3>
            <p className="mt-1 text-gray-600 text-sm line-clamp-2">
              {product.description || ''}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex flex-col">
              {promoPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {displayPrice}
                </span>
              )}
              <span className="text-lg font-bold text-indigo-600">
                {promoPrice || displayPrice}
              </span>
            </div>
            <button
              className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
              aria-label="Add to cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005.92 1H3z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
