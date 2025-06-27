from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import FeedbackRequest, User
from flask import request
from app.models import Feedback, db
#from sqlalchemy import func
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from flask import send_file
import io


from app.models import Notification

from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # ✅ Enables CORS for all routes


def create_notification(user_id, message):
    from app.models import Notification
    from app import db

    notification = Notification(recipient_id=user_id, message=message)
    db.session.add(notification)
    db.session.commit()




feedback_bp = Blueprint('feedback_bp', __name__)

@feedback_bp.route('/ping', methods=['GET'])
@jwt_required()
def protected_ping():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))  # Cast back to int if stored as string
    return jsonify({
        "message": f"Hello {user.role}!",
        "user": {
            "id": user.id,
            "role": user.role
        }
    }), 200
    
@feedback_bp.route('/whoami', methods=['GET'])
@jwt_required()
def whoami():
    return {"user_id": get_jwt_identity()}

@feedback_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_feedback():
    data = request.get_json()
    employee_id = data.get('employee_id')
    strengths = data.get('strengths')
    areas_to_improve = data.get('areas_to_improve')
    sentiment = data.get('sentiment')
    comment = data.get('comment', '')
    anonymous = data.get('anonymous', False)
    request_id = data.get('request_id')

    current_user_id = get_jwt_identity()
    manager = User.query.get(current_user_id)

    if not anonymous and manager.role != 'manager':
        return {"msg": "Only managers can submit feedback."}, 403

    employee = User.query.get(employee_id)
    if not employee or employee.role != 'employee':
        return {"msg": "Invalid employee ID"}, 404

    feedback = Feedback(
        manager_id=None if anonymous else manager.id,
        employee_id=employee.id,
        strengths=strengths,
        areas_to_improve=areas_to_improve,
        sentiment=sentiment,
        comment=comment,
        anonymous=anonymous
    )
    db.session.add(feedback)

    # ✅ Fulfill request if it matches
    if request_id:
        req = FeedbackRequest.query.get(request_id)
        if req and req.manager_id == manager.id and req.employee_id == employee.id:
            req.status = 'fulfilled'

    db.session.commit()

    message = "New anonymous feedback received." if anonymous else f"New feedback from {manager.username}"
    create_notification(employee.id, message)

    return {"msg": "Feedback submitted"}, 201



@feedback_bp.route('/employees', methods=['GET'])  # ✅ plural
@jwt_required()
def get_all_employees():
    current_user = User.query.get(get_jwt_identity())
    if current_user.role != 'manager':
        return {"msg": "Only managers can fetch employee list."}, 403

    employees = User.query.filter_by(role='employee').all()
    return jsonify([{"id": emp.id, "username": emp.username} for emp in employees]), 200


@feedback_bp.route('/managers', methods=['GET'])
@jwt_required()
def get_managers():
    managers = User.query.filter_by(role='manager').all()
    return jsonify([
        {"id": m.id, "username": m.username} for m in managers
    ]), 200


@feedback_bp.route('/employee', methods=['GET'])
@jwt_required()
def get_employee_feedback():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if user.role != 'employee':
        return {"msg": "Only employees can view their feedback."}, 403

    feedbacks = Feedback.query.filter_by(employee_id=user.id).order_by(Feedback.timestamp.desc()).all()

    feedback_list = []
    for fb in feedbacks:
        manager = User.query.get(fb.manager_id) if fb.manager_id else None
        feedback_list.append({
            "id": fb.id,
            "manager_id": fb.manager_id,
            "manager_username": manager.username if manager else "Manager",
            "strengths": fb.strengths,
            "areas_to_improve": fb.areas_to_improve,
            "sentiment": fb.sentiment,
            "acknowledged": fb.acknowledged,
            "timestamp": fb.timestamp.strftime('%Y-%m-%d %H:%M:%S') if fb.timestamp else "N/A",
            "comment": fb.comment or ""
        })

    return jsonify(feedback_list), 200


@feedback_bp.route('/manager', methods=['GET'])
@jwt_required()
def get_manager_feedback():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if user.role != 'manager':
        return {"msg": "Only managers can view submitted feedback."}, 403

    feedbacks = Feedback.query.filter_by(manager_id=user.id).order_by(Feedback.timestamp.desc()).all()

    feedback_list = [
        {
            "id": fb.id,
            "employee_id": fb.employee_id,
            "employee_username": User.query.get(fb.employee_id).username,
            "strengths": fb.strengths,
            "areas_to_improve": fb.areas_to_improve,
            "sentiment": fb.sentiment,
            "acknowledged": fb.acknowledged,
            "timestamp": fb.timestamp.strftime('%Y-%m-%d %H:%M:%S') if fb.timestamp else "N/A"

        }
        for fb in feedbacks
    ]

    return jsonify(feedback_list), 200

