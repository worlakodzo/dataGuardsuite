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

    def __init__(self, username: str, email: str, password: str):
        """
        Initializes a new User instance.
        """

        self._id = str(uuid.uuid4())
        self.username = username
        self.email = email
        self.password_hash = self.hashed_password(password)
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.is_active = True
        self.email_verified = False
        self.role_details = {"name": "Admin", "role": "admin"}
        self.user_profile = {
            "bio": "",
            "profile_photo_url": "",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }

    def hashed_password(raw_password):
        # hash password and return hashed value
        return bcrypt.generate_password_hash(raw_password).decode("utf-8")

    def is_authenticated(self, raw_password):
        new_hashed_password = self.hashed_password(raw_password)

        # return true if new-hashed password
        # is equal to user hashed password in database
        if self.password_hash == new_hashed_password:
            return True
        else:
            return False

    def save(self):
        """
        Save or Update the current instance to the MongoDB 'user' collection.
        Returns:
            pymongo.results.InsertOneResult or pymongo.results.Upsert:
            The result of the insert operation.
        """
        if not hasattr(self, "update_document"):
            res = mongo_db.user.insert_one(self.__dict__)
        else:
            # Update existing document
            new_value = self.__dict__
            del new_value["_id"]
            del new_value["update_document"]
            res = mongo_db.user.update_one({"_id": self._id}, new_value)
        return res

    def send_recovery_email(self):
        recovery_token = create_access_token(identity=self.email, expires_delta=False)
        msg = Message(
            "Password Recovery",
            sender=os.environ.get("MAIL_USERNAME"),
            recipients=[self.email],
        )
        msg.body = f"Your password recovery token is: {recovery_token}"
        mail.send(msg)
