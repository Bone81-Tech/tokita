'use client';

import Link from 'next/link';
import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase'; // Import Supabase client

export default function DeveloperPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) {
        setError(authError.message);
      } else {
        setSuccess('Login berhasil! Anda akan dialihkan.');
        // Redirect will happen via auth listener in layout.tsx or similar
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error('Magic link error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Developer Login
            </h1>
            <p className="text-gray-600">Tokita Admin Dashboard</p>
          </div>

          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center">

              <p>{success}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Masukkan email Anda"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Kata Sandi
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Masukkan kata sandi Anda"
                />
              </div>

              <div className="text-right">
                <Link
                  href="/auth/reset-password"
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Lupa Kata Sandi?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Masuk...' : 'Login'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
