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
  
  if (!email || !password) {
    alert('Email dan password wajib diisi');
    return;
  }
  
  try {
    // Attempt to login
    const result = await window.tokitaAPI.authAPI.login({ email, password });
    
    if (result.status === 'success') {
      alert('Login berhasil');
      // Redirect to admin dashboard
      window.location.href = 'admin.html';
    } else {
      alert('Login gagal: ' + result.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Login gagal: ' + error.message);
  }
}