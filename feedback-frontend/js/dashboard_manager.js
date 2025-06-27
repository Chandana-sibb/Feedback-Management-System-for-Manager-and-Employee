// feedback-frontend/js/dashboard_manager.js
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  if (localStorage.getItem('role') !== 'manager') {
  alert('Access denied. Only managers can access this page.');
  return window.location.href = '/login.html';
}

  document.getElementById('manager-name').textContent = username;

  try {
    console.log('Fetching manager feedback');
    const res = await fetch('/api/feedback/manager', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Status:', res.status);
    const feedbacks = await res.json();
    console.log('Data:', feedbacks);

    document.getElementById('feedback-count').textContent = feedbacks.length;
    document.getElementById('positive-count').textContent = feedbacks.filter(f => f.sentiment==='positive').length;
    document.getElementById('pending-ack-count').textContent = feedbacks.filter(f=>!f.acknowledged).length;

    const tbody = document.getElementById('feedback-table-body');
    tbody.innerHTML = '';
    feedbacks.forEach(fb => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${fb.employee_username}</td>
        <td>${fb.strengths}</td>
        <td>${fb.areas_to_improve}</td>
        <td>${fb.sentiment}</td>
        <td>${fb.acknowledged?'Yes':'No'}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="editFeedback(${fb.id})">Edit</button>
          <button class="btn btn-sm btn-outline-primary" onclick="downloadPDF(${fb.id})">Export</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error('Error fetching manager feedback:', err);
    alert('Could not load dashboard.');
  }
});

function editFeedback(id) {
  window.location.href = `/pages/edit_feedback.html?id=${id}`;
}

function downloadPDF(id) {
  window.location.href = `/pages/export_feedback.html?id=${id}`;
}

function logout() {
  localStorage.clear();
  window.location.href = '/login.html';
}
