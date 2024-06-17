import re
from functools import wraps
from flask import session, request, jsonify, abort, url_for
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)

from flask import Blueprint

user_app = Blueprint("user_app", __name__, url_prefix="/users")


users = {}


# Decorators
def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if session.get("is_authenticated", None):
            return f(*args, **kwargs)
        else:
            return abort("401")

    return wrap


@user_app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"msg": "Invalid email format"}), 400

    if email in users:
        return jsonify({"msg": "User already exists"}), 409

    return jsonify({"msg": "User registered successfully"}), 201


@user_app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = users.get(email)
    if user and 'bcrypt.check_password_hash(user["password"], password)':
        access_token = create_access_token(identity=email)
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"msg": "Invalid credentials"}), 401


@user_app.route("/api/logout", methods=["POST"])
@jwt_required()
def logout():
    # Invalidate the token or handle session management here if needed
    return jsonify({"msg": "User logged out successfully"}), 200


@user_app.route("/api/password-recovery", methods=["POST"])
def password_recovery():
    data = request.get_json()
    email = data.get("email")

    if email not in users:
        return jsonify({"msg": "User not found"}), 404

    # send_recovery_email(email, recovery_token)

    return jsonify({"msg": "Password recovery email sent"}), 200


@user_app.route("/api/password-reset", methods=["PUT"])
def password_reset():
    data = request.get_json()
    token = data.get("token")
    new_password = data.get("new_password")

    try:
        email = get_jwt_identity(token)
    except:
        return jsonify({"msg": "Invalid or expired token"}), 400

    if email not in users:
        return jsonify({"msg": "User not found"}), 404

    return jsonify({"msg": "Password reset successfully"}), 200
