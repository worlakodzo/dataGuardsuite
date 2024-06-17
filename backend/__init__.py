from .storage.db import MongoDBConnection


try:
    connection = MongoDBConnection()
    mongo_db = connection.db
    mongo_client = connection.client
    print("Connected to the database successfully")
except Exception as e:
    print(f"Failed to connect to the database: {e}")
