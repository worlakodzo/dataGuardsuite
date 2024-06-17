from functools import wraps
from flask import (Flask, session, request, jsonify, abort, url_for)

# Decorators
def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if session.get("is_authenticated", None):
            return f(*args, **kwargs)
        else:
            return abort("401")

    return wrap