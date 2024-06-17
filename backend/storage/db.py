import os
from pymongo import MongoClient


class MongoDBConnection:
    """
    MongoDBConnection class manages the connection to a MongoDB database.
    """

    def __init__(self):
        """
        Initializes a new MongoDBConnection instance, connecting to the MongoDB database.
        """
        # Get connection host and port
        db_name = os.environ.get("MONGO_DATABASE")
        connection_string = os.environ.get("MONGO_DATABASE_URI")

        if not db_name or not connection_string:
            raise ValueError(
                "Both MONGO_DB_NAME and MONGO_DB_URI environment variables must be set"
            )

        try:
            # Connect to database
            self.client = MongoClient(connection_string)
            self.db = self.client[db_name]
        except Exception as e:
            print(f"Error connecting to the database: {e}")
            raise


if __name__ == "__main__":
    try:
        connection = MongoDBConnection()
        db = connection.db
        client = connection.client
        print("Connected to the database successfully")
    except Exception as e:
        print(f"Failed to connect to the database: {e}")
