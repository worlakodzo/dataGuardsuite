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


@app.route("/users/profile/<string:user_id>", strict_slashes=False)
def user_profile(user_id):
    return render_template("web_app/users-profile.html", user_id=user_id, is_user=True)


@app.route("/users/add", strict_slashes=False)
def user_add():
    return render_template("web_app/users-add.html", is_user=True)


@app.route("/datastores", strict_slashes=False)
def datastores():
    return render_template("web_app/datastores.html", is_datastores=True)


@app.route("/datastores/add", strict_slashes=False)
def datastores_add():
    return render_template("web_app/datastores-add.html", is_datastores=True)


@app.route("/datastores/edit/<string:datastore_id>", strict_slashes=False)
def datastores_edit(datastore_id):
    return render_template(
        "web_app/datastores-edit.html", datastore_id=datastore_id, is_datastores=True
    )


@app.route("/jobs", strict_slashes=False)
def jobs():
    return render_template("web_app/jobs.html", is_jobs=True)


@app.route("/jobs/schedule", strict_slashes=False)
def jobs_schedule():
    return render_template(
        "web_app/jobs-schedule.html", method="POST", action_type="Add", is_jobs=True
    )


@app.route("/jobs/schedule/edit/<string:job_id>", strict_slashes=False)
def jobs_schedule_edit(job_id):
    return render_template(
        "web_app/jobs-schedule.html",
        job_id=job_id,
        method="PUT",
        action_type="Update",
        is_jobs=True,
    )


@app.route("/jobs/backups", strict_slashes=False)
def jobs_backup():
    return render_template("web_app/backup-manager.html", is_backup=True)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
