'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { tokenManager } from '@/lib/auth';
import { productAPI, imagekitAPI } from '@/lib/api';
import type { Product } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  const [formData, setFormData] = useState<Partial<Product>>({
    id: '',
    name: '',
    description: '',
    price: 0,
    promo_price: 0,
    category: 'sembako',
    image: '',
    rating: '5.0',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const isValid = await tokenManager.isValid();
    if (!isValid) {
      router.push('/developer');
      return;
    }
    fetchProducts();
  }

  async function fetchProducts() {
    setLoading(true);
    try {
      const data = await productAPI.getAll();
      setProducts(data.filter(p => p.id && !String(p.name).includes('Nama Produk')));
    } catch (error) {
      showNotification('Gagal memuat produk', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function openModal(mode: 'create' | 'edit', product?: Product) {
    setModalMode(mode);
    if (mode === 'edit' && product) {
      setFormData({ ...product });
    } else {
      setFormData({
        id: '',
        name: '',
        description: '',
        price: 0,
        promo_price: 0,
        category: 'sembako',
        image: '',
        rating: '5.0',
      });
    }
    setIsModalOpen(true);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await imagekitAPI.upload(file);
      setFormData({ ...formData, image: result.url });
      showNotification('Upload berhasil!', 'success');
    } catch (error) {
      showNotification('Upload gagal: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.category) {
      alert('Nama dan Kategori wajib diisi!');
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        await productAPI.create(formData);
      } else {
        await productAPI.update(formData as Product);
      }
      showNotification('Produk berhasil disimpan', 'success');
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      showNotification('Gagal menyimpan: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Hapus produk "${product.name}"?`)) return;

    try {
      await productAPI.delete(product.id);
      showNotification('Produk berhasil dihapus', 'success');
      fetchProducts();
    } catch (error) {
      showNotification('Gagal menghapus: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
    }
  }

  function handleLogout() {
    tokenManager.remove();
    router.push('/developer');
  }

  function showNotification(message: string, type: 'success' | 'error') {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Navigation */}
      <nav className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="font-bold text-xl">Tokita Developer</div>
            <div className="flex items-center gap-4">
              <a href="/" target="_blank" className="hover:text-indigo-200 text-sm">
                Lihat Website
              </a>
              <button
                onClick={handleLogout}
                className="bg-indigo-800 hover:bg-indigo-900 px-3 py-1 rounded text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header & Action */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Daftar Produk</h1>
          <button
            onClick={() => openModal('create')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Tambah Produk
          </button>
        </div>

        {/* Notification */}
        {notification.show && (
          <div
            className={`border px-4 py-3 rounded relative mb-4 ${
              notification.type === 'success'
                ? 'bg-green-100 text-green-700 border-green-400'
                : 'bg-red-100 text-red-700 border-red-400'
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Product Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Memuat data produk...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={product.image || 'https://placehold.co/100'}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 truncate w-48">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Rp {parseInt(String(product.price || 0)).toLocaleString('id-ID')}</div>
                      {product.promo_price && (
                        <div className="text-xs text-red-500">
                          Promo: Rp {parseInt(String(product.promo_price || 0)).toLocaleString('id-ID')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal('edit', product)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setIsModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {modalMode === 'create' ? 'Tambah Produk' : 'Edit Produk'}
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={2}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Harga</label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Harga Promo</label>
                        <input
                          type="number"
                          value={formData.promo_price}
                          onChange={(e) => setFormData({ ...formData, promo_price: Number(e.target.value) })}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Kategori</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                      >
                        <option value="sembako">Sembako</option>
                        <option value="makanan">Makanan Instan</option>
                        <option value="minuman">Minuman</option>
                        <option value="rumahtangga">Rumah Tangga</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gambar Produk</label>
                      <input
                        type="text"
                        value={formData.image}
                        readOnly
                        placeholder="URL Gambar (Otomatis terisi setelah upload)"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-50 text-gray-500"
                      />
                      <div className="mt-2">
                        <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                          <span>{uploading ? 'Mengupload...' : 'Upload File'}</span>
                          <input
                            type="file"
                            onChange={handleFileUpload}
                            accept="image/*"
                            disabled={uploading}
                            className="sr-only"
                          />
                        </label>
                      </div>
                      {formData.image && (
                        <div className="mt-4">
                          <p className="text-xs font-medium text-gray-700 mb-1">Preview:</p>
                          <img src={formData.image} className="h-32 w-auto rounded-lg shadow-sm object-cover border" alt="Preview" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={submitting || uploading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
