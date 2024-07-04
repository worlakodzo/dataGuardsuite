import uuid
import json
from .. import mongo_db
from datetime import datetime
from ..encryption import encrypt, decrypt


class Datastore:
    """
    Datastore class represent the datastore configuration.
    """

    __collection_name = "datastore"

    def __init__(
        self,
        _id: str = None,
        user_id: str = None,
        master_user_id: str = None,
        ds_details: dict = {},
        ds_credential: dict = {},
        tags: list = [],
    ):
        """
        Initializes a new Database instance.
        """

        self._id = _id
        self.user_id = user_id
        self.master_user_id = master_user_id
        self.ds_details = ds_details
        self.ds_credential = ds_credential
        self.tags = tags
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    @classmethod
    def collection_name(cls):
        return cls.__collection_name

    def save(self):
        """
        Save or Update the current instance to the MongoDB 'datastore' collection.
        Returns:
            pymongo.results.InsertOneResult or pymongo.results.Upsert:
            The result of the insert operation.
        """
        if not hasattr(self, "update_document"):
            # Insert a new document
            new_value = self.__dict__.copy()
            new_value["ds_credential"] = encrypt(json.dumps(new_value["ds_credential"]))
            res = mongo_db.datastore.insert_one(new_value)
        else:
            # Update existing document
            new_value = self.__dict__.copy()
            new_value["ds_credential"] = encrypt(json.dumps(new_value["ds_credential"]))
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
            new_obj.ds_credential = json.loads(decrypt(new_obj.ds_credential))
            objects.append(new_obj)

        return objects

    def to_dict(self):
        """
        Convert datastore instance to dictionary.
        """
        data_dict = self.__dict__
        data_dict["created_at"] = self.created_at.isoformat()
        data_dict["updated_at"] = self.updated_at.isoformat()
        return data_dict


class DatastoreType:
    """
    DatastoreType class represent the datastore type configuration.
    """

    __collection_name = "datastore_type"

    @classmethod
    def collection_name(cls):
        return cls.__collection_name

    def __init__(
        self,
        id: str = None,
        ds_type: str = None,
        name: str = None,
        description: str = None,
        type: str = None,
        image: str = None,
    ):
        """
        Initializes a new Database instance.
        """

        self._id = id
        self.ds_type = ds_type
        self.active = True
        self.name = name
        self.description = description
        self.type = type
        self.image = image

    def save(self):
        """
        Save or Update the current instance to the MongoDB 'datastore' collection.
        Returns:
            pymongo.results.InsertOneResult or pymongo.results.Upsert:
            The result of the insert operation.
        """
        if not hasattr(self, "update_document"):
            # Insert a new document
            new_value = self.__dict__.copy()
            res = mongo_db.datastore_type.insert_one(new_value)
        else:
            # Update existing document
            new_value = self.__dict__.copy()
            del new_value["_id"]
            del new_value["update_document"]
            res = mongo_db.datastore_type.update_one(
                {"_id": self._id}, {"$set": new_value}
            )
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
        res = mongo_db.datastore_type.find(query, projection)

        objects = []
        for _, document in enumerate(res):
            new_obj = DatastoreType()
            for key, value in document.items():
                setattr(new_obj, key, value)

            setattr(new_obj, "update_document", True)
            objects.append(new_obj)

        return objects

    def to_dict(self):
        """
        Convert datastore instance to dictionary.
        """
        return self.__dict__


class BackupFrequencyType:
    """
    BackupFrequencyType class represent the backup frequency type configuration.
    """

    __collection_name = "datastore_type"

    @classmethod
    def collection_name(cls):
        return cls.__collection_name

    def __init__(self, id: str = None, name: str = None):
        """
        Initializes a new BackupFrequencyType instance.
        """

        self._id = id
        self.active = True
        self.name = name

    def save(self):
        """
        Save or Update the current instance to the MongoDB 'datastore' collection.
        Returns:
            pymongo.results.InsertOneResult or pymongo.results.Upsert:
            The result of the insert operation.
        """
        if not hasattr(self, "update_document"):
            # Insert a new document
            new_value = self.__dict__.copy()
            res = mongo_db.backup_frequency_type.insert_one(new_value)
        else:
            # Update existing document
            new_value = self.__dict__.copy()
            del new_value["_id"]
            del new_value["update_document"]
            res = mongo_db.backup_frequency_type.update_one(
                {"_id": self._id}, {"$set": new_value}
            )
        return res

    def update(self, data):
        for key, value in data.items():
            setattr(self, key, value)
        self.updated_at = datetime.utcnow()
        self.save()

    def delete(self):
        res = mongo_db.backup_frequency_type.delete_one({"_id": self._id})
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
        res = mongo_db.backup_frequency_type.find(query, projection)

        objects = []
        for _, document in enumerate(res):
            new_obj = BackupFrequencyType()
            for key, value in document.items():
                setattr(new_obj, key, value)

            setattr(new_obj, "update_document", True)
            objects.append(new_obj)

        return objects

    def to_dict(self):
        """
        Convert datastore instance to dictionary.
        """
        return self.__dict__
