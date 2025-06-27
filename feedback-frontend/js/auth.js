// feedback-frontend/js/auth.js
console.log("🔐 auth.js v1 loaded");

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    console.log("Found login button");
    loginBtn.addEventListener('click', async () => {
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();
      const errorBox = document.getElementById('login-error');
      errorBox.textContent = '';

      if (!username || !password) {
        errorBox.textContent = 'Please enter both username and password.';
        return;
      }

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) {
          errorBox.textContent = data.msg || 'Login failed.';
          return;
        }

        localStorage.setItem('token', data.access_token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('username', data.user.username);

        if (data.user.role === 'manager') {
          window.location.href = '/pages/dashboard_manager.html';
        } else {
          window.location.href = '/pages/dashboard_employee.html';
        }
      } catch (err) {
        console.error('Login error:', err);
        errorBox.textContent = 'Server error. Try again.';
      }
    });
  }

  const registerBtn = document.getElementById('register-btn');
  if (registerBtn) {
    console.log("Found register button");
    registerBtn.addEventListener('click', async () => {
      const username = document.getElementById('reg-username').value.trim();
      const password = document.getElementById('reg-password').value.trim();
      const role = document.getElementById('reg-role').value;
      const errorBox = document.getElementById('register-error');
      errorBox.textContent = '';

      if (!username || !password || !role) {
        errorBox.textContent = 'Please fill out all fields.';
        return;
      }

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, role })
        });
        const data = await res.json();
        if (!res.ok) {
          errorBox.textContent = data.msg || 'Registration failed.';
          return;
        }
        alert('Registration successful! Please log in.');
        window.location.href = '/login.html';
      } catch (err) {
        console.error('Register error:', err);
        errorBox.textContent = 'Server error. Try again.';
      }
    });
  }
});
