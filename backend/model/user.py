import os
import uuid
from .. import mongo_db
from datetime import datetime
from flask_mail import Message
from flask_jwt_extended import create_access_token
from .. import mail, bcrypt


class User:
    """
    This class represent a user.
    """

    __collection_name = "user"

    @classmethod
    def collection_name(cls):
        return cls.__collection_name

    def __init__(
        self,
        username: str,
        email: str,
        password: str,
        phone: str = "",
        master_user_id: str = "",
    ):
        """
        Initializes a new User instance.
        """

        self._id = str(uuid.uuid4())
        self.master_user_id = master_user_id if master_user_id else self._id
        self.username = username
        self.email = email
        self.password_hash = self.get_hashed_password(password)
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.is_active = True
        self.email_verified = False
        self.role_details = {"name": "Admin", "role": "admin"}
        self.user_profile = {
            "bio": "",
            "job_title": "",
            "address": "",
            "phone": phone,
        }
        self.email_notification = {
            "changes_to_user_info": True,
            "daily_update_on_jobs": True,
            "new_db_credential_added": True,
            "security_alerts": True,
        }
        self.photo = "default.png"

    def get_hashed_password(self, raw_password: str):
        # hash password and return hashed value
        return bcrypt.generate_password_hash(raw_password).decode("utf-8")

    def is_authenticated(self, raw_password):
        # return true if new-hashed password
        # is equal to user hashed password in database
        return bcrypt.check_password_hash(self.password_hash, raw_password)

    def save(self):
        """
        Save or Update the current instance to the MongoDB 'user' collection.
        Returns:
            pymongo.results.InsertOneResult or pymongo.results.Upsert:
            The result of the insert operation.
        """
        if not hasattr(self, "update_document"):
            # Insert a new document
            res = mongo_db.user.insert_one(self.__dict__)
        else:
            # Update existing document
            new_value = self.__dict__.copy()
            del new_value["_id"]
            del new_value["update_document"]
            res = mongo_db.user.update_one({"_id": self._id}, {"$set": new_value})
        return res

    def update(self, data):
        for key, value in data.items():
            setattr(self, key, value)
        self.updated_at = datetime.utcnow()
        self.save()

    def delete(self):
        res = mongo_db.user.delete_one({"_id": self._id})
        return res

    def change_password(self, data):
        self.password_hash = self.get_hashed_password(data["password"])
        self.save()

    def send_recovery_email(self):
        recovery_token = create_access_token(identity=self.email, expires_delta=False)
        msg = Message(
            "Password Recovery",
            sender=os.environ.get("MAIL_USERNAME"),
            recipients=[self.email],
        )
        msg.body = f"Your password recovery token is: {recovery_token}"
        mail.send(msg)

    @staticmethod
    def email_exists(email: str) -> bool:
        """
        Filters documents from a MongoDB collection based on email.
        Returns:
            True or False
        """
        # Retrieve documents matching the query
        res = mongo_db.user.find_one({"email": email})
        if res:
            return True
        return False

    @staticmethod
    def username_exists(username: str) -> bool:
        """
        Filters documents from a MongoDB collection based on username.
        Returns:
            True or False
        """
        # Retrieve documents matching the query
        res = mongo_db.user.find_one({"username": username})
        if res:
            return True
        return False

    @staticmethod
    def filter(query: dict, projection=None) -> list:
        """
        Filters documents from a MongoDB collection based on a query.

        Args:
            query (dict): The query to filter documents.
            projection (dict, optional): The fields to include or exclude. Defaults to None.
        Returns:
            list: A list of filtered documents converted to user instance.
        """
        # Retrieve documents matching the query
        res = mongo_db.user.find(query, projection)

        objects = []
        for _, document in enumerate(res):
            new_obj = User(None, None, "None")
            for key, value in document.items():
                setattr(new_obj, key, value)

            setattr(new_obj, "update_document", True)
            objects.append(new_obj)

        return objects

    def to_dict(self, photo_url):
        """
        Convert user instance to dictionary.
        """
        data_dict = self.__dict__
        data_dict["created_at"] = self.created_at.isoformat()
        data_dict["updated_at"] = self.updated_at.isoformat()
        data_dict["photo_url"] = photo_url
        return data_dict
