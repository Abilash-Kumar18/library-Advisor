import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os

class Recommender:
    def __init__(self, csv_path):
        self.csv_path = csv_path
        self.df = None
        self.tfidf_matrix = None
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.load_data()

    def load_data(self):
        if not os.path.exists(self.csv_path):
            print(f"Error: {self.csv_path} not found.")
            return

        self.df = pd.read_csv(self.csv_path)
        # Fill missing values
        self.df['title'] = self.df['title'].fillna('')
        self.df['authors'] = self.df['authors'].fillna('')
        self.df['categories'] = self.df['categories'].fillna('')
        self.df['description'] = self.df['description'].fillna('')
        
        # Create a combined features column
        self.df['combined_features'] = (
            self.df['title'] + " " + 
            self.df['authors'] + " " + 
            self.df['categories'] + " " + 
            self.df['description']
        )
        
        # Precompute TF-IDF matrix
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df['combined_features'])

    def get_recommendations(self, model_type='hybrid', limit=12):
        if self.df is None:
            return []
        
        # For simplicity, if no user history is provided, we return top rated or random
        # In a real scenario, 'hybrid' would combine content and collaborative filtering.
        # Here we'll just return a sample of high-rated books if no specific query is given.
        
        results = self.df.sort_values(by='average_rating', ascending=False).head(limit * 2).sample(limit)
        
        recommendations = []
        for _, row in results.iterrows():
            recommendations.append({
                "book": self._row_to_book(row),
                "matchPercent": int(np.random.randint(70, 99)),
                "reason": f"Based on your interest in {row['categories'] if row['categories'] else 'Fiction'}",
                "model": model_type
            })
        return recommendations

    def list_books(self, genre=None, search=None, min_rating=None, limit=50):
        if self.df is None:
            return []
        
        filtered_df = self.df.copy()
        
        if genre and genre != 'all':
            filtered_df = filtered_df[filtered_df['categories'].str.contains(genre, case=False, na=False)]
        
        if search:
            search_mask = (
                filtered_df['title'].str.contains(search, case=False, na=False) |
                filtered_df['authors'].str.contains(search, case=False, na=False)
            )
            filtered_df = filtered_df[search_mask]
            
        if min_rating:
            filtered_df = filtered_df[filtered_df['average_rating'] >= float(min_rating)]
            
        results = filtered_df.head(limit)
        return [self._row_to_book(row) for _, row in results.iterrows()]

    def get_genres(self):
        if self.df is None:
            return []
        genres = self.df['categories'].dropna().unique()
        # Flatten and split if multiple genres are in one string
        all_genres = set()
        for g in genres:
            for part in str(g).split(','):
                genre_name = part.strip()
                if genre_name:
                    all_genres.add(genre_name)
        return sorted(list(all_genres))

    def _row_to_book(self, row):
        return {
            "id": str(row['isbn13']),
            "title": row['title'],
            "author": row['authors'],
            "coverUrl": row['thumbnail'] if pd.notna(row['thumbnail']) else "https://via.placeholder.com/150",
            "genre": row['categories'],
            "tags": str(row['categories']).split(',') if pd.notna(row['categories']) else [],
            "rating": float(row['average_rating']),
            "ratingsCount": int(row['ratings_count']),
            "pages": int(row['num_pages']),
            "year": int(row['published_year']),
            "shortDescription": str(row['description'])[:200] + "...",
            "status": "available"
        }
