from flask import Blueprint, request, jsonify
from app.services.recommender import Recommender
import os

recommend_bp = Blueprint('recommend', __name__)

# Initialize recommender with the absolute path to books.csv
csv_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'data_pipeline', 'raw_data', 'books.csv')
recommender = Recommender(os.path.abspath(csv_path))

@recommend_bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    model = request.args.get('model', 'hybrid')
    limit = int(request.args.get('limit', 12))
    recs = recommender.get_recommendations(model_type=model, limit=limit)
    return jsonify(recs)

@recommend_bp.route('/books', methods=['GET'])
def list_books():
    genre = request.args.get('genre')
    search = request.args.get('search')
    min_rating = request.args.get('minRating')
    limit = int(request.args.get('limit', 50))
    books = recommender.list_books(genre=genre, search=search, min_rating=min_rating, limit=limit)
    return jsonify(books)

@recommend_bp.route('/insights/genres', methods=['GET'])
def get_genres():
    print("DEBUG: get_genres called")
    genres = recommender.get_genres()
    print(f"DEBUG: returning {len(genres)} genres")
    return jsonify(genres)

@recommend_bp.route('/healthz', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

@recommend_bp.route('/auth/me', methods=['GET'])
def get_current_user():
    # Return null to indicate no user is logged in
    return jsonify(None)

@recommend_bp.route('/books/<book_id>', methods=['GET'])
def get_book(book_id):
    # Find book by ISBN13
    book = recommender.df[recommender.df['isbn13'].astype(str) == str(book_id)]
    if book.empty:
        # Try ISBN10
        book = recommender.df[recommender.df['isbn10'].astype(str) == str(book_id)]
    
    if book.empty:
        return {"error": "Not Found", "message": "Book not found"}, 404
    
    return jsonify(recommender._row_to_book(book.iloc[0]))

@recommend_bp.route('/library', methods=['GET'])
def list_library():
    # Return an empty library for now as we don't have a user database yet
    return jsonify([])

@recommend_bp.route('/library/stats', methods=['GET'])
def get_library_stats():
    return jsonify({"reading": 0, "read": 0, "wantToRead": 0, "total": 0})
