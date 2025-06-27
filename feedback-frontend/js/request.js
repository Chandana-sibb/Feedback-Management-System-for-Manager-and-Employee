document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'employee') {
    return window.location.href = '/login.html';
  }

  const managerSelect = document.getElementById('manager-select');
  const requestMsg = document.getElementById('request-msg');

  // Fetch and populate managers
  try {
    const res = await fetch('/api/feedback/managers', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to fetch managers');
    const managers = await res.json();

    managerSelect.innerHTML = '<option value="">Select a manager</option>';
    managers.forEach(manager => {
      const opt = document.createElement('option');
      opt.value = manager.id;
      opt.textContent = manager.username;
      managerSelect.appendChild(opt);
    });
  } catch (err) {
    console.error('Error fetching managers:', err);
    alert('Unable to load managers. Please try again later.');
  }

  // Submit request
  document.getElementById('request-form').addEventListener('submit', async e => {
    e.preventDefault();

    const managerId = managerSelect.value;
    const reason = document.getElementById('reason').value.trim();
    const tags = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
                      .map(cb => cb.value);

    if (!managerId) {
      alert('Please select a manager.');
      return;
    }

    if (!reason) {
      alert('Please enter a reason.');
      return;
    }

    const payload = {
      reason,
      tags,
      manager_id: parseInt(managerId)
    };

    try {
      const res = await fetch('/api/feedback/request-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(errMsg);
      }

      requestMsg.style.display = 'block';
      e.target.reset();
      managerSelect.selectedIndex = 0;
    } catch (err) {
      console.error('Request error:', err);
      alert('Failed to send request. Please try again.');
    }
  });
});

function logout() {
  localStorage.clear();
  window.location.href = '/login.html';
}
