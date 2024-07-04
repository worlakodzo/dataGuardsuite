from flask import Flask
from flask_cors import CORS
from flask_mail import Mail
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from .storage.db import MongoDBConnection
from .storage.default_data.db.load_default import (
    load_default_backup_frequency,
    load_default_storage_providers,
    load_default_datastore_engine,
    delete_old_default_data,
)

# Create app
app = Flask(__name__)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
mail = Mail(app)

# CORS(app)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

# Connect to database
try:
    connection = MongoDBConnection()
    mongo_db = connection.db
    mongo_client = connection.client
    print("Connected to the database successfully")

    # Load default data
    load_default_backup_frequency(mongo_db)
    load_default_storage_providers(mongo_db)
    load_default_datastore_engine(mongo_db)
except Exception as e:
    print(f"Failed to connect to the database: {e}")
