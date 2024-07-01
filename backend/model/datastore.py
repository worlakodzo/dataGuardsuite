import uuid
from .. import mongo_db
from datetime import datetime


class Datastore:
    """
    Datastore class represent the datastore configuration.
    """

    __collection_name = "datastore"

    @classmethod
    def collection_name(cls):
        return cls.__collection_name

    def __int__(
        self,
        user_id: str = None,
        db_type: str = None,
        host: str = None,
        port: str = None,
        username: str = None,
        password: str = None,
        database_name: str = None,
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
        Save or Update the current instance to the MongoDB 'datastore' collection.
        Returns:
            pymongo.results.InsertOneResult or pymongo.results.Upsert:
            The result of the insert operation.
        """
        if not hasattr(self, "update_document"):
            # Insert a new document
            res = mongo_db.datastore.insert_one(self.__dict__)
        else:
            # Update existing document
            new_value = self.__dict__.copy()
            del new_value["_id"]
            del new_value["update_document"]
            res = mongo_db.datastore.update_one({"_id": self._id}, {"$set": new_value})
        return res

    def update(self, data):
        for key, value in data.items():
            setattr(self, key, value)
        self.updated_at = datetime.utcnow()
        self.save()

    def delete(self):
        res = mongo_db.datastore.delete_one({"_id": self._id})
        return res

    @staticmethod
    def filter(query: dict, projection=None) -> list:
        """
        Filters documents from a MongoDB collection based on a query.

        Args:
            query (dict): The query to filter documents.
            projection (dict, optional): The fields to include or exclude. Defaults to None.
        Returns:
            list: A list of filtered documents converted to datastore instance.
        """
        # Retrieve documents matching the query
        res = mongo_db.datastore.find(query, projection)

        objects = []
        for _, document in enumerate(res):
            new_obj = Datastore()
            for key, value in document.items():
                setattr(new_obj, key, value)

            setattr(new_obj, "update_document", True)
            objects.append(new_obj)

        return objects

    def to_dict(self):
        """
        Convert user instance to dictionary.
        """
        data_dict = self.__dict__
        data_dict["created_at"] = self.created_at.isoformat()
        data_dict["updated_at"] = self.updated_at.isoformat()
        return data_dict

