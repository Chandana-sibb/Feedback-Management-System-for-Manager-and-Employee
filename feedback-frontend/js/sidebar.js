// feedback-frontend/js/sidebar.js
async function loadSidebar() {
  const container = document.getElementById('sidebar-container');
  if (!container) return;

  try {
    const res = await fetch('/components/sidebar.html');
    const html = await res.text();
    container.innerHTML = html;

    const role = localStorage.getItem('role');
    if (role !== 'manager') {
      document.querySelectorAll('.role-manager').forEach(el => el.style.display = 'none');
    }
    if (role !== 'employee') {
      document.querySelectorAll('.role-employee').forEach(el => el.style.display = 'none');
    }
  } catch (err) {
    console.error('Failed to load sidebar:', err);
  }
}

function logout() {
  localStorage.clear();
  window.location.href = '/login.html';
}
document.addEventListener('DOMContentLoaded', loadSidebar);
