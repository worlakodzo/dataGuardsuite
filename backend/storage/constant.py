import os


UPLOAD_FOLDER = os.path.join(
    "static", f"{os.environ.get('FILE_STORAGE_PATH','sample_vol/media')}/img"
)
IMG_ALLOWED_EXTENSIONS = set(["txt", "pdf", "png", "jpg", "jpeg", "gif"])
DOC_ALLOWED_EXTENSIONS = set(["txt", "pdf"])
