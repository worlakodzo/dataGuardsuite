from flask import Blueprint, jsonify, request, url_for, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..model.datastore import Datastore, BackupFrequencyType
from ..model.job import BackupSchedule


job_app = Blueprint("job_app", __name__, url_prefix="/jobs")


@job_app.route("/", methods=["GET", "POST"], strict_slashes=False)
@jwt_required()
def jobs():
    identity = get_jwt_identity()
    if request.method == "GET":
        jobs = BackupSchedule.filter({"master_user_id": identity["master_user_id"]})
        jobs_dict = []
        for job in jobs:
            job_dict = job.to_dict()
            job_dict["datastore_engine"] = Datastore.filter(
                {"_id": job.datastore_engine_id}
            )[0].to_dict()
            job_dict["storage_provider"] = Datastore.filter(
                {"_id": job.storage_provider_id}
            )[0].to_dict()
            jobs_dict.append(job_dict)

        return jsonify({"jobs": jobs_dict}), 200

    elif request.method == "POST":
        data = request.get_json()

        # Get timestamp
        time_split = data["start_time"].split(":")
        hours = int(time_split[0])
        minutes = int(time_split[0])

        data["user_id"] = identity["user_id"]
        data["master_user_id"] = identity["master_user_id"]
        data["start_hours"] = hours
        data["start_minutes"] = minutes

        print(data)
        new_job = BackupSchedule(**data)
        res = new_job.save()
        job = BackupSchedule.filter({"_id": res.inserted_id})[0]
        return (
            jsonify(
                {
                    "msg": "Job created successfully",
                    "job": job.to_dict(),
                }
            ),
            201,
        )


@job_app.route(
    "/<string:datastore_id>",
    methods=["GET", "PUT", "DELETE", "PATCH"],
    strict_slashes=False,
)
@jwt_required()
def job_details(job_id):
    try:
        try:
            job = BackupSchedule.filter({"_id": job_id})[0]
        except:
            return jsonify({"msg": "Job not found"}), 404

        if request.method == "GET":
            return jsonify(job.to_dict()), 200

        elif request.method == "PUT":
            data = request.get_json()
            job.update(data)
            job = BackupSchedule.filter({"_id": job_id})[0]
            return (
                jsonify(
                    {
                        "msg": "Job updated successfully",
                        "job": job.to_dict(),
                    }
                ),
                200,
            )

        elif request.method == "DELETE":
            job.delete()
            return jsonify({"msg": "Job deleted successfully"}), 204

        elif request.method == "PATCH":
            data = request.get_json()
            job.change_password(data)
            return jsonify(job.to_dict()), 200

    except Exception as err:
        print(str(err))
        abort(500)


@job_app.route("/generalinfo", methods=["GET"], strict_slashes=False)
@jwt_required()
def general_info():
    identity = get_jwt_identity()
    if request.method == "GET":
        datastores = Datastore.filter({"master_user_id": identity["master_user_id"]})
        datastores_dict = []
        for datastore in datastores:
            datastores_dict.append(datastore.to_dict())

        backup_frequency_types = BackupFrequencyType.filter({})
        backup_frequency_types_dict = [
            b_type.to_dict() for b_type in backup_frequency_types
        ]

        return (
            jsonify(
                {
                    "datastores": datastores_dict,
                    "backup_frequency_types": backup_frequency_types_dict,
                }
            ),
            200,
        )
