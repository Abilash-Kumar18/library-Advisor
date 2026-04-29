from flask import Flask
from flask_cors import CORS
from app.api.recommend import recommend_bp
import os

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(recommend_bp, url_prefix='/api')

@app.errorhandler(404)
def not_found_error(error):
    return {"error": "Not Found", "message": "The requested URL was not found on the server."}, 404

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    # Disable debug for stability in background execution
    app.run(host='0.0.0.0', port=port, debug=False)
