import uuid
from .. import mongo_db
from datetime import datetime


class User:
    """
    This class represent a user.
    """

    __collection_name = "user"

    @classmethod
    def collection_name(cls):
        return cls.__collection_name

    def __init__(self, username: str, email: str, password_hash: str):
        """
        Initializes a new User instance.
        """

        self._id = str(uuid.uuid4())
        self.username = username
        self.email = email
        self.password_hash = password_hash
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
