from flask import Blueprint

schedule_app = Blueprint(
    "backup_schedule_app", __name__, url_prefix="/backups/schedules"
)
