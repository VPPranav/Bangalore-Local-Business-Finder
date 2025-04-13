# database : bangalore_local and collection : contacts
from pymongo import MongoClient
import os

# MongoDB connection string - update with your actual connection string
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/')

def get_database():
    """
    Connect to MongoDB and return the database instance
    """
    try:
        # Create a connection using MongoClient
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        
        # Get the database (creates it if it doesn't exist)
        db = client['bangalore_local']
        
        # Test connection
        client.admin.command('ping')
        print("Successfully connected to MongoDB!")
        
        return db
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return None

def get_collection(collection_name):
    """
    Get a specific collection from the database
    """
    db = get_database()
    if db is None:  # Fixed this check to use 'is None' instead of boolean evaluation
        return None
    return db[collection_name]