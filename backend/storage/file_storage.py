import os
import uuid
from flask import Flask
from datetime import datetime
from .constant import UPLOAD_FOLDER, IMG_ALLOWED_EXTENSIONS


class FileStorage:

    def __init__(self):
        pass

    def save_img(self, file, app: Flask):

        file_path = ""
        actual_filename = ""
        new_filename = ""
        try:

            # Get file extension
            file_extension = file.filename.split(".")[1].lower().strip()
            if file_extension not in IMG_ALLOWED_EXTENSIONS:
                err_txt = "Invalid file extension. Only the following extensions are allowed: "
                raise ValueError(err_txt + ", ".join(IMG_ALLOWED_EXTENSIONS))

            # Get storage path
            root_path = UPLOAD_FOLDER

            actual_filename = file.filename

            # Build file path
            root_path = root_path.replace("\\", "/")
            new_filename = self.build_file_name(file_extension, "img")
            file_path = os.path.join(app.config["UPLOAD_FOLDER"], new_filename)

            # Save file
            file.save(file_path)

            # PERMIT READ FILE
            try:
                os.chmod(file_path, 0o777)
            except Exception as e:
                print(str(e))
            # END PERMIT READ FILE

        except Exception as e:
            print(str(e))
            raise ValueError(f"Error occur when saving file: {str(e)}")

        else:
            return {
                "filename": new_filename,
                "actual_filename": actual_filename,
            }

    def build_file_name(file_extension, prefix):
        new_filename = (
            f'{prefix}_{uuid.uuid4()}_{datetime.now().strftime("%d%m%y%I%M%S")}'
        )
        new_filename = f"{new_filename}.{file_extension}".replace("-", "_")
        return new_filename
