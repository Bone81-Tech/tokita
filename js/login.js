// js/login.js - Login functionality for Tokita Admin

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});

async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorMessageDiv = document.getElementById('error-message');
  const submitButton = event.target.querySelector('button[type="submit"]');

  // Clear previous errors
  errorMessageDiv.classList.add('hidden');
  errorMessageDiv.textContent = '';
  
  if (!email || !password) {
    errorMessageDiv.textContent = 'Email dan password wajib diisi.';
    errorMessageDiv.classList.remove('hidden');
    return;
  }
  
  // Disable button and show loading state
  submitButton.disabled = true;
  submitButton.textContent = 'Memproses...';

  try {
    await window.tokitaAPI.authAPI.login({ email, password });
    // On success, redirect to admin dashboard. The API client now throws on error,
    // so if we get here, it means the login was successful.
    window.location.href = 'admin.html';
  } catch (error) {
    console.error('Login error:', error);
    errorMessageDiv.textContent = error.message || 'Terjadi kesalahan saat login.';
    errorMessageDiv.classList.remove('hidden');
  } finally {
    // Re-enable button
    submitButton.disabled = false;
    submitButton.textContent = 'Sign in';
  }
}