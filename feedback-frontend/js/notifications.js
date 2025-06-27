let allNotifications = [];

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) return window.location.href = '/login.html';

  try {
    const res = await fetch('/api/feedback/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    allNotifications = await res.json();
    console.log("Notifications:", allNotifications);

    document.getElementById('unread-count').textContent = allNotifications.filter(n => !n.is_read).length;
    render('unread');

    document.getElementById('tab-unread').addEventListener('click', () => render('unread'));
    document.getElementById('tab-all').addEventListener('click', () => render('all'));
  } catch (err) {
    console.error('Notifications error:', err);
    alert('Could not load notifications');
  }
});

function render(type) {
  document.getElementById('tab-unread').classList.toggle('active', type === 'unread');
  document.getElementById('tab-all').classList.toggle('active', type === 'all');
  const list = document.getElementById('notification-list');
  list.innerHTML = '';

  const items = type === 'all' ? allNotifications : allNotifications.filter(n => !n.is_read);
  if (!items.length) return list.innerHTML = '<p>No notifications</p>';

  items.forEach(n => {
    const card = document.createElement('div');
    card.className = `notification-card ${n.is_read ? 'read' : ''}`;
    card.innerHTML = `
      <p>${n.message}</p>
      <small class="timestamp">${new Date(n.timestamp).toLocaleString()}</small>
      ${!n.is_read ? `<button onclick="markAsRead(${n.id})" class="btn btn-sm btn-outline-primary mt-1">Mark as Read</button>` : ''}
    `;
    list.appendChild(card);
  });
}

function markAsRead(id) {
  const token = localStorage.getItem('token');
  fetch(`/api/feedback/notifications/${id}/read`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(async res => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      const notif = allNotifications.find(n => n.id === id);
      if (notif) notif.is_read = true;
      document.getElementById('unread-count').textContent = allNotifications.filter(n => !n.is_read).length;
      render('unread');
    })
    .catch(err => {
      console.error(err);
      alert('Could not mark as read');
    });
}

function logout() {
  localStorage.clear();
  window.location.href = '/login.html';
}
