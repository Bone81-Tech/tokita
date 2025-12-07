'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { productAPI } from '@/lib/api';
import type { Product } from '@/types';

const CATEGORIES = [
  { id: 'all', label: 'Semua' },
  { id: 'sembako', label: 'Sembako' },
  { id: 'makanan', label: 'Makanan Instan' },
  { id: 'minuman', label: 'Minuman' },
  { id: 'rumahtangga', label: 'Rumah Tangga' },
];

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products when category changes
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((p) => p.category === selectedCategory)
      );
    }
  }, [selectedCategory, products]);

  async function fetchProducts() {
    setLoading(true);
    setError(null);
    
    try {
      const data = await productAPI.getAll();
      const validProducts = data.filter(
        (p) =>
          p.id &&
          !String(p.name).includes('Nama Produk')
      );

      setProducts(validProducts);
      setFilteredProducts(validProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleCategoryChange(categoryId: string) {
    setSelectedCategory(categoryId);
  }

  if (loading) {
    return (
      <div className="col-span-full text-center py-20">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-2 text-gray-500">Memuat produk...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-full text-center py-10 text-red-500">
        Gagal memuat produk. Silakan coba lagi nanti.
      </div>
    );
  }

  return (
    <section id="products" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Katalog Produk
          </h2>
          <div className="w-20 h-1 bg-indigo-600 mx-auto rounded-full mb-4"></div>

          {/* Product Categories */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-500">
              Belum ada produk untuk kategori ini.
            </div>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
