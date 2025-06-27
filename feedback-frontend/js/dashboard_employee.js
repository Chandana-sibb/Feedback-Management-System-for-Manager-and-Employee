console.log("🔄 dashboard_employee.js loaded");

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  if (!token) {
    return window.location.href = '/login.html';
  }

  document.getElementById('employee-name').textContent = username;

  try {
    console.log("Fetching employee dashboard feedback…");
    const res = await fetch('/api/feedback/employee', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Response status:", res.status);
    if (!res.ok) {
      const text = await res.text();
      console.error("Error body:", text);
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    console.log("Raw response data:", data);

    // Ensure data is an array
    const feedbacks = Array.isArray(data) ? data : [data];
    console.log("Normalized feedbacks array:", feedbacks);

    const timeline = document.getElementById('feedback-timeline');
    timeline.innerHTML = '';

    feedbacks.forEach(fb => {
      console.log("Feedback entry:", fb);
      const card = document.createElement('div');
      card.className = `card feedback-card ${fb.sentiment || 'neutral'}`;
      card.innerHTML = `
  <div class="card-body">
    <h5 class="card-title">From: ${fb.manager_username || 'Manager'}</h5>
    <p><strong>Strengths:</strong> ${fb.strengths || '-'}</p>
    <p><strong>Areas to Improve:</strong> ${fb.areas_to_improve || '-'}</p>
    <p class="feedback-timestamp">${new Date(fb.timestamp).toLocaleString()}</p>
    <p><strong>Sentiment:</strong> ${fb.sentiment || 'neutral'}</p>
    ${
      !fb.acknowledged
        ? `<button class="btn btn-sm btn-success" onclick="acknowledge(${fb.id})">Acknowledge</button>`
        : `<span class="badge badge-success">Acknowledged</span>`
    }

    <!-- ✅ Add Export PDF button -->
    <button class="btn btn-sm btn-outline-secondary mt-1" onclick="exportFeedback(${fb.id})">
      Export PDF
    </button>

    <div class="feedback-comment-box mt-2">
      <textarea class="form-control" id="comment-${fb.id}" rows="2"
        placeholder="Leave a comment...">${fb.comment || ''}</textarea>
      <button class="btn btn-sm btn-outline-primary mt-1" onclick="submitComment(${fb.id})">
        Save Comment
      </button>
    </div>
  </div>
`;

      timeline.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading feedback:', err);
    alert('Could not load feedback: ' + err.message);
  }
});

function acknowledge(id) {
  const token = localStorage.getItem('token');
  fetch(`/api/feedback/acknowledge/${id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(() => location.reload())
    .catch(err => {
      console.error('Acknowledge error:', err);
      alert('Could not acknowledge.');
    });
}

function submitComment(id) {
  const token = localStorage.getItem('token');
  const textarea = document.getElementById(`comment-${id}`);
  const comment = textarea.value.trim();

  if (!comment) {
    alert("Comment cannot be empty.");
    return;
  }

  fetch(`/api/feedback/comment/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ comment })
  })
    .then(async res => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error ${res.status}`);
      }
      alert('Comment saved');
      textarea.value = '';  // ✅ Clear comment box after saving
    })
    .catch(err => {
      console.error('Comment error:', err);
      alert('Error saving comment: ' + err.message);
    });
}

function exportFeedback(id) {
  const token = localStorage.getItem('token');

  fetch(`/api/feedback/export/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(async res => {
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.msg || 'Export failed');
      }
      return res.blob();
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feedback_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    })
    .catch(err => {
      console.error('Export error:', err);
      alert('Failed to export feedback: ' + err.message);
    });
}



function logout() {
  localStorage.clear();
  window.location.href = '/login.html';
}
