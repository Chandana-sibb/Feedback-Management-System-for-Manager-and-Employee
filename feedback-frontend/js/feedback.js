document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const urlParams = new URLSearchParams(window.location.search);
  const requestId = urlParams.get('request_id');

  if (!token || role !== 'manager') {
    return window.location.href = '/login.html';
  }

  try {
    if (requestId) {
      // Responding to feedback request
      const reqRes = await fetch(`/api/feedback/requests/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!reqRes.ok) throw new Error("Failed to load feedback request");

      const reqData = await reqRes.json();

      document.getElementById('employee-select-group').style.display = 'none';
      document.getElementById('employee-select').removeAttribute('required'); // ✅ prevent form error
      document.getElementById('employee-readonly-group').style.display = 'block';

      document.getElementById('employee-readonly').value = reqData.employee_name;
      document.getElementById('employee-id').value = reqData.employee_id;
    } else {
      // Normal feedback flow
      const res = await fetch('/api/feedback/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Failed to load employee list");

      const employees = await res.json();
      const select = document.getElementById('employee-select');

      if (!select) return;

      select.setAttribute('required', true); // ✅ required only when visible
      select.innerHTML = '<option value="">Select employee</option>';

      employees.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.id;
        option.textContent = emp.username;
        select.appendChild(option);
      });
    }
  } catch (err) {
    console.error('Error loading employee list or request:', err);
    alert('Could not load employee or request details.');
  }

  // Submit feedback
  document.getElementById('feedback-form').addEventListener('submit', async e => {
    e.preventDefault();

    const employeeId = requestId
      ? document.getElementById('employee-id').value
      : document.getElementById('employee-select').value;

    if (!employeeId) return alert('Please select an employee');

    const body = {
      employee_id: parseInt(employeeId),
      strengths: document.getElementById('strengths').value,
      areas_to_improve: document.getElementById('areas').value,
      sentiment: document.getElementById('sentiment').value,
      comment: document.getElementById('comment').value,
      anonymous: document.getElementById('anonymous').checked,
      request_id: requestId ? parseInt(requestId) : null
    };

    try {
      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error("Feedback submission failed");

      alert('Feedback submitted successfully');
      window.location.href = '/pages/dashboard_manager.html';

    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('Error submitting feedback');
    }
  });
});
