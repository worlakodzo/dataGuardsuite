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

    def __init__(
        self,
        name: str = None,
        description: str = None,
        enable_automatic_backed_up: bool = False,
        user_id: str = None,
        master_user_id: str = None,
        datastore_engine_id: str = None,
        storage_provider_id: str = None,
        frequency: str = None,
        frequency_adjust_value: int = 1,
        start_time: str = "00:01",
        start_hours: int = 0,
        start_minutes: int = 0,
    ):
        """
        Initializes a new Database instance.
        """

        print("start_time: ", start_time)
        self._id = str(uuid.uuid4())
        self.user_id = user_id
        self.master_user_id = master_user_id
        self.name = name
        self.description = description
        self.enable_automatic_backed_up = enable_automatic_backed_up
        self.datastore_engine_id = datastore_engine_id
        self.storage_provider_id = storage_provider_id
        self.start_time = start_time
        self.frequency = frequency
        self.frequency_adjust_value = frequency_adjust_value
        self.backup_at = datetime.utcnow()
        self.start_hours = start_hours
        self.start_minutes = start_minutes
        self.start_time_in_12h_format = self.convert_24h_to_12h_format(start_time)
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
            res = mongo_db.backup_schedule.update_one(
                {"_id": self._id}, {"$set": new_value}
            )
        return res

    def get_timestamp(self) -> datetime:
        """
        Calculates the full timestamp for the next backup based on the date, hours, and minutes.

        Returns:
        --------
        datetime
            The full timestamp for the next backup.
        """
        return int(self.backup_at.timestamp())

    def update_next_backup_date(self):
        """
        Updates the next backup date based on the frequency.
        """

        if self.frequency.lower() == "minutely":
            self.backup_at += timedelta(minutes=self.frequency_adjust_value)
        elif self.frequency.lower() == "hourly":
            self.backup_at += timedelta(hours=self.frequency_adjust_value)
        elif self.frequency.lower() == "daily":
            self.backup_at += timedelta(days=self.frequency_adjust_value)
        elif self.frequency.lower() == "hourly":
            self.backup_at += timedelta(hours=self.frequency_adjust_value)
        elif self.frequency.lower() == "weekly":
            self.backup_at += timedelta(weeks=self.frequency_adjust_value)
        elif self.frequency.lower() == "monthly":
            # Adding a month manually
            if self.backup_at.month == 12:
                self.backup_at = self.backup_at.replace(
                    year=self.backup_at.year + 1, month=self.frequency_adjust_value
                )
            else:
                self.backup_at = self.backup_at.replace(
                    month=self.backup_at.month + self.frequency_adjust_value
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

    def get_timestamp_for_backup(self):
        # Get the current date
        today = datetime.today()
        # Create a datetime object with the specified hour and minute
        self.backup_at = datetime.combine(
            today, datetime.time(hour=self.start_hours, minute=self.start_minutes)
        )
        # Convert the datetime object to a timestamp (number of seconds since Unix epoch)
        return int(self.backup_at.timestamp())

    @staticmethod
    def convert_24h_to_12h_format(time: str):
        d = datetime.strptime(time, "%H:%M")
        return d.strftime("%I:%M %p")

    @staticmethod
    def generate_backup_name(database_name):
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        file_name_or_directory = f"{database_name}_backup_{timestamp}"
        return file_name_or_directory
