// document.getElementById('commentForm').addEventListener('submit', async function (e) {
//   e.preventDefault();

//   const token = localStorage.getItem('token');
//   const feedbackId = document.getElementById('feedback_id').value;
//   const comment = document.getElementById('comment').value;
//   const messageElem = document.getElementById('comment-message');

//   if (!token) {
//     window.location.href = '/login';
//     return;
//   }

//   try {
//     const res = await fetch(`http://localhost:5000/api/feedback/comment/${feedbackId}`, {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ comment })
//     });

//     const data = await res.json();

//     if (res.ok) {
//       messageElem.style.color = 'green';
//       messageElem.textContent = 'Comment submitted successfully.';
//       document.getElementById('commentForm').reset();
//     } else {
//       messageElem.style.color = 'red';
//       messageElem.textContent = data.message || 'Failed to submit comment.';
//     }
//   } catch (err) {
//     messageElem.textContent = 'An error occurred.';
//   }
// });

// function logout() {
//   localStorage.clear();
//   window.location.href = '/login';
// }
