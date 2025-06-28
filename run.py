import os
from flask import  send_from_directory
from flask_cors import CORS
from app import create_app


app = create_app()
CORS(app)  # Enable CORS for frontend-backend communication

# Path to the frontend folder
FRONTEND_FOLDER = os.path.join(os.path.dirname(__file__), 'feedback-frontend')

# Serve index.html
@app.route('/')
def index():
    return send_from_directory(FRONTEND_FOLDER, 'index.html')

@app.route('/login')
def login_page():
    return send_from_directory(FRONTEND_FOLDER, 'login.html')


# Forward specific top-level HTML page routes to pages/
PAGE_FILES = [
    'dashboard_manager.html',
    'dashboard_employee.html',
    'submit_feedback.html',
    'edit_feedback.html',
    'request_feedback.html',
    'notifications.html',
    'export_feedback.html',
    'view_requests.html'
]

for page in PAGE_FILES:
    app.add_url_rule(
        f'/{page}',
        endpoint=page,
        view_func=(lambda p: lambda: send_from_directory(
            os.path.join(FRONTEND_FOLDER, 'pages'), p
        ))(page)
    )



if __name__ == '__main__':
    
    app.run(host='0.0.0.0', port=5000, debug=True)


