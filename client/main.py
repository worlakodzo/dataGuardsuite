from flask import Flask, jsonify, render_template


app = Flask(__name__)


@app.route("/health", strict_slashes=False)
def health():
    return jsonify({"status": "OK"})


@app.route("/", strict_slashes=False)
def index():
    return render_template("landing_page/index.html")


@app.route("/login", strict_slashes=False)
def login():
    return render_template("web_app/login.html")


@app.route("/register", strict_slashes=False)
def register():
    return render_template("web_app/register.html")


@app.route("/dashboard", strict_slashes=False)
def dashboard():
    return render_template("web_app/index.html", is_dashboard=True)


@app.route("/users", strict_slashes=False)
def users():
    return render_template("web_app/user-list.html", is_user=True)


@app.route("/users/profile", strict_slashes=False)
def profile():
    return render_template("web_app/users-profile.html", is_user=True)


@app.route("/users/add", strict_slashes=False)
def user_add():
    return render_template("web_app/users-add.html", is_user=True)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
