import os
from flask import Flask
from flask_cors import CORS
from flask_mail import Mail
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from .storage.db import MongoDBConnection
from .storage.constant import UPLOAD_FOLDER


app = Flask(__name__)

# configure the file upload folder
# and application security setting
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY")
app.config["MAIL_SERVER"] = os.environ.get("MAIL_SERVER")
app.config["MAIL_PORT"] = int(os.environ.get("MAIL_PORT"))
app.config["MAIL_USERNAME"] = os.environ.get("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.environ.get("MAIL_PASSWORD")
app.config["MAIL_USE_TLS"] = True if os.environ.get("MAIL_USE_TLS") == "true" else False
app.config["MAIL_USE_SSL"] = True if os.environ.get("MAIL_USE_SSL") == "true" else False

jwt = JWTManager(app)
bcrypt = Bcrypt(app)
mail = Mail(app)
# CORS(app)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

try:
    connection = MongoDBConnection()
    mongo_db = connection.db
    mongo_client = connection.client
    print("Connected to the database successfully")
except Exception as e:
    print(f"Failed to connect to the database: {e}")
