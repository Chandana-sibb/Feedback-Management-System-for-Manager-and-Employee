from app import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'manager' or 'employee'

    # Relationships
    feedback_given = db.relationship('Feedback', backref='manager', foreign_keys='Feedback.manager_id', lazy=True)
    feedback_received = db.relationship('Feedback', backref='employee', foreign_keys='Feedback.employee_id', lazy=True)

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    strengths = db.Column(db.Text, nullable=False)
    areas_to_improve = db.Column(db.Text, nullable=False)
    sentiment = db.Column(db.String(10), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    comment = db.Column(db.Text)
    manager_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    anonymous = db.Column(db.Boolean, default=False)

    acknowledged = db.Column(db.Boolean, default=False)
    
    # 💬 New field for employee comment
      

    
class FeedbackRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    manager_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, fulfilled
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    employee = db.relationship('User', foreign_keys=[employee_id], backref='requests_sent')
    manager = db.relationship('User', foreign_keys=[manager_id], backref='requests_received')




class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    recipient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    recipient = db.relationship('User', backref='notifications')
