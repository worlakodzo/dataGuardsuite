from flask import Flask, jsonify, render_template


app = Flask(__name__)


@app.route("/health", strict_slashes=False)
def health():
    return jsonify({"status": "OK"})


@app.route("/", strict_slashes=False)
def landing_page():
    return render_template("landing_page/index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
