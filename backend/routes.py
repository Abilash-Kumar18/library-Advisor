from flask import Blueprint, jsonify, request
from recommender import recommend_books

api = Blueprint("api", __name__)

@api.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json() or {}
    title = data.get("title", "")
    recommendations = recommend_books(title)
    return jsonify({"query": title, "recommendations": recommendations})
