from flask import Blueprint, jsonify, request, url_for, abort
from flask_jwt_extended import jwt_required
from ..model.datastore import Datastore, DatastoreType, BackupFrequencyType

datastore_app = Blueprint("datastore_app", __name__, url_prefix="/datastores")


@jwt_required()
@datastore_app.route("/", methods=["GET", "POST"], strict_slashes=False)
def datastores():
    if request.method == "GET":
        datastores = Datastore.filter({})
        datastores_dict = []
        for datastore in datastores:
            datastores_dict.append(datastore.to_dict())

        datastore_types = DatastoreType.filter({})
        datastore_types_dict = [d_type.to_dict() for d_type in datastore_types]
        backup_frequency_types = BackupFrequencyType.filter({})
        backup_frequency_types_dict = [b_type.to_dict() for b_type in backup_frequency_types]

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
        new_datastore = Datastore(**data)
        res = new_datastore.save()
        return (
            jsonify(
                {
                    "msg": "Datastore created successfully",
                    "datastore_id": res.inserted_id,
                }
            ),
            201,
        )


@jwt_required()
@datastore_app.route(
    "/<string:datastore_id>",
    methods=["GET", "PUT", "DELETE", "PATCH"],
    strict_slashes=False,
)
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
            return jsonify(datastore.to_dict()), 200

        elif request.method == "DELETE":
            datastore.delete()
            return jsonify({"msg": "Datastore deleted successfully"}), 204

        elif request.method == "PATCH":
            data = request.get_json()
            datastore.change_password(data)
            return jsonify(datastore.to_dict()), 200

    except Exception as err:
        print(str(err))
        abort(500)