@feedback_bp.route('/acknowledge/<int:feedback_id>', methods=['POST'])
@jwt_required()
def acknowledge_feedback(feedback_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if user.role != 'employee':
        return {"msg": "Only employees can acknowledge feedback."}, 403

    feedback = Feedback.query.get(feedback_id)

    if not feedback:
        return {"msg": "Feedback not found."}, 404

    if feedback.employee_id != user.id:
        return {"msg": "You can only acknowledge your own feedback."}, 403

    feedback.acknowledged = True
    db.session.commit()

    return {"msg": "Feedback acknowledged."}, 200

@feedback_bp.route('/edit/<int:feedback_id>/', methods=['PUT'])
@feedback_bp.route('/edit/<int:feedback_id>', methods=['PUT'])
@jwt_required()
def edit_feedback(feedback_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if user.role != 'manager':
        return {"msg": "Only managers can edit feedback."}, 403

    feedback = Feedback.query.get(feedback_id)

    if not feedback:
        return {"msg": "Feedback not found."}, 404

    if feedback.manager_id != user.id:
        return {"msg": "You can only edit your own feedback."}, 403

    data = request.get_json()
    feedback.strengths = data.get('strengths', feedback.strengths)
    feedback.areas_to_improve = data.get('areas_to_improve', feedback.areas_to_improve)
    feedback.sentiment = data.get('sentiment', feedback.sentiment)

    db.session.commit()

    return {"msg": "Feedback updated successfully."}, 200



@feedback_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def manager_dashboard():
    current_user_id = get_jwt_identity()
    manager = User.query.get(current_user_id)

    if manager.role != 'manager':
        return {"msg": "Only managers can view this dashboard."}, 403

    # Get team members who received feedback from this manager
    feedbacks = Feedback.query.filter_by(manager_id=manager.id).all()

    team_stats = {}
    for fb in feedbacks:
        emp = fb.employee_id
        if emp not in team_stats:
            employee = User.query.get(emp)
            team_stats[emp] = {
                "employee_name": employee.username,
                "total_feedbacks": 0,
                "positive": 0,
                "neutral": 0,
                "negative": 0
            }
        team_stats[emp]["total_feedbacks"] += 1
        team_stats[emp][fb.sentiment] += 1

    return jsonify(team_stats)


@feedback_bp.route('/employee/dashboard', methods=['GET'])
@jwt_required()
def employee_dashboard():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if user.role != 'employee':
        return {"msg": "Only employees can access this dashboard."}, 403

    feedbacks = Feedback.query.filter_by(employee_id=user.id).order_by(Feedback.timestamp.desc()).all()

    timeline = []
    for fb in feedbacks:
        timeline.append({
            "feedback_id": fb.id,
            "strengths": fb.strengths,
            "areas_to_improve": fb.areas_to_improve,
            "sentiment": fb.sentiment,
            "timestamp": fb.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            "acknowledged": fb.acknowledged
        })

    return jsonify({
        "employee": user.username,
        "feedback_history": timeline
    }), 200


@feedback_bp.route('/request-feedback', methods=['POST'])
@jwt_required()
def request_feedback():
    data = request.get_json()
    manager_id = data.get('manager_id')  # 👈 now expecting manager_id

    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if user.role != 'employee':
        return {"msg": "Only employees can request feedback"}, 403

    manager = User.query.get(manager_id)
    if not manager or manager.role != 'manager':
        return {"msg": "Invalid manager ID"}, 404

    request_entry = FeedbackRequest(employee_id=user.id, manager_id=manager.id)
    db.session.add(request_entry)
    db.session.commit()

    create_notification(manager.id, f"{user.username} has requested feedback.")

    return {"msg": "Feedback request sent"}, 201




@feedback_bp.route('/view-requests', methods=['GET'])
@jwt_required()
def view_requests():
    current_user_id = get_jwt_identity()
    manager = User.query.get(current_user_id)

    if not manager:
        return {"msg": "Manager not found."}, 404

    if manager.role != 'manager':
        return {"msg": "Only managers can view feedback requests."}, 403

    # Fetch and print all FeedbackRequest for debug
    all_requests = FeedbackRequest.query.all()
    print(f"Total feedback requests in DB: {len(all_requests)}")

    for r in all_requests:
        print(f"Request ID: {r.id}, Emp ID: {r.employee_id}, Mgr ID: {r.manager_id}, Status: {r.status}")

    # Filter only those assigned to this manager
    requests = FeedbackRequest.query.filter_by(manager_id=manager.id).all()
    print(f"Requests found for Manager {manager.username} (ID={manager.id}): {len(requests)}")

    result = [
        {
            "id": r.id,
            "employee_id": r.employee_id,
            "employee_name": r.employee.username,
            "status": r.status,
            "timestamp": r.timestamp.isoformat()
        }
        for r in requests
    ]

    return jsonify(result), 200


@feedback_bp.route('/requests/<int:request_id>', methods=['GET'])
@jwt_required()
def get_request_by_id(request_id):
    current_user_id = int(get_jwt_identity())  # ✅ ensure correct type
    req = FeedbackRequest.query.get(request_id)

    print(f"🔒 Current user ID: {current_user_id}")
    if not req:
        print("❌ Request not found")
        return jsonify({"msg": "Request not found"}), 404

    print(f"📝 Request manager_id: {req.manager_id}")
    print(f"🔍 Comparing with current_user_id: {current_user_id}")

    if req.manager_id != current_user_id:
        print("❌ Unauthorized access - Manager mismatch")
        return jsonify({"msg": "Unauthorized access"}), 403

    employee = User.query.get(req.employee_id)
    return jsonify({
        "id": req.id,
        "employee_id": req.employee_id,
        "employee_name": employee.username,
        "status": req.status
    }), 200







@feedback_bp.route('/feedback-request/<int:request_id>/mark-handled', methods=['PATCH'])
@jwt_required()
def mark_request_handled(request_id):
    current_user_id = get_jwt_identity()
    req = FeedbackRequest.query.get_or_404(request_id)

    if req.manager_id != current_user_id:
        return {"msg": "Not authorized"}, 403

    req.status = "handled"
    db.session.commit()
    return {"msg": "Request marked as handled"}, 200


@feedback_bp.route('/comment/<int:feedback_id>', methods=['POST'])
@jwt_required()
def add_comment(feedback_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    feedback = Feedback.query.get(feedback_id)
    if not feedback:
        return {"msg": "Feedback not found"}, 404

    # Only the employee who received the feedback can comment
    if feedback.employee_id != user.id or user.role != 'employee':
        return {"msg": "Unauthorized"}, 403

    data = request.get_json()
    comment = data.get('comment')

    if not comment:
        return {"msg": "Comment cannot be empty"}, 400

    feedback.comment = comment
    db.session.commit()

    return {"msg": "Comment added successfully"}, 200


@feedback_bp.route('/export/<int:feedback_id>', methods=['GET'])
@jwt_required()
def export_feedback_pdf(feedback_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    feedback = Feedback.query.get_or_404(feedback_id)

    # ✅ Access control
    if user.role == "employee" and feedback.employee_id != user.id:
        return {"msg": "Unauthorized"}, 403
    if user.role == "manager" and feedback.manager_id != user.id:
        return {"msg": "Unauthorized"}, 403

    # ✅ Generate PDF in memory
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    y = 750

    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(100, y, f"Feedback Report - ID: {feedback.id}")
    y -= 30

    pdf.setFont("Helvetica", 12)
    pdf.drawString(100, y, f"Strengths: {feedback.strengths}")
    y -= 20
    pdf.drawString(100, y, f"Areas to Improve: {feedback.areas_to_improve}")
    y -= 20
    pdf.drawString(100, y, f"Sentiment: {feedback.sentiment}")
    y -= 20
    pdf.drawString(100, y, f"Comment: {feedback.comment or 'N/A'}")
    y -= 20
    pdf.drawString(100, y, f"Acknowledged: {'Yes' if feedback.acknowledged else 'No'}")
    y -= 20
    pdf.drawString(100, y, f"Timestamp: {feedback.timestamp.strftime('%Y-%m-%d %H:%M:%S')}")

    pdf.showPage()
    pdf.save()

    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name=f"feedback_{feedback.id}.pdf", mimetype='application/pdf')


@feedback_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    current_user_id = get_jwt_identity()

    notifications = Notification.query.filter_by(recipient_id=current_user_id).order_by(Notification.timestamp.desc()).all()

    return jsonify([
        {
            'id': n.id,
            'message': n.message,
            'is_read': n.is_read,
            'timestamp': n.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        } for n in notifications
    ])




@feedback_bp.route('/notifications/<int:notif_id>/read', methods=['POST'])
@jwt_required()
def mark_notification_as_read(notif_id):
    current_user_id = int(get_jwt_identity())
    notification = Notification.query.get_or_404(notif_id)

    print("🔐 JWT User ID:", current_user_id)
    print("📩 Notification ID:", notification.id)
    print("📬 Recipient ID:", notification.recipient_id)
    print("🧪 Same?", current_user_id == notification.recipient_id)

    if notification.recipient_id != current_user_id:
        return jsonify({
            "msg": "You are not authorized to mark this notification.",
            "jwt_user_id": current_user_id,
            "notification_recipient": notification.recipient_id
        }), 403

    notification.is_read = True
    db.session.commit()
    return jsonify({"msg": "Notification marked as read."}), 200







