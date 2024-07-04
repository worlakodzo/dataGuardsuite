import json
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


def load_default_datastore_engine(db):

    datastore_types_json = []

    with open(f"{BASE_DIR}/db/datastore-engine.json", "r") as file:
        file_contents = file.read()
        datastore_types_json = json.loads(file_contents)

    for value in datastore_types_json:
        type_ = db.datastore_type.find_one({"_id": value["_id"]})

        if not type_:
            db.datastore_type.insert_one(value)


def load_default_storage_providers(db):

    storage_providers_json = []

    with open(f"{BASE_DIR}/db/storage-providers.json", "r") as file:
        file_contents = file.read()
        storage_providers_json = json.loads(file_contents)

    for value in storage_providers_json:
        type_ = db.datastore_type.find_one({"_id": value["_id"]})

        if not type_:
            db.datastore_type.insert_one(value)


def load_default_backup_frequency(db):

    job_duration_intervals = []

    with open(f"{BASE_DIR}/db/backup-frequency-type.json", "r") as file:
        file_contents = file.read()
        job_duration_intervals = json.loads(file_contents)

    for value in job_duration_intervals:
        interval = db.backup_frequency_type.find_one({"_id": value["_id"]})

        if not interval:
            db.backup_frequency_type.insert_one(value)


def delete_old_default_data(db):
    db.datastore_type.delete_many({})
    db.backup_frequency_type.delete_many({})
