"""Startup entry for WigVerse AI web app."""

from wig_ai_studio.app import app


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=False)
