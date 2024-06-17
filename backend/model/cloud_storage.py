import uuid
from .. import mongo_db
from datetime import datetime


class CloudStorage:
    """
    CloudStorage class represents the cloud platform where users want to store backups.
    """

    __collection_name = "cloud_storage"

    @classmethod
    def collection_name(cls):
        return cls.__collection_name

    def __init__(
        self,
        user_id: str,
        database_id: str,
        provider: str,
        credentials: dict,
        storage_bucket_name: str,
        region_name: str,
    ):
        """
        Initializes a new CloudStorage instance.
        """
        self._id = str(uuid.uuid4())
        self.user_id = user_id
        self.database_id = database_id
        self.provider = provider
        self.credentials = credentials  # encrypted credentials
        self.storage_bucket_name = storage_bucket_name
        self.region_name = region_name
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def save(self):
        """
        Save the current instance to the MongoDB 'cloud_storage' collection.
        Returns:
            pymongo.results.InsertOneResult: The result of the insert operation.
        """
        res = mongo_db.cloud_storage.insert_one(self.__dict__)
        return res