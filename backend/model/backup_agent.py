import uuid
from .. import mongo_db
from datetime import datetime


class BackupAgent:
    """
    BackupAgent class represents the agent backup the file from user server.
    """

    __collection_name = "backup_agent"

    @classmethod
    def collection_name(cls):
        return cls.__collection_name

    def __init__(self, user_id: str, database_ids: list, agent_name: str):
        """
        Initializes a new BackupAgent instance.
        """
        self._id = str(uuid.uuid4())
        self.user_id = user_id
        self.database_ids = database_ids
        self.is_active = False
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def save(self):
        """
        Save the current instance to the MongoDB 'backup_agent' collection.
        Returns:
            pymongo.results.InsertOneResult: The result of the insert operation.
        """
        res = mongo_db.backup_agent.insert_one(self.__dict__)
        return res
