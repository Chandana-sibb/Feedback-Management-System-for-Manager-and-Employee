# Feedback-Management-System-for-Manager-and-Employee
A role-based internal feedback management system built with Flask. It supports employee and manager roles with secure JWT authentication, feedback submission, response workflows, notifications, PDF export, and sentiment tagging. Designed for streamlined internal communication and performance tracking.



## 🌐 Live Demo

🔗 [Live on Render](https://feedback-management-system-for-manager.onrender.com)

📂 [GitHub Repository](https://github.com/Chandana-sibb/Feedback-Management-System-for-Manager-and-Employee)

---

## 🚀 Tech Stack

### 🔧 Backend
- **Python 3.12**
- **Flask** (with Flask-JWT-Extended & SQLAlchemy)
- **SQLite** (Default DB - easy to swap with PostgreSQL)
- **xhtml2pdf** (PDF generation)
- **Gunicorn** (for production deployment)
- **Docker** (for containerization)
- **Render** (for hosting)

### 🎨 Frontend
- **HTML5**
- **CSS3**
- **Vanilla JavaScript**
- Responsive layout using **Flexbox** and **media queries**

---

## 📁 Project Structure

Feedback-Management-System-for-Manager-and-Employee/
├── feedback-backend/
│ ├── app/
│ │ ├── init.py
│ │ ├── auth.py
│ │ ├── models.py
│ │ └── routes.py
│ ├── config.py
│ ├── run.py
│ ├── requirements.txt
│ └── Dockerfile
├── feedback-frontend/
│ ├── index.html
│ ├── login.html
│ ├── register.html
│ ├── pages/
│ │ ├── dashboard_manager.html
│ │ ├── dashboard_employee.html
│ │ ├── submit_feedback.html
│ │ ├── edit_feedback.html
│ │ ├── request_feedback.html
│ │ ├── notifications.html
│ │ ├── view_requests.html
│ │ └── export_feedback.html
│ ├── js/
│ ├── components/
│ └── assets/



## ✅ Core Features

- 🔐 JWT-based authentication (secure login)
- 🧑‍💼 Role-based dashboards for Manager and Employee
- 📋 Submit, edit, and export feedback
- 🧾 Request feedback from specific managers
- 👻 Anonymous feedback option
- 📥 Notification system with unread tracking and marking as read
- 💬 Commenting and acknowledgment of feedback
- 📝 Export feedback reports as PDF
- 📦 Dockerized deployment

---

## 🛠️ Setup Instructions

### 🔧 Run Locally

1. **Clone the Repository**


git clone https://github.com/Chandana-sibb/Feedback-Management-System-for-Manager-and-Employee.git
cd Feedback-Management-System-for-Manager-and-Employee
Set up Virtual Environment


cd feedback-backend
python -m venv venv
venv\Scripts\activate  # On Windows
# OR
source venv/bin/activate  # On macOS/Linux
Install Dependencies


pip install -r requirements.txt
Run the Application


python run.py
App will start on: http://127.0.0.1:5000

🐳 Run with Docker

cd feedback-backend
docker build -t feedback-backend .
docker run -d -p 5000:5000 --name feedback-app feedback-backend
🚀 Deployment on Render
Push your code to GitHub

Go to https://render.com → Create new Web Service

Set the following:

Branch: main

Root Directory: feedback-backend

Build Command: pip install -r requirements.txt

Start Command: gunicorn run:app

Set the following Environment Variables:

SECRET_KEY=your-secret

JWT_SECRET_KEY=your-jwt-secret

(Optional) DATABASE_URL (for production DB)

🧠 Design Decisions
Factory Pattern in Flask: Keeps app modular and easy to extend.

JWT Authentication: Token-based, secure, and scalable.

Role-based Authorization: Employees and managers see different features/UI.

PDF Export: Useful for official documentation of feedback.

Docker: Simplifies deployment across environments.

Render Deployment: Chosen for its simplicity and GitHub integration.

🙋 Author
Sibbala Chandana

🌐 GitHub: @Chandana-sibb


