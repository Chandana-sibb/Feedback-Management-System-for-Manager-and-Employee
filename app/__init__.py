from flask import Flask
from flask_sqlalchemy import SQLAlchemy 
from flask_jwt_extended import JWTManager 
from config import Config
from flask_cors import CORS
from app.routes.auth_routes import auth_bp
from app.routes.feedback_routes import feedback_bp


db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    jwt.init_app(app)
    CORS(app)  # ✅ Enable CORS inside the app factory

    # Import and register blueprints
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(feedback_bp, url_prefix='/api/feedback')

    # Custom JWT error handlers
    @jwt.unauthorized_loader
    def custom_unauthorized(err_str):
        return {"msg": f"Missing or invalid token: {err_str}"}, 401

    @jwt.invalid_token_loader
    def custom_invalid_token(reason):
        return {"msg": f"Invalid token: {reason}"}, 422

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {"msg": "Token has expired"}, 401

    return app
