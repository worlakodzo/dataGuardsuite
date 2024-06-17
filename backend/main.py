from flask import jsonify
from dotenv import find_dotenv, load_dotenv

# Load enviroment variable
load_dotenv(find_dotenv())

from . import app
from .user.main import user_app
from .backup_schedule.main import schedule_app
from .database_config.main import db_config_app
from .backup_agent.main import backup_agent_app
from .backup_management.main import backup_management_app


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
