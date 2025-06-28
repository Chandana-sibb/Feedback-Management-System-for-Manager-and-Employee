import os
from flask import  send_from_directory
from flask_cors import CORS
from app import create_app
import webbrowser

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

# Serve HTML pages from pages/
@app.route('/pages/<path:filename>')
def serve_pages(filename):
    return send_from_directory(os.path.join(FRONTEND_FOLDER, 'pages'), filename)

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

# Serve other static files: login, register, index, etc.
@app.route('/<path:filename>')
def serve_static_files(filename):
    return send_from_directory(FRONTEND_FOLDER, filename)

# Serve frontend assets: JS, components, assets
@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory(os.path.join(FRONTEND_FOLDER, 'js'), filename)

@app.route('/components/<path:filename>')
def serve_components(filename):
    return send_from_directory(os.path.join(FRONTEND_FOLDER, 'components'), filename)

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory(os.path.join(FRONTEND_FOLDER, 'assets'), filename)

if __name__ == '__main__':
    
    app.run(host='0.0.0.0', port=5000, debug=True)


