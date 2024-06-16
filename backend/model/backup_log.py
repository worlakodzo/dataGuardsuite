import uuid
from datetime import datetime


class BackupLog:
    """
    BackupLog class represents the backup histories.
    """

    __collection_name = "backup_log"

    @classmethod
    def collection_name(cls):
        return cls.__collection_name

    def __init__(
        self,
        user_id: str,
        database_id: str,
        backup_type: str,
        status: str,
        start_time: datetime,
        end_time: datetime,
        log_details: str,
    ):
        """
        Initializes a new BackupLog instance.
        """
        self._id = str(uuid.uuid4())
        self.user_id = user_id
        self.database_id = database_id
        self.backup_type = backup_type
        self.status = status
        self.start_time = start_time
        self.end_time = end_time
        self.log_details = log_details
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
