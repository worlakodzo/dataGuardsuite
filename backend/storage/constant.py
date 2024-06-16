import os

UPLOAD_FOLDER = os.path.join(
    "static", f"{os.environ.get('FILE_STORAGE_PATH','sample_vol/media')}/img"
)
IMG_ALLOWED_EXTENSIONS = set(["txt", "pdf", "png", "jpg", "jpeg", "gif"])
DOC_ALLOWED_EXTENSIONS = set(["txt", "pdf"])

DB_BACKUP_FREQUENCY = {"daily": "Daily", "weekly": "Weekly", "monthly": "Monthly"}

BACKUP_STATUS = {
    "in_progress": "In Progress",
    "completed": "Completed",
    "failed": "Failed",
}
BACKUP_TYPE = {"manual": "Manual", "scheduled": "Scheduled"}

CLOUD_PROVIDERS = [{"name": "AWS", "provider_type": "aws"}]
