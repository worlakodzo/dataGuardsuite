import uuid
from .. import mongo_db
from datetime import datetime


class Database:
    """
    Database class represent the database configuration.
    """

    __collection_name = "database"

    @classmethod
    def collection_name(cls):
        return cls.__collection_name

    def __int__(
        self,
        user_id: str,
        db_type: str,
        host: str,
        port: str,
        username: str,
        password: str,
        database_name: str,
    ):
        """
        Initializes a new Database instance.
        """

        self._id = str(uuid.uuid4())
        self.user_id = user_id
        self.db_type = db_type
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.database_name = database_name
        self.password = password
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def save(self):
        """
        Save the current instance to the MongoDB 'database' collection.
        Returns:
            pymongo.results.InsertOneResult: The result of the insert operation.
        """
        res = mongo_db.database.insert_one(self.__dict__)
        return res