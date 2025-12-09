'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    // Supabase JS v2 automatically handles the session from the URL fragment.
    // We listen for the SIGNED_IN event to confirm the token is processed.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // This event fires when Supabase has processed the token from the URL.
        // The user is now in a temporary authenticated state allowing a password update.
        setIsTokenValid(true);
      }
    });

    // On initial load, Supabase client checks the URL. If the user is immediately
    // signed in, we can also set the token as valid.
    const checkInitialSession = async () => {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
            setIsTokenValid(true);
        }
    };
    checkInitialSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal harus 6 karakter.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess('Password Anda berhasil diperbarui. Anda akan dialihkan ke halaman login.');
        // Sign out the user from the temporary session
        await supabase.auth.signOut();
        setTimeout(() => {
          router.push('/developer');
        }, 3000);
      }
    } catch (err) {
      setError('Terjadi kesalahan yang tidak terduga. Silakan coba lagi.');
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Berhasil!</h1>
                <p className="text-green-600">{success}</p>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Atur Password Baru
            </h1>
            <p className="text-gray-600">Masukkan password baru Anda.</p>
          </div>

          {isTokenValid ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password Baru
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Masukkan password baru"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Konfirmasi Password Baru
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Konfirmasi password baru"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
              </button>
            </form>
          ) : (
            <div className="text-center text-gray-600">
                <p>Memvalidasi link... Jika halaman tidak berubah, link reset password Anda mungkin tidak valid atau sudah kedaluwarsa.</p>
                <p className="mt-4">Silakan kembali ke <Link href="/developer" className="text-indigo-600 hover:underline">halaman login</Link> dan coba minta link baru.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
