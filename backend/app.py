import os
import sys
import uuid
from functools import wraps
from flask import Flask, jsonify


app = Flask(__name__)


@app.route("/", strict_slashes=False)
@app.route("/health", strict_slashes=False)
def health():
    return jsonify({"status": "OK"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
