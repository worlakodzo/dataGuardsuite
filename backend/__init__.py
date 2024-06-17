from flask import Flask
from flask_cors import CORS
from flask_mail import Mail
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from .storage.db import MongoDBConnection

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
except Exception as e:
    print(f"Failed to connect to the database: {e}")
