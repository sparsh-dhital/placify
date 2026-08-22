import os


APP_NAME = os.getenv("APP_NAME", "Placify API")
API_PREFIX = "/api"
DEBUG = os.getenv("DEBUG", "true").lower() == "true"
