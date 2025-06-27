// feedback-frontend/js/edit_feedback.js
console.log("🔄 edit_feedback.js v2 loaded");

document.addEventListener('DOMContentLoaded', async () => {
  const token      = localStorage.getItem('token');
  const role       = localStorage.getItem('role');
  const params     = new URLSearchParams(window.location.search);
  const feedbackId = params.get('id');

  if (!token || role !== 'manager' || !feedbackId) {
    return window.location.href = '/login.html';
  }

  // Pre-fill form
  try {
    const loadRes = await fetch('/api/feedback/manager', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!loadRes.ok) {
      const msg = await loadRes.text();
      throw new Error(msg || loadRes.status);
    }
    const feedbacks = await loadRes.json();
    const fb = feedbacks.find(f => f.id == feedbackId);
    if (!fb) throw new Error('Feedback not found');

    document.getElementById('employee-name').value  = fb.employee_username;
    document.getElementById('edit-strengths').value = fb.strengths;
    document.getElementById('edit-areas').value     = fb.areas_to_improve;
    document.getElementById('edit-sentiment').value = fb.sentiment;
  } catch (err) {
    console.error("Error loading feedback:", err);
    return alert("Failed to load feedback: " + err.message);
  }

  // Handle form submit
  const form = document.getElementById('edit-form');
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const body = {
      strengths:        document.getElementById('edit-strengths').value.trim(),
      areas_to_improve: document.getElementById('edit-areas').value.trim(),
      sentiment:        document.getElementById('edit-sentiment').value
    };

    try {
      const updateRes = await fetch(`/api/feedback/edit/${feedbackId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!updateRes.ok) {
        const contentType = updateRes.headers.get('content-type') || '';
        let errMsg = '';
        if (contentType.includes('application/json')) {
          const errBody = await updateRes.json();
          errMsg = errBody.msg || `${updateRes.status}`;
        } else {
          errMsg = await updateRes.text();
        }
        throw new Error(errMsg);
      }

      document.getElementById('edit-msg').style.display = 'block';
    } catch (err) {
      console.error("Error updating feedback:", err);
      alert("Update failed: " + err.message);
    }
  });
});

// Logout helper
function logout() {
  localStorage.clear();
  window.location.href = '/login.html';
}
