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
from ..model.user import User


@user_app.route("/register", methods=["POST"], strict_slashes=False)
def register():
    try:
        data = request.get_json()
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if not username or not email or not password:
            return jsonify({"msg": "Username, email, and password are required"}), 400

        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return jsonify({"msg": "Invalid email format"}), 400

        if User.email_exists(email) or User.username_exists(username):
            return jsonify({"msg": "User already exists"}), 409

        # Create user
        new_user = User(username=username, email=email, password=password)
        res = new_user.save()

        # Create access token
        access_token = create_access_token(
            identity={"user_id": res.inserted_id, "username": username, "email": email}
        )

        return (
            jsonify(
                {
                    "msg": "User registered successfully",
                    "user_id": res.inserted_id,
                    "access_token": access_token,
                }
            ),
            201,
        )

    except KeyError as key_err:
        return jsonify({"msg": f"Missing field: {str(key_err)}"}), 400
    except Exception as err:
        print(str(err))
        abort(500)


@user_app.route("/login", methods=["POST"], strict_slashes=False)
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user: User = User.filter({"email": email})[0]

    if user and user.is_authenticated(password):
        # Create access token
        access_token = create_access_token(
            identity={
                "user_id": user._id,
                "username": user.username,
                "email": user.email,
            }
        )
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"msg": "Invalid credentials"}), 401


@user_app.route("/logout", methods=["POST"], strict_slashes=False)
@jwt_required()
def logout():
    # Invalidate the token or handle session management here if needed
    return jsonify({"msg": "User logged out successfully"}), 200


@user_app.route("/password-recovery", methods=["POST"], strict_slashes=False)
def password_recovery():
    data = request.get_json()
    email = data.get("email")

    if not User.email_exists(email):
        return jsonify({"msg": "User not found"}), 404

    user: User = User.filter({"email": email})[0]
    user.send_recovery_email()

    return jsonify({"msg": f"Password recovery email sent to {email}"}), 200


@user_app.route("/password-reset", methods=["PUT"], strict_slashes=False)
def password_reset():
    data = request.get_json()
    token = data.get("token")
    new_password = data.get("new_password")

    try:
        identity = get_jwt_identity(token)
    except:
        return jsonify({"msg": "Invalid or expired token"}), 400

    user: User = User.filter({"email": identity["email"]})[0]
    if not user:
        return jsonify({"msg": "User not found"}), 404

    user.password_hash = user.get_hashed_password(new_password)
    user.save()
    return jsonify({"msg": "Password reset successfully"}), 200
