import os
import base64, hashlib
from cryptography.fernet import Fernet


PASSWORD = os.environ.get(
    "DATA_ENCRYPTION_PASSWORD", "idyh^nc6$)uxh_*$p6+pg6f-7oq-jth(^ke0#kzm0jhu0==lv6"
)
# https://djecrety.ir/
# https://stackoverflow.com/questions/34902378/where-do-i-get-secret-key-for-flask
SALT = "la#0@1$*x8m2$obe8c@f$@c)_o!wg0j+5%(^n_c@q(n97x04fe"
PASSWORD_AND_SALT = f"{PASSWORD}={SALT}"


def gen_fernet_key(password: bytes) -> bytes:
    assert isinstance(password, bytes)

    hlib = hashlib.md5()
    hlib.update(password)
    return base64.urlsafe_b64encode(hlib.hexdigest().encode("latin-1"))


# Generate a secret key
# key = Fernet.generate_key()
key = gen_fernet_key(PASSWORD_AND_SALT.encode("utf-8"))

# Create a Fernet object with the secret key
fernet = Fernet(key)


def encrypt(text):
    # Encrypt the text
    encrypted_text = fernet.encrypt(text.encode("utf-8"))
    return encrypted_text


def decrypt(encrypted_text):
    # Decrypt the text
    decrypted_text = fernet.decrypt(encrypted_text).decode("utf-8")
    return decrypted_text
