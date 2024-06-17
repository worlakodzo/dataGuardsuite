import os
import sys
import uuid
from flask_cors import CORS
from flask import Flask, jsonify
from .storage.constant import UPLOAD_FOLDER
from dotenv import find_dotenv, load_dotenv


# Load enviroment variable
load_dotenv(find_dotenv())


app = Flask(__name__)
# configure the file upload folder
# and application security setting
app.config["SECRET_KEY"] = "I-will-change-the-Secret-Code-Later"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# app.register_blueprint(job)
# app.register_blueprint(mcredential)
# app.register_blueprint(backup)


CORS(app)
cors = CORS(app, resources={r"/*": {"origins": "*"}})


@app.route("/", strict_slashes=False)
@app.route("/health", strict_slashes=False)
def health():
    return jsonify({"status": "OK"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001, debug=True)
