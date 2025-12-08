import ProductGrid from '@/components/ProductGrid';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function ProductsPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navigation />
      <div className="py-8">
        <ProductGrid />
      </div>
      <Footer />
    </div>
  );
}