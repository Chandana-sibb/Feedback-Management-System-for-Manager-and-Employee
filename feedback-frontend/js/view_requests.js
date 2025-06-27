document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'manager') {
    return window.location.href = '/login.html';
  }

  let allRequests = [];

  const loadRequests = async () => {
    try {
      const res = await fetch('/api/feedback/view-requests', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.msg || 'Failed to fetch requests');
      }

      allRequests = await res.json();
      renderRequests('all');

    } catch (err) {
      console.error('Error loading requests:', err.message);
      alert('Error loading requests.');
    }
  };

  const renderRequests = (filterStatus) => {
    const tbody = document.querySelector('#requests-table tbody');
    tbody.innerHTML = '';

    const filtered = filterStatus === 'all'
      ? allRequests
      : allRequests.filter(r => r.status.toLowerCase() === filterStatus);

    if (filtered.length === 0) {
      document.getElementById('no-requests').style.display = 'block';
      return;
    } else {
      document.getElementById('no-requests').style.display = 'none';
    }

    filtered.forEach(r => {
  const row = document.createElement('tr');
  row.innerHTML = `
  <td>${r.id}</td>
  <td>${r.employee_name}</td>
  <td>${r.status}</td>
  <td>${new Date(r.timestamp).toLocaleString()}</td>
  <td>
    ${r.status === 'pending' ? `
      <button class="btn btn-sm btn-primary" onclick="respondToRequest(${r.id})">
        Respond
      </button>` : '<span class="text-muted">Handled</span>'}
  </td>
`;

  tbody.appendChild(row);
});

  };

  // Event listener for filter
  document.getElementById('status-filter').addEventListener('change', e => {
    renderRequests(e.target.value);
  });

  // Expose respond function globally
  window.respondToRequest = function(requestId) {
  window.location.href = `/submit_feedback.html?request_id=${requestId}`;
};

  // Initial load
  loadRequests();
});
