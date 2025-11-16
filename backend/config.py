import os
import json
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Gemini
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    
    # Qdrant
    QDRANT_URL = os.getenv("QDRANT_URL")
    QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
    QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "rescuelena")
    
    # Firebase
    FIREBASE_CREDENTIALS_JSON = os.getenv("FIREBASE_CREDENTIALS_JSON")
    FIREBASE_CREDENTIALS = json.loads(FIREBASE_CREDENTIALS_JSON) if FIREBASE_CREDENTIALS_JSON else None
    
    # Supabase Storage
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "rescuelena-images")
    
    # Vector dimensions for embeddings
    EMBEDDING_DIM = 768

config = Config()
