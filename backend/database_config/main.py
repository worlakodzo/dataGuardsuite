from flask import Blueprint

db_config_app = Blueprint(
    "database_configuration_app", __name__, url_prefix="/databases"
)
