// feedback-frontend/js/export_feedback.js
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const id = new URLSearchParams(window.location.search).get('id');
  if (!token || role!=='manager' || !id) {
    return window.location.href = '/login.html';
  }
  try {
    const res = await fetch('/api/feedback/manager', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const feedbacks = await res.json();
    const fb = feedbacks.find(f=>f.id==id);
    if (!fb) throw new Error('Not found');
    document.getElementById('employee-name').textContent = fb.employee_username;
    document.getElementById('strengths-text').textContent = fb.strengths;
    document.getElementById('areas-text').textContent = fb.areas_to_improve;
    document.getElementById('sentiment-text').textContent = fb.sentiment;
    document.getElementById('comment-text').textContent = fb.comment||'—';
    document.getElementById('timestamp-text').textContent = new Date(fb.timestamp).toLocaleString();
  } catch (err) {
    console.error('Load error:', err);
    alert('Failed to load feedback');
  }

  // Hook up export button
  const btn = document.getElementById('export-btn');
  if (btn) btn.addEventListener('click', exportPDF);
});

async function exportPDF(event) {
  event.preventDefault();
  const token = localStorage.getItem('token');
  const id = new URLSearchParams(window.location.search).get('id');
  if (!token) { alert('Not authenticated'); return; }

  try {
    const res = await fetch(`/api/feedback/export/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const { msg } = await res.json();
      throw new Error(msg||'Export failed');
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback_${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Export error:', err);
    alert(err.message);
  }
}

function logout() {
  localStorage.clear();
  window.location.href = '/login.html';
}
