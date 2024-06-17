from dotenv import dotenv_values, find_dotenv


class Appenv:
    def __init__(self):
        # Load environment variables from a .env file
        self.env = dotenv_values(find_dotenv())
