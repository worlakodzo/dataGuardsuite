from flask import Blueprint, jsonify, request, url_for, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..model.datastore import Datastore, DatastoreType, BackupFrequencyType

datastore_app = Blueprint("datastore_app", __name__, url_prefix="/datastores")


@datastore_app.route("/", methods=["GET", "POST"], strict_slashes=False)
@jwt_required()
def datastores():
    identity = get_jwt_identity()
    if request.method == "GET":
        datastores = Datastore.filter({"master_user_id": identity["master_user_id"]})
        datastores_dict = []
        for datastore in datastores:
            datastores_dict.append(datastore.to_dict())

        datastore_types = DatastoreType.filter({})
        datastore_types_dict = [d_type.to_dict() for d_type in datastore_types]
        backup_frequency_types = BackupFrequencyType.filter({})
        backup_frequency_types_dict = [
            b_type.to_dict() for b_type in backup_frequency_types
        ]

        return (
            jsonify(
                {
                    "datastores": datastores_dict,
                    "datastore_types": datastore_types_dict,
                    "backup_frequency_types": backup_frequency_types_dict,
                }
            ),
            200,
        )

    elif request.method == "POST":
        data = request.get_json()
        data["user_id"] = identity["user_id"]
        data["master_user_id"] = identity["master_user_id"]
        new_datastore = Datastore(**data)
        res = new_datastore.save()
        datastore = Datastore.filter({"_id": res.inserted_id})[0]
        return (
            jsonify(
                {
                    "msg": "Datastore created successfully",
                    "datastore": datastore.to_dict(),
                }
            ),
            201,
        )


@datastore_app.route(
    "/<string:datastore_id>",
    methods=["GET", "PUT", "DELETE"],
    strict_slashes=False,
)
@jwt_required()
def datastore_details(datastore_id):
    try:
        try:
            datastore = Datastore.filter({"_id": datastore_id})[0]
        except:
            return jsonify({"msg": "Datastore not found"}), 404

        if request.method == "GET":
            return jsonify(datastore.to_dict()), 200

        elif request.method == "PUT":
            data = request.get_json()
            datastore.update(data)
            datastore = Datastore.filter({"_id": datastore_id})[0]
            return (
                jsonify(
                    {
                        "msg": "Datastore updated successfully",
                        "datastore": datastore.to_dict(),
                    }
                ),
                200,
            )

        elif request.method == "DELETE":
            datastore.delete()
            return jsonify({"msg": "Datastore deleted successfully"}), 204

    except Exception as err:
        print(str(err))
        abort(500)
