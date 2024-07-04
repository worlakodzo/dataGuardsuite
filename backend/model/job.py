import uuid
from .. import mongo_db
from datetime import datetime, timedelta


class BackupSchedule:
    """
    BackupSchedule class represent the backup schedules created.
    """

    __collection_name = "backup_schedule"

    @classmethod
    def collection_name(cls):
        return cls.__collection_name

    def __int__(
        self,
        user_id: str = None,
        master_user_id: str = None,
        datastore_id: str = None,
        frequency: str = None,
        backup_date: datetime = None,
        hours: int = 0,
        minutes: int = 0,
    ):
        """
        Initializes a new Database instance.
        """

        self._id = str(uuid.uuid4())
        self.user_id = user_id
        self.master_user_id = master_user_id
        self.datastore_id = datastore_id
        self.frequency = frequency
        self.backup_date = backup_date
        self.hours = hours
        self.minutes = minutes
        self.timestamp = self.get_timestamp()
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def save(self):
        """
        Save or Update the current instance to the MongoDB 'backup_schedule' collection.
        Returns:
            pymongo.results.InsertOneResult or pymongo.results.Upsert:
            The result of the insert operation.
        """
        if not hasattr(self, "update_document"):
            # Insert a new document
            new_value = self.__dict__.copy()
            res = mongo_db.backup_schedule.insert_one(new_value)
        else:
            # Update existing document
            new_value = self.__dict__.copy()
            del new_value["_id"]
            del new_value["update_document"]
            res = mongo_db.backup_schedule.update_one({"_id": self._id}, {"$set": new_value})
        return res

    def get_timestamp(self) -> datetime:
        """
        Calculates the full timestamp for the next backup based on the date, hours, and minutes.

        Returns:
        --------
        datetime
            The full timestamp for the next backup.
        """
        return self.backup_date.replace(
            hour=self.hours, minute=self.minutes, second=0, microsecond=0
        )

    def update_next_backup_date(self):
        """
        Updates the next backup date based on the frequency.
        """
        if self.frequency.lower() == "daily":
            self.backup_date += timedelta(days=1)
        elif self.frequency.lower() == "weekly":
            self.backup_date += timedelta(weeks=1)
        elif self.frequency.lower() == "monthly":
            # Adding a month manually
            if self.backup_date.month == 12:
                self.backup_date = self.backup_date.replace(
                    year=self.backup_date.year + 1, month=1
                )
            else:
                self.backup_date = self.backup_date.replace(
                    month=self.backup_date.month + 1
                )

        self.time = self.get_timestamp()
        self.updated_at = datetime.utcnow()
        self.save()

    def update(self, data):
        for key, value in data.items():
            setattr(self, key, value)
        self.updated_at = datetime.utcnow()
        self.save()

    def delete(self):
        res = mongo_db.backup_schedule.delete_one({"_id": self._id})
        return res

    @staticmethod
    def filter(query: dict, projection=None) -> list:
        """
        Filters documents from a MongoDB collection based on a query.

        Args:
            query (dict): The query to filter documents.
            projection (dict, optional): The fields to include or exclude. Defaults to None.
        Returns:
            list: A list of filtered documents converted to backup schedule instance.
        """
        # Retrieve documents matching the query
        res = mongo_db.backup_schedule.find(query, projection)

        objects = []
        for _, document in enumerate(res):
            new_obj = BackupSchedule()
            for key, value in document.items():
                setattr(new_obj, key, value)

            setattr(new_obj, "update_document", True)
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
