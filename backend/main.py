import os
from flask import jsonify
from dotenv import find_dotenv, load_dotenv
from .storage.constant import UPLOAD_FOLDER
# Load enviroment variable
load_dotenv(find_dotenv())

from . import app
from .user.main import user_app
from .backup_schedule.main import schedule_app
from .database_config.main import db_config_app
from .backup_agent.main import backup_agent_app
from .backup_management.main import backup_management_app

# configure the file upload folder
# and application security setting
print('os.environ.get("MAIL_PORT: ")', os.environ.get("MAIL_PORT"))
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY")
app.config["MAIL_SERVER"] = os.environ.get("MAIL_SERVER")
app.config["MAIL_PORT"] = int(os.environ.get("MAIL_PORT"))
app.config["MAIL_USERNAME"] = os.environ.get("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.environ.get("MAIL_PASSWORD")
app.config["MAIL_USE_TLS"] = True if os.environ.get("MAIL_USE_TLS") == "true" else False
app.config["MAIL_USE_SSL"] = True if os.environ.get("MAIL_USE_SSL") == "true" else False

app.register_blueprint(user_app)
app.register_blueprint(schedule_app)
app.register_blueprint(db_config_app)
app.register_blueprint(backup_agent_app)
app.register_blueprint(backup_management_app)


@app.route("/", strict_slashes=False)
@app.route("/health", strict_slashes=False)
def health():
    return jsonify({"status": "OK"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001, debug=True)
