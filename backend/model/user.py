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
        # import hash library
        from hashlib import sha256

        # hash password and return hashed value
        return sha256(str(raw_password).encode("utf-8")).hexdigest()

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
        Save the current instance to the MongoDB 'user' collection.
        Returns:
            pymongo.results.InsertOneResult: The result of the insert operation.
        """
        res = mongo_db.user.insert_one(self.__dict__)
        return res
