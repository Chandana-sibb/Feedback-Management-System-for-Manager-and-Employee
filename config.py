
from datetime import timedelta
class Config:
    SECRET_KEY = 'your-secret-key'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///feedback.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'your-jwt-secret'
    #JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=2)
